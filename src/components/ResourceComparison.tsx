import React from 'react';
import { X, MapPin, Phone, Globe, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Resource } from '@/data/resources';
import { useComparison } from '@/hooks/useComparison';
import { useReviews } from '@/hooks/useReviews';
import { useLanguage } from '@/context/LanguageContext';
import AvailabilityStatus from './AvailabilityStatus';

interface ResourceComparisonProps {
  resources: Resource[];
  onResourceSelect?: (resource: Resource) => void;
}

const ResourceComparison: React.FC<ResourceComparisonProps> = ({ 
  resources, 
  onResourceSelect 
}) => {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const { getAverageRating, getResourceReviews } = useReviews();
  const { t } = useLanguage();

  const comparisonResources = resources.filter(resource => 
    comparisonList.includes(resource.id)
  );

  if (comparisonResources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8" />
          </div>
          <p className="text-lg mb-2">{t('noResourcesSelected')}</p>
          <p className="text-sm">{t('selectResourcesToCompare')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {t('compareResources')} ({comparisonResources.length})
        </h3>
        <Button variant="outline" onClick={clearComparison} size="sm">
          <X className="w-4 h-4 mr-2" />
          {t('clearAll')}
        </Button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparisonResources.map((resource) => {
          const averageRating = getAverageRating(resource.id);
          const reviewCount = getResourceReviews(resource.id).length;

          return (
            <Card key={resource.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight pr-8">
                    {resource.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromComparison(resource.id)}
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {resource.category}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rating */}
                {reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({reviewCount} {reviewCount === 1 ? t('review') : t('reviews')})
                    </span>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="text-sm">
                      <p>{resource.address}</p>
                      <p className="text-muted-foreground">
                        {resource.city}{resource.state ? `, ${resource.state}` : ''}, {resource.country}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-2">
                  {resource.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{resource.phone}</span>
                    </div>
                  )}
                  
                  {resource.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {t('visitWebsite')}
                      </a>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Availability */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('availability')}</span>
                  </div>
                  <AvailabilityStatus hours={resource.hours} />
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => onResourceSelect?.(resource)}
                    className="w-full"
                    size="sm"
                  >
                    {t('viewDetails')}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    {resource.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.website, '_blank')}
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const address = `${resource.address}, ${resource.city}, ${resource.state || ''}, ${resource.country}`;
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
                      }}
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add More Resources Hint */}
      {comparisonResources.length < 3 && (
        <div className="text-center p-4 border-2 border-dashed border-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {t('addMoreResources')} ({3 - comparisonResources.length} {t('remaining')})
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceComparison;