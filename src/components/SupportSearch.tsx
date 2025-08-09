import { useCallback, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { resources, Resource, ResourceCategory } from "@/data/resources";
import { MapPin, Navigation, Search, Globe2, ExternalLink, Phone } from "lucide-react";
import GoogleMap from "./GoogleMap";
import MapToggle from "./MapToggle";

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

const categories: ("All" | ResourceCategory)[] = [
  "All",
  ...Array.from(new Set(resources.map((r) => r.category))) as ResourceCategory[],
];

export default function SupportSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [radius, setRadius] = useState<number>(25);
  const [userLoc, setUserLoc] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"address" | "zipcode" | "city">("address");
  const [showMap, setShowMap] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('googleMapsApiKey') || '');

  // Save API key to localStorage
  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem('googleMapsApiKey', key);
  }, []);

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
            <MapToggle
              showMap={showMap}
              onToggle={setShowMap}
              apiKey={apiKey}
              onApiKeyChange={handleApiKeyChange}
            />
          )}

          <div className="pt-2 text-sm text-muted-foreground">
            {userLoc ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location set. Showing results within {radius} km.
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
                onResourceSelect={(resource) => setSelectedResourceId(resource.id)}
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
                    onSelect={() => setSelectedResourceId(r.id)}
                  />
                ))}
              </div>
            )}
            {filtered.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No resources within {radius} km. Try increasing the radius or a nearby city.
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

      <p className="mt-8 text-xs text-muted-foreground">
        Disclaimer: Information is provided as a convenience and may change. Please contact organizations directly to confirm details.
      </p>
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
        {typeof (resource as any).distance === "number" && (
          <div className="text-sm text-muted-foreground">
            {(resource as any).distance.toFixed(1)} km away
          </div>
        )}
      </CardContent>
    </Card>
  );
}
