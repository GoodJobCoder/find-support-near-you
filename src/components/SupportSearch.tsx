import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin } from 'lucide-react';
import { Resource, ResourceCategory } from '@/data/resources';
import GoogleMap from './GoogleMap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import MapToggle from './MapToggle';
import ResourceDetails from './ResourceDetails';
import EmergencySection from './EmergencySection';
import FavoritesSection from './FavoritesSection';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useGeocoding } from '@/hooks/useGeocoding';
import { usePlacesSearch } from '@/hooks/usePlacesSearch';
import { filterResourcesByDistance } from '@/utils/distance';
import { SearchInput } from '@/components/search/SearchInput';
import { SearchFilters } from '@/components/search/SearchFilters';
import { ResourceCard } from '@/components/search/ResourceCard';

interface LatLng {
  lat: number;
  lng: number;
}

type SearchMode = 'address' | 'zipcode' | 'city';
type Category = 'All' | ResourceCategory;

export default function SupportSearch() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Search state
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('address');
  const [category, setCategory] = useState<Category>('All');
  const [radius, setRadius] = useState(25);
  
  // Location state
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('search');
  const [showMap, setShowMap] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  
  // Hooks
  const { getCurrentPosition, loading: geoLoading } = useGeolocation();
  const { geocode, loading: geocodeLoading } = useGeocoding();
  const { searchNearbyPlaces, loading: placesLoading } = usePlacesSearch();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const loading = geoLoading || geocodeLoading || placesLoading;

  // Handle URL params for selected resource
  useEffect(() => {
    const resourceId = searchParams.get('resource');
    setSelectedResourceId(resourceId);
  }, [searchParams]);

  // Handle location search
  const handleLocationSearch = useCallback(async () => {
    try {
      const result = await geocode(query);
      setUserLocation(result.position);
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
  }, [geocode, query]);

  // Handle current location
  const handleUseCurrentLocation = useCallback(async () => {
    try {
      const position = await getCurrentPosition();
      setUserLocation(position);
    } catch (error) {
      console.error('Geolocation failed:', error);
    }
  }, [getCurrentPosition]);

  // Fetch places when location changes
  useEffect(() => {
    if (userLocation) {
      searchNearbyPlaces(userLocation, radius, language)
        .then(setResources)
        .catch(console.error);
    }
  }, [userLocation, radius, language, searchNearbyPlaces]);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    if (!userLocation) return [];
    
    let filtered = resources;
    if (category !== 'All') {
      filtered = filtered.filter(resource => resource.category === category);
    }
    
    return filterResourcesByDistance(filtered, userLocation, radius);
  }, [resources, userLocation, category, radius]);

  // Selected resource details
  const selectedResource = useMemo(() => {
    if (!selectedResourceId) return null;
    return filteredResources.find(r => r.id === selectedResourceId) ||
           resources.find(r => r.id === selectedResourceId) ||
           null;
  }, [selectedResourceId, filteredResources, resources]);

  // Resource selection handlers
  const openResource = useCallback((id: string) => {
    setSelectedResourceId(id);
    const params = new URLSearchParams(searchParams);
    params.set('resource', id);
    navigate({ search: params.toString() }, { replace: false });
  }, [navigate, searchParams]);

  const closeResource = useCallback(() => {
    setSelectedResourceId(null);
    const params = new URLSearchParams(searchParams);
    params.delete('resource');
    navigate({ search: params.toString() }, { replace: false });
  }, [navigate, searchParams]);

  return (
    <section className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">{t('search.resources')}</TabsTrigger>
          <TabsTrigger value="favorites">
            {t('search.favorites')} ({resources.filter(r => favorites.includes(r.id)).length})
          </TabsTrigger>
          <TabsTrigger value="emergency">{t('search.emergency')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-6">
          <Card className="border border-border/70 shadow-sm backdrop-blur-sm bg-card/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">{t('search.nearby')}</CardTitle>
              <LanguageSelector />
            </CardHeader>
            <CardContent className="space-y-5">
              <SearchInput
                query={query}
                onQueryChange={setQuery}
                mode={mode}
                onModeChange={setMode}
                onSearch={handleLocationSearch}
                onUseLocation={handleUseCurrentLocation}
                loading={loading}
              />

              <SearchFilters
                category={category}
                onCategoryChange={setCategory}
                radius={radius}
                onRadiusChange={setRadius}
              />

              {/* Map Toggle */}
              {userLocation && filteredResources.length > 0 && (
                <MapToggle showMap={showMap} onToggle={setShowMap} />
              )}

              <div className="pt-2 text-sm text-muted-foreground">
                {userLocation ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('status.location_set').replace('{radius}', radius.toString())}
                    {placesLoading && ` • ${t('status.loading_places')}`}
                  </div>
                ) : (
                  <div>{t('status.tip_location')}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <section aria-labelledby="results-heading" className="mt-8" role="region">
            <h2 id="results-heading" className="sr-only">Search results</h2>
            {userLocation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t('status.results_found')
                      .replace('{count}', filteredResources.length.toString())
                      .replace('{plural}', filteredResources.length === 1 ? '' : 's')}
                  </p>
                </div>
                
                {showMap ? (
                  <GoogleMap
                    center={userLocation}
                    resources={filteredResources}
                    selectedResourceId={selectedResourceId}
                    onResourceSelect={(resource) => openResource(resource.id)}
                    searchRadius={radius}
                    apiKey="AIzaSyDU4S7X8HQy4-T0JKL66E54BXoBo8yiy9k"
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredResources.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        isSelected={selectedResourceId === resource.id}
                        onSelect={() => openResource(resource.id)}
                        isFavorite={isFavorite(resource.id)}
                        onToggleFavorite={() => toggleFavorite(resource.id)}
                      />
                    ))}
                  </div>
                )}
                
                {filteredResources.length === 0 && !placesLoading && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {t('status.no_results').replace('{radius}', radius.toString())}
                    </CardContent>
                  </Card>
                )}
                
                {placesLoading && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {t('status.loading_google')}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  {t('status.results_appear')}
                </CardContent>
              </Card>
            )}
          </section>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <FavoritesSection 
            resources={resources} 
            onResourceSelect={(resource) => openResource(resource.id)} 
          />
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <EmergencySection />
        </TabsContent>
      </Tabs>

      {/* Resource Details Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={(open) => !open && closeResource()}>
        <DialogContent className="max-w-none w-screen h-screen sm:rounded-none p-0 bg-background">
          <div className="flex h-full flex-col">
            <div className="border-b px-4 py-3">
              <DialogHeader>
                <DialogTitle>{t('resource.details')}</DialogTitle>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {selectedResource && <ResourceDetails resource={selectedResource} />}
            </div>
            <div className="border-t px-4 py-3 flex justify-end">
              <Button variant="outline" onClick={closeResource}>
                {t('resource.back')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}