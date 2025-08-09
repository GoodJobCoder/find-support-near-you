import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, ExternalLink } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { Resource } from '@/data/resources';

interface FavoritesSectionProps {
  resources: Resource[];
  onResourceSelect: (resource: Resource) => void;
}

export default function FavoritesSection({ resources, onResourceSelect }: FavoritesSectionProps) {
  const { favorites } = useFavorites();
  
  const favoriteResources = resources.filter(resource => favorites.includes(resource.id));

  if (favoriteResources.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No favorites yet. Add resources to your favorites by clicking the heart icon.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Your Favorites ({favoriteResources.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favoriteResources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{resource.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {resource.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{resource.city}, {resource.country}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResourceSelect(resource)}
                className="ml-2"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}