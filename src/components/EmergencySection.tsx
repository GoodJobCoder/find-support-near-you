import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Globe, Clock, AlertTriangle } from 'lucide-react';
import { emergencyResources } from '@/data/emergencyResources';
import { useLanguage } from '@/context/LanguageContext';

export default function EmergencySection() {
  const { t } = useLanguage();
  return (
    <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          {t('emergency.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('emergency.description')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {emergencyResources.map((resource) => (
          <div key={resource.id} className="rounded-lg border bg-background p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{resource.name}</h3>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {resource.available}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
                <a href={`tel:${resource.phone.replace(/[^\d]/g, '')}`} className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {resource.phone}
                </a>
              </Button>
              {resource.website && (
                <Button asChild variant="outline" size="sm">
                  <a href={resource.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t('emergency.website')}
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}