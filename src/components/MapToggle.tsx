import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Map, List, Key } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MapToggleProps {
  showMap: boolean;
  onToggle: (show: boolean) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const MapToggle: React.FC<MapToggleProps> = ({
  showMap,
  onToggle,
  apiKey,
  onApiKeyChange
}) => {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleMapToggle = () => {
    onToggle(!showMap);
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
      onToggle(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={showMap ? "default" : "outline"}
          size="sm"
          onClick={handleMapToggle}
          className="flex items-center gap-2"
        >
          {showMap ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />}
          {showMap ? 'Show List' : 'Show Map'}
        </Button>
        
      </div>

    </div>
  );
};

export default MapToggle;