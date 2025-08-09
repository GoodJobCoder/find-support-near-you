import { useCallback, useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Resource, ResourceCategory } from "@/data/resources";
import { MapPin, Navigation, Search, Globe2, ExternalLink, Phone, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ResourceDetails from "@/components/ResourceDetails";
import { useNavigate, useSearchParams } from "react-router-dom";
import GoogleMap from "./GoogleMap";
import MapToggle from "./MapToggle";
import { useChat } from "@/context/ChatContext";

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
  const { isLoaded: googleMapsLoaded, error: googleMapsError } = useGoogleMaps();
  const apiKey = "AIzaSyDU4S7X8HQy4-T0JKL66E54BXoBo8yiy9k";

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    return resources
      .filter((r) => (category === "All" ? true : r.category === category))
      .map((r) => ({ ...r, distance: haversine(userLoc, { lat: r.lat, lng: r.lng }) }))
      .filter((r) => r.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }, [userLoc, category, radius]);

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

    // Define search queries for different categories
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
              radius: radius * 1000, // Convert km to meters
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
      
      // Collect unique place IDs to get detailed information
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

      // Fetch detailed information for each unique place
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
                country: "United States", // Most results will be US-based
                phone: placeDetails.formatted_phone_number || undefined,
                website: placeDetails.website || undefined
              });
            } else {
              // Fallback to basic info if details fetch fails
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

  // Auto-fetch places when location changes
  useEffect(() => {
    if (userLoc) {
      fetchNearbyPlaces(userLoc);
    }
  }, [userLoc, fetchNearbyPlaces]);

  return (
    <section className="w-full">
      <Card className="border border-border/70 shadow-sm backdrop-blur-sm bg-card/90">
        <CardHeader>
          <CardTitle className="text-2xl">Search nearby support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-[auto,1fr,auto]">
            <div className="w-full sm:w-44">
              <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                <SelectTrigger aria-label="Search by" className="w-full">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="address">Address</SelectItem>
                  <SelectItem value="zipcode">ZIP code</SelectItem>
                  <SelectItem value="city">City</SelectItem>
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
              <Button onClick={geocode} disabled={loading} className="w-full sm:w-auto">
                <Globe2 className="mr-2 h-4 w-4" /> Search
              </Button>
              <Button onClick={doGeolocate} disabled={loading} variant="secondary" className="w-full sm:w-auto">
                <Navigation className="mr-2 h-4 w-4" /> Use my location
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Search radius</span>
                <span>{radius} km</span>
              </div>
              <Slider value={[radius]} min={5} max={100} step={5} onValueChange={(v) => setRadius(v[0])} />
            </div>
          </div>

          {/* Map Toggle */}
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
                  />
                ))}
              </div>
            )}
            {filtered.length === 0 && !fetchingPlaces && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No resources within {radius} km. Try increasing the radius or searching in a different area.
                </CardContent>
              </Card>
            )}
            {fetchingPlaces && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading nearby places from Google Maps...
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              Results will appear here after you set a location.
            </CardContent>
          </Card>
        )}
      </section>

      {/* Details Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={(o) => !o && closeResource()}>
        <DialogContent className="max-w-none w-screen h-screen sm:rounded-none p-0 bg-background">
          <div className="flex h-full flex-col">
            <div className="border-b px-4 py-3">
              <DialogHeader>
                <DialogTitle>Location details</DialogTitle>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {selectedResource && <ResourceDetails resource={selectedResource} />}
            </div>
            <div className="border-t px-4 py-3 flex justify-end">
              <Button variant="outline" onClick={closeResource}>Back</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ResourceCard({ 
  resource, 
  isSelected = false, 
  onSelect 
}: { 
  resource: Resource & { distance?: number };
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const { openWith } = useChat();
  const navigate = useNavigate();

  return (
    <Card 
      className={`group border border-border/70 hover:border-primary/60 transition-all duration-300 hover:shadow-md cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg leading-tight">
              {resource.name}
            </CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">
              {resource.city}{resource.state ? `, ${resource.state}` : ""} · {resource.country}
            </div>
          </div>
          <Badge>{resource.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {resource.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{resource.address}</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {resource.phone && (
            <a className="inline-flex items-center gap-1 text-primary hover:underline" href={`tel:${resource.phone}`}>
              <Phone className="h-4 w-4" /> {resource.phone}
            </a>
          )}
          {resource.website && (
            <a className="inline-flex items-center gap-1 text-primary hover:underline" href={resource.website} target="_blank" rel="noopener noreferrer">
              Website <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <a
            className="inline-flex items-center gap-1 text-primary hover:underline"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.name + ", " + resource.address + ", " + resource.city)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Maps <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <div className="pt-1">
          <Button size="sm" variant="secondary" onClick={(e) => {
            e.stopPropagation();
            openWith({
              resource: {
                id: (resource as any).id,
                name: resource.name,
                category: String((resource as any).category ?? ""),
                address: resource.address,
                city: resource.city,
                state: (resource as any).state,
                country: resource.country,
                phone: (resource as any).phone,
                website: (resource as any).website,
                lat: (resource as any).lat,
                lng: (resource as any).lng,
              },
            });
            navigate("/");
          }} aria-label="Chat with AI about this location">
            <MessageSquare className="mr-2 h-4 w-4" /> Chat with AI
          </Button>
        </div>
        {typeof (resource as any).distance === "number" && (
          <div className="text-sm text-muted-foreground">
            {(resource as any).distance.toFixed(1)} km away
          </div>
        )}
      </CardContent>
    </Card>
  );
}
