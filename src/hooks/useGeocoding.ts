import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LatLng {
  lat: number;
  lng: number;
}

interface GeocodingResult {
  position: LatLng;
  displayName: string;
}

export function useGeocoding() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const geocode = useCallback(
    async (query: string): Promise<GeocodingResult> => {
      if (!query.trim()) {
        throw new Error('Query is required');
      }

      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        const data: any[] = await response.json();
        
        if (!data.length) {
          throw new Error('No location found for the given query');
        }

        const location = data[0];
        const result = {
          position: {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon),
          },
          displayName: location.display_name,
        };

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Geocoding failed';
        toast({
          title: 'Geocoding failed',
          description: message,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  return {
    geocode,
    loading,
  };
}