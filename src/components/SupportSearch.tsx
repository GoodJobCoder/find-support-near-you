import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MapPin, Phone, Globe, Search, Locate, ExternalLink, MessageSquare, Scale, Info } from "lucide-react";
import { Resource, ResourceCategory, resources as staticResources } from "@/data/resources";
import GoogleMap from "./GoogleMap";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/context/ChatContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useComparison } from "@/hooks/useComparison";
import MapToggle from "./MapToggle";
import ResourceDetails from "./ResourceDetails";
import EmergencySection from "./EmergencySection";
import FavoritesSection from "./FavoritesSection";
import LanguageSelector from "./LanguageSelector";
import ResourceComparison from "./ResourceComparison";
import CalendarSection from "./CalendarSection";
import AvailabilityStatus from "./AvailabilityStatus";
import { useLanguage } from "@/context/LanguageContext";

interface LatLng { lat: number; lng: number }

function haversine(a: LatLng, b: LatLng) {
  const R = 6371; // km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDlat = Math.sin(dLat / 2);
  const sinDlon = Math.sin(dLon / 2);
  const c = 2 * Math.asin(
    Math.sqrt(
      sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon
    )
  );
  return R * c;
}

const categories = ["All", "Support Group", "Treatment Center", "Counseling", "Financial Aid", "Hospice", "Transportation"] as const;

export default function SupportSearch() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [radius, setRadius] = useState<number>(25);
  const [userLoc, setUserLoc] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"address" | "zipcode" | "city">("address");
  const [showMap, setShowMap] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [fetchingPlaces, setFetchingPlaces] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const { isLoaded: googleMapsLoaded, error: googleMapsError } = useGoogleMaps();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { addToComparison, removeFromComparison, isInComparison, comparisonList } = useComparison();
  const { toast } = useToast();
  const apiKey = "AIzaSyDU4S7X8HQy4-T0JKL66E54BXoBo8yiy9k";

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setOpen, setResource, setInitialQuestion } = useChat();

  useEffect(() => {
    const id = searchParams.get('resource');
    setSelectedResourceId(id);
  }, [searchParams]);

  const doGeolocate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Geolocation not supported", description: "Your browser does not support location access." });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLoc({ lat: latitude, lng: longitude });
        setLoading(false);
        toast({ title: "Location set", description: "Using your current location." });
      },
      (err) => {
        setLoading(false);
        toast({ title: "Location denied", description: err.message });
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 }
    );
  }, []);

  const geocode = useCallback(async () => {
    if (!query.trim()) {
      toast({ title: "Enter a place", description: "Type a city, postcode, or address." });
      return;
    }
    try {
      setLoading(true);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
      });
      const data: any[] = await res.json();
      if (!data.length) {
        toast({ title: "No match found", description: "Try a different place or use your location." });
        setLoading(false);
        return;
      }
      const top = data[0];
      setUserLoc({ lat: parseFloat(top.lat), lng: parseFloat(top.lon) });
      toast({ title: "Location set", description: top.display_name });
    } catch (e: any) {
      toast({ title: "Geocoding failed", description: e?.message ?? "Please try again." });
    } finally {
      setLoading(false);
    }
  }, [query]);

  const filtered = useMemo(() => {
    if (!userLoc) return [] as (Resource & { distance: number })[];
    let filteredResources = resources
      .filter((r) => (category === "All" ? true : r.category === category))
      .map((r) => ({ ...r, distance: haversine(userLoc, { lat: r.lat, lng: r.lng }) }))
      .filter((r) => r.distance <= radius);

    return filteredResources.sort((a, b) => a.distance - b.distance);
  }, [userLoc, category, radius, resources]);

  const selectedResource = useMemo(() => {
    if (!selectedResourceId) return null;
    return (
      filtered.find((r) => r.id === selectedResourceId) ||
      resources.find((r) => r.id === selectedResourceId) ||
      null
    );
  }, [selectedResourceId, filtered]);

  const openResource = useCallback((id: string) => {
    setSelectedResourceId(id);
    const params = new URLSearchParams(window.location.search);
    params.set("resource", id);
    navigate({ search: params.toString() }, { replace: false });
  }, [navigate]);

  const closeResource = useCallback(() => {
    setSelectedResourceId(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("resource");
    navigate({ search: params.toString() }, { replace: false });
  }, [navigate]);

  const fetchNearbyPlaces = useCallback(async (location: LatLng) => {
    if (!googleMapsLoaded || !window.google?.maps?.places) {
      toast({ title: "Maps not loaded", description: "Please wait for Google Maps to load." });
      return;
    }

    setFetchingPlaces(true);
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    const newResources: Resource[] = [];

    const searchQueries: { category: ResourceCategory; keywords: string[] }[] = [
      { category: "Support Group", keywords: ["cancer support group", "support group", "patient support"] },
      { category: "Treatment Center", keywords: ["cancer center", "oncology center", "hospital oncology", "cancer treatment"] },
      { category: "Counseling", keywords: ["cancer counseling", "oncology counselor", "therapy"] },
      { category: "Financial Aid", keywords: ["cancer financial assistance", "patient financial services", "charity financial aid"] },
      { category: "Hospice", keywords: ["hospice care", "palliative care", "end of life care"] },
      { category: "Transportation", keywords: ["medical transport", "patient transport", "healthcare transport"] }
    ];

    try {
      const promises = searchQueries.map(({ category, keywords }) => 
        Promise.all(keywords.map(keyword => 
          new Promise<google.maps.places.PlaceResult[]>((resolve) => {
            const request: google.maps.places.TextSearchRequest = {
              query: `${keyword} near me`,
              location: new window.google.maps.LatLng(location.lat, location.lng),
              radius: radius * 1000,
            };

            service.textSearch(request, (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                resolve(results);
              } else {
                resolve([]);
              }
            });
          })
        ))
      );

      const allResults = await Promise.all(promises);
      
      const uniquePlaces = new Map<string, { place: google.maps.places.PlaceResult; category: ResourceCategory }>();
      
      allResults.forEach((categoryResults, categoryIndex) => {
        const category = searchQueries[categoryIndex].category;
        categoryResults.forEach(keywordResults => {
          keywordResults.forEach(place => {
            if (place.place_id && place.geometry?.location && place.name) {
              if (!uniquePlaces.has(place.place_id)) {
                uniquePlaces.set(place.place_id, { place, category });
              }
            }
          });
        });
      });

      const detailPromises = Array.from(uniquePlaces.entries()).map(([placeId, { place, category }]) =>
        new Promise<Resource | null>((resolve) => {
          const request: google.maps.places.PlaceDetailsRequest = {
            placeId: placeId,
            fields: [
              'place_id', 'name', 'formatted_address', 'vicinity', 
              'formatted_phone_number', 'website', 'geometry', 
              'opening_hours', 'rating', 'business_status'
            ]
          };

          service.getDetails(request, (placeDetails, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && placeDetails) {
              resolve({
                id: placeDetails.place_id || placeId,
                name: placeDetails.name || place.name,
                category: category,
                lat: placeDetails.geometry?.location?.lat() || place.geometry!.location!.lat(),
                lng: placeDetails.geometry?.location?.lng() || place.geometry!.location!.lng(),
                address: placeDetails.formatted_address || place.formatted_address || "",
                city: placeDetails.vicinity || place.vicinity || "",
                country: "United States",
                phone: placeDetails.formatted_phone_number || undefined,
                website: placeDetails.website || undefined
              });
            } else {
              resolve({
                id: place.place_id!,
                name: place.name!,
                category: category,
                lat: place.geometry!.location!.lat(),
                lng: place.geometry!.location!.lng(),
                address: place.formatted_address || "",
                city: place.vicinity || "",
                country: "United States",
                phone: undefined,
                website: undefined
              });
            }
          });
        })
      );

      const detailedResults = await Promise.all(detailPromises);
      const validResources = detailedResults.filter((resource): resource is Resource => resource !== null);

      setResources(validResources);
      toast({ 
        title: "Places loaded", 
        description: `Found ${validResources.length} nearby resources with detailed information.` 
      });
    } catch (error) {
      console.error("Error fetching places:", error);
      toast({ 
        title: "Error fetching places", 
        description: "Could not load nearby resources. Please try again." 
      });
    } finally {
      setFetchingPlaces(false);
    }
  }, [radius, googleMapsLoaded]);

  useEffect(() => {
    if (userLoc) {
      fetchNearbyPlaces(userLoc);
    }
  }, [userLoc, fetchNearbyPlaces]);

  const ResourceCard = ({ resource, isSelected, onSelect, isFavorite }: {
    resource: Resource & { distance?: number };
    isSelected: boolean;
    onSelect: () => void;
    isFavorite: boolean;
  }) => (
    <Card className={`border transition-colors hover:border-primary/50 ${isSelected ? "border-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight">{resource.name}</h3>
              <p className="text-sm text-muted-foreground">{resource.category}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(resource.id)}
                className="h-8 w-8 p-0"
              >
                <Heart 
                  className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isInComparison(resource.id)) {
                    removeFromComparison(resource.id);
                  } else {
                    const success = addToComparison(resource.id);
                    if (!success) {
                      toast({ title: "Comparison Full", description: "You can only compare up to 3 resources at a time." });
                    }
                  }
                }}
                className={`h-8 w-8 p-0 ${isInComparison(resource.id) ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <Scale className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">{resource.address}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {resource.city}{resource.state ? `, ${resource.state}` : ''}, {resource.country}
            </p>
            {resource.distance && (
              <p className="text-sm text-muted-foreground">
                📍 {resource.distance.toFixed(1)} {t('kmAway')}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {resource.phone && (
              <Button variant="outline" size="sm" onClick={() => window.open(`tel:${resource.phone}`)}>
                <Phone className="w-4 h-4 mr-1" />
                {t('callNow')}
              </Button>
            )}
            {resource.website && (
              <Button variant="outline" size="sm" onClick={() => window.open(resource.website, '_blank')}>
                <Globe className="w-4 h-4 mr-1" />
                {t('visitWebsite')}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openResource(resource.id)}
            >
              <Info className="w-4 h-4 mr-1" />
              {t('viewDetails')}
            </Button>
          </div>

          <Button
            onClick={() => {
              setOpen(true);
              setResource(resource);
              setInitialQuestion(`I would like to know more about ${resource.name}. Can you help me with information about their services?`);
            }}
            className="w-full"
            size="sm"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {t('askAbout')} {resource.name}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">{t('searchForResources')}</TabsTrigger>
          <TabsTrigger value="favorites">
            {t('favorites')} ({filtered.filter(r => isFavorite(r.id)).length})
          </TabsTrigger>
          <TabsTrigger value="comparison">
            {t('compareResources')} ({comparisonList.length})
          </TabsTrigger>
          <TabsTrigger value="calendar">{t('myCalendar')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-6">
          <Card className="border border-border/70 shadow-sm backdrop-blur-sm bg-card/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">{t('searchForResources')}</CardTitle>
              <LanguageSelector />
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-[auto,1fr,auto]">
                <div className="w-full sm:w-44">
                  <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                    <SelectTrigger aria-label="Search by" className="w-full">
                      <SelectValue placeholder="Search by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="address">{t('search.address')}</SelectItem>
                      <SelectItem value="zipcode">{t('search.zipcode')}</SelectItem>
                      <SelectItem value="city">{t('search.city')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={mode === 'address' ? 'Enter address (e.g., 123 Main St)' : mode === 'zipcode' ? 'ZIP / Postcode (e.g., 10001)' : 'City (e.g., Boston)'}
                    aria-label={mode === 'address' ? 'Address' : mode === 'zipcode' ? 'ZIP code' : 'City'}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="default"
                    disabled={loading || !query.trim()}
                    onClick={geocode}
                  >
                    {t('search.go')}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={loading}
                    onClick={doGeolocate}
                  >
                    <Locate className="h-4 w-4" /> {t('search.location')}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('search.category')}</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">{t('search.all')}</SelectItem>
                      {categories.slice(1).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-medium">{t('search.radius')}: {radius} km</Label>
                  <Slider value={[radius]} min={5} max={100} step={5} onValueChange={(v) => setRadius(v[0])} />
                </div>
              </div>

              {userLoc && filtered.length > 0 && (
                <MapToggle showMap={showMap} onToggle={setShowMap} />
              )}

              <div className="pt-2 text-sm text-muted-foreground">
                {userLoc ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> 
                    Location set. Showing results within {radius} km.
                    {fetchingPlaces && " • Loading nearby places..."}
                  </div>
                ) : (
                  <div>
                    Tip: set your location to see nearby resources.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <section aria-labelledby="results-heading" className="mt-8" role="region">
            <h2 id="results-heading" className="sr-only">Search results</h2>
            {userLoc ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filtered.length} result{filtered.length === 1 ? "" : "s"} found
                  </p>
                </div>
                {showMap ? (
                  <GoogleMap
                    center={userLoc}
                    resources={filtered}
                    selectedResourceId={selectedResourceId}
                    onResourceSelect={(resource) => openResource(resource.id)}
                    searchRadius={radius}
                    apiKey={apiKey}
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((r) => (
                      <ResourceCard 
                        key={r.id} 
                        resource={r}
                        isSelected={selectedResourceId === r.id}
                        onSelect={() => openResource(r.id)}
                        isFavorite={isFavorite(r.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  Set your location to find nearby support
                </p>
                <p className="text-muted-foreground">
                  Enter an address or use your current location to discover cancer support resources near you.
                </p>
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <FavoritesSection 
            resources={resources}
            onResourceSelect={(resource) => openResource(resource.id)}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <ResourceComparison 
            resources={filtered} 
            onResourceSelect={(resource) => openResource(resource.id)}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarSection resources={filtered} />
        </TabsContent>
      </Tabs>

      {/* Resource Details Dialog */}
      {selectedResource && (
        <Dialog open={!!selectedResource} onOpenChange={(open) => !open && closeResource()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="sr-only">Resource Details</DialogTitle>
            </DialogHeader>
            <ResourceDetails resource={selectedResource} />
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}