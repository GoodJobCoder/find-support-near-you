import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Phone, ExternalLink, MessageSquare } from 'lucide-react';
import { Resource } from '@/data/resources';
import AvailabilityStatus from '@/components/AvailabilityStatus';
import { useChat } from '@/context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface ResourceCardProps {
  resource: Resource & { distance?: number };
  isSelected?: boolean;
  onSelect?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ResourceCard({
  resource,
  isSelected = false,
  onSelect,
  isFavorite = false,
  onToggleFavorite
}: ResourceCardProps) {
  const { openWith } = useChat();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWith({
      resource: {
        id: resource.id,
        name: resource.name,
        category: resource.category,
        address: resource.address,
        city: resource.city,
        state: resource.state,
        country: resource.country,
        phone: resource.phone,
        website: resource.website,
        lat: resource.lat,
        lng: resource.lng,
      },
    });
    navigate('/');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.();
  };

  const getMapsUrl = () => {
    const query = encodeURIComponent(`${resource.name}, ${resource.address}, ${resource.city}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <Card 
      className={`group border border-border/70 hover:border-primary/60 transition-all duration-300 hover:shadow-md cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">
              {resource.name}
            </CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">
              {resource.city}{resource.state ? `, ${resource.state}` : ''} · {resource.country}
            </div>
            {resource.hours && (
              <AvailabilityStatus hours={resource.hours} className="mb-2" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{resource.category}</Badge>
            {onToggleFavorite && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFavoriteClick}
                className="h-8 w-8 p-0"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart 
                  className={`h-4 w-4 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                  }`} 
                />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {resource.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{resource.address}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {resource.phone && (
            <a 
              className="inline-flex items-center gap-1 text-primary hover:underline" 
              href={`tel:${resource.phone}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="h-4 w-4" /> {resource.phone}
            </a>
          )}
          
          {resource.website && (
            <a 
              className="inline-flex items-center gap-1 text-primary hover:underline" 
              href={resource.website} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Website <ExternalLink className="h-4 w-4" />
            </a>
          )}
          
          <a
            className="inline-flex items-center gap-1 text-primary hover:underline"
            href={getMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Open in Maps <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="pt-1">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={handleChatClick}
            aria-label="Chat with AI about this location"
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Chat with AI
          </Button>
        </div>

        {typeof resource.distance === 'number' && (
          <div className="text-sm text-muted-foreground">
            {resource.distance.toFixed(1)} {t('resource.distance')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}