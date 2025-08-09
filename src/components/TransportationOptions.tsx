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
      </div>
    </div>
  );
}