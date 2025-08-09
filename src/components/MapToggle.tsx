import React from 'react';
import { Button } from '@/components/ui/button';
import { Map, List } from 'lucide-react';

interface MapToggleProps {
  showMap: boolean;
  onToggle: (show: boolean) => void;
}

const MapToggle: React.FC<MapToggleProps> = ({ showMap, onToggle }) => {
  return (
    <Button
      variant={showMap ? "default" : "outline"}
      size="sm"
      onClick={() => onToggle(!showMap)}
      className="flex items-center gap-2"
    >
      {showMap ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />}
      {showMap ? 'Show List' : 'Show Map'}
    </Button>
  );
};

export default MapToggle;