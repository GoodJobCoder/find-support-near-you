import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Globe, Navigation, ArrowLeft } from "lucide-react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  lat: number;
  lng: number;
  distance?: number;
  isOpen?: boolean;
  openingHours?: string[];
}

interface LatLng {
  lat: number;
  lng: number;
}

const haversine = (a: LatLng, b: LatLng): number => {
  const R = 3959; // Earth radius in miles
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const a1 = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1));
  return R * c;
};

export default function Pharmacy() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [radius] = useState(10); // 10 mile radius
  
  const { isLoaded } = useGoogleMaps();
  const navigate = useNavigate();
  const { toast } = useToast();

  const doGeolocate = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Please enter your address manually.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        fetchNearbyPharmacies(loc);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Location access denied",
          description: "Please enter your address manually.",
          variant: "destructive",
        });
        setLoading(false);
      }
    );
  };

  const geocode = async () => {
    if (!searchQuery.trim() || !isLoaded) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const loc = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        setUserLocation(loc);
        fetchNearbyPharmacies(loc);
      } else {
        toast({
          title: "Location not found",
          description: "Please try a different address.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast({
        title: "Search failed",
        description: "Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fetchNearbyPharmacies = async (location: LatLng) => {
    if (!isLoaded) return;

    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: radius * 1609.34, // Convert miles to meters
        type: 'pharmacy',
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const pharmacyData: Pharmacy[] = results.map((place, index) => ({
            id: place.place_id || `pharmacy-${index}`,
            name: place.name || "Unknown Pharmacy",
            address: place.vicinity || "Address not available",
            rating: place.rating,
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
            isOpen: place.opening_hours?.open_now,
          }));

          // Get detailed information for each pharmacy
          const detailedPharmacies = pharmacyData.map(pharmacy => {
            if (pharmacy.id && pharmacy.id.startsWith('pharmacy-') === false) {
              service.getDetails(
                { placeId: pharmacy.id, fields: ['formatted_phone_number', 'website', 'opening_hours'] },
                (details, detailStatus) => {
                  if (detailStatus === google.maps.places.PlacesServiceStatus.OK && details) {
                    pharmacy.phone = details.formatted_phone_number;
                    pharmacy.website = details.website;
                    pharmacy.openingHours = details.opening_hours?.weekday_text;
                  }
                }
              );
            }
            return pharmacy;
          });

          setPharmacies(detailedPharmacies);
        } else {
          toast({
            title: "No pharmacies found",
            description: "Try expanding your search area.",
            variant: "destructive",
          });
        }
        setLoading(false);
      });
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
      toast({
        title: "Search failed",
        description: "Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const filteredPharmacies = useMemo(() => {
    if (!userLocation) return [];
    return pharmacies
      .map((pharmacy) => ({
        ...pharmacy,
        distance: haversine(userLocation, { lat: pharmacy.lat, lng: pharmacy.lng }),
      }))
      .filter((pharmacy) => pharmacy.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }, [userLocation, pharmacies, radius]);

  const openInMaps = (pharmacy: Pharmacy) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${pharmacy.name} ${pharmacy.address}`
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Support Resources
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Find Pharmacies</h1>
          <p className="text-muted-foreground">
            Locate nearby pharmacies and medication services in your area
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search for Pharmacies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter your address, city, or ZIP code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && geocode()}
                disabled={loading}
                className="flex-1"
              />
              <Button onClick={geocode} disabled={loading || !searchQuery.trim()}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              onClick={doGeolocate}
              disabled={loading}
              className="w-full"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Use My Current Location
            </Button>
          </CardContent>
        </Card>

        {filteredPharmacies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Found {filteredPharmacies.length} pharmacies near you
            </h2>
            
            {filteredPharmacies.map((pharmacy) => (
              <Card key={pharmacy.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {pharmacy.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        {pharmacy.rating && (
                          <Badge variant="secondary">
                            ⭐ {pharmacy.rating.toFixed(1)}
                          </Badge>
                        )}
                        {pharmacy.isOpen !== undefined && (
                          <Badge variant={pharmacy.isOpen ? "default" : "destructive"}>
                            {pharmacy.isOpen ? "Open" : "Closed"}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {pharmacy.distance?.toFixed(1)} mi
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{pharmacy.address}</span>
                    </div>
                    
                    {pharmacy.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{pharmacy.phone}</span>
                      </div>
                    )}
                    
                    {pharmacy.website && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>{pharmacy.website}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {pharmacy.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={`tel:${pharmacy.phone}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </a>
                      </Button>
                    )}
                    
                    {pharmacy.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={pharmacy.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="mr-2 h-4 w-4" />
                          Website
                        </a>
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInMaps(pharmacy)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Open in Maps
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredPharmacies.length === 0 && userLocation && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No pharmacies found in your area. Try expanding your search or check a different location.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}