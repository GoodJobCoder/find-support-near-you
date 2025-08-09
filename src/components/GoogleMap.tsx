import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Resource } from '@/data/resources';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface LatLng {
  lat: number;
  lng: number;
}

interface GoogleMapProps {
  center: LatLng;
  resources: (Resource & { distance?: number })[];
  selectedResourceId?: string;
  onResourceSelect?: (resource: Resource) => void;
  searchRadius?: number;
  apiKey: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  resources,
  selectedResourceId,
  onResourceSelect,
  searchRadius = 25,
  apiKey = "AIzaSyDU4S7X8HQy4-T0JKL66E54BXoBo8yiy9k"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Category colors for markers - using semantic colors
  const categoryColors: Record<string, string> = {
    'Treatment Center': '#ec4899', // pink-500
    'Support Group': '#8b5cf6',   // violet-500
    'Counseling': '#06b6d4',      // cyan-500
    'Financial Aid': '#10b981',   // emerald-500
    'Transportation': '#f59e0b',  // amber-500
    'Hospice': '#ef4444',         // red-500
  };

  // Initialize Google Maps
  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is required');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader.load().then(() => {
      setIsLoaded(true);
      setError(null);
    }).catch((err) => {
      console.error('Failed to load Google Maps:', err);
      setError('Failed to load Google Maps. Please check your API key.');
    });
  }, [apiKey]);

  // Create map instance
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      zoom: 11,
      center,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Create info window
    infoWindowRef.current = new google.maps.InfoWindow();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded, center]);

  // Update map center
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center]);

  // Update search radius circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setMap(null);
    }

    // Create new circle
    radiusCircleRef.current = new google.maps.Circle({
      strokeColor: '#ec4899',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#ec4899',
      fillOpacity: 0.1,
      map: mapInstanceRef.current,
      center,
      radius: searchRadius * 1000, // Convert km to meters
    });
  }, [center, searchRadius]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !infoWindowRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    resources.forEach(resource => {
      const marker = new google.maps.Marker({
        position: { lat: resource.lat, lng: resource.lng },
        map: mapInstanceRef.current,
        title: resource.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: categoryColors[resource.category] || '#ec4899',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: selectedResourceId === resource.id ? 12 : 8,
        }
      });

      marker.addListener('click', () => {
        const infoContent = `
          <div class="p-4 max-w-sm">
            <h3 class="font-semibold text-lg mb-2">${resource.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${resource.category}</p>
            <p class="text-sm mb-2">${resource.address}, ${resource.city}${resource.state ? ', ' + resource.state : ''}</p>
            ${resource.phone ? `<p class="text-sm mb-2">📞 ${resource.phone}</p>` : ''}
            ${resource.distance ? `<p class="text-sm mb-3">📍 ${resource.distance.toFixed(1)} km away</p>` : ''}
            <div class="flex gap-2">
              ${resource.website ? `<a href="${resource.website}" target="_blank" class="inline-flex items-center px-3 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 transition-colors">Visit Website</a>` : ''}
              <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(resource.address + ', ' + resource.city + ', ' + resource.state)}', '_blank')" class="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">Get Directions</button>
            </div>
          </div>
        `;

        infoWindowRef.current?.setContent(infoContent);
        infoWindowRef.current?.open(mapInstanceRef.current, marker);
        
        onResourceSelect?.(resource);
      });

      markersRef.current.push(marker);
    });

    // Center map on user location
    if (markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(center);
      markersRef.current.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      mapInstanceRef.current?.fitBounds(bounds);
    }
  }, [resources, selectedResourceId, onResourceSelect, center]);

  if (error) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Categories</h4>
        <div className="space-y-1">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Location Indicator */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Your Location</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;