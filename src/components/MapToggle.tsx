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
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);

  const handleMapToggle = () => {
    if (!apiKey && !showMap) {
      setShowApiKeyInput(true);
      return;
    }
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
        
        {apiKey && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            API Key
          </Button>
        )}
      </div>

      {showApiKeyInput && (
        <div className="space-y-3">
          <Alert>
            <Key className="w-4 h-4" />
            <AlertDescription>
              To display the map, you need a Google Maps API key. 
              <a 
                href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Get one here
              </a>
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleApiKeySubmit} className="space-y-2">
            <Label htmlFor="api-key">Google Maps API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Google Maps API key"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!apiKey.trim()}>
                Save
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MapToggle;