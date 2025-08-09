import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LatLng {
  lat: number;
  lng: number;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCurrentPosition = useCallback(
    (options?: GeolocationOptions): Promise<LatLng> => {
      return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          const error = new Error('Geolocation not supported');
          toast({
            title: 'Geolocation not supported',
            description: 'Your browser does not support location access.',
          });
          reject(error);
          return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLoading(false);
            resolve({ lat: latitude, lng: longitude });
          },
          (error) => {
            setLoading(false);
            toast({
              title: 'Location denied',
              description: error.message,
            });
            reject(error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 60_000,
            timeout: 10_000,
            ...options,
          }
        );
      });
    },
    [toast]
  );

  return {
    getCurrentPosition,
    loading,
  };
}