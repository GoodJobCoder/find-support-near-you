import React from 'react';
import { Button } from '@/components/ui/button';
import { Car, Train, Navigation } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TransportationOptionsProps {
  destination: string;
  lat: number;
  lng: number;
  className?: string;
}

export default function TransportationOptions({ destination, lat, lng, className }: TransportationOptionsProps) {
  const { t } = useLanguage();

  const getDirectionsUrl = (mode: 'driving' | 'transit' | 'walking' = 'driving') => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`;
  };

  const getRideshareUrls = () => {
    const encodedDestination = encodeURIComponent(destination);
    return {
      uber: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodedDestination}&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`,
      lyft: `https://lyft.com/ride?id=lyft&pickup=my_location&destination[latitude]=${lat}&destination[longitude]=${lng}`,
    };
  };

  const rideshareUrls = getRideshareUrls();

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium">{t('transportation.directions')}</h4>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <a 
            href={getDirectionsUrl('driving')} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Car className="h-4 w-4" />
            {t('transportation.directions')}
          </a>
        </Button>
        
        <Button asChild size="sm" variant="outline">
          <a 
            href={getDirectionsUrl('transit')} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Train className="h-4 w-4" />
            {t('transportation.transit')}
          </a>
        </Button>
        
        <Button asChild size="sm" variant="outline">
          <a 
            href={rideshareUrls.uber} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Uber
          </a>
        </Button>
        
        <Button asChild size="sm" variant="outline">
          <a 
            href={rideshareUrls.lyft} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Lyft
          </a>
        </Button>
      </div>
    </div>
  );
}