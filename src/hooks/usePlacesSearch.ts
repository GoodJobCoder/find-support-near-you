import { useCallback, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useToast } from '@/hooks/use-toast';
import { Resource, ResourceCategory } from '@/data/resources';
import { filterCancerResources } from '@/lib/aiFilter';

interface LatLng {
  lat: number;
  lng: number;
}

interface SearchQuery {
  category: ResourceCategory;
  keywords: string[];
}

const SEARCH_QUERIES: SearchQuery[] = [
  { category: 'Support Group', keywords: ['cancer support group', 'support group', 'patient support'] },
  { category: 'Treatment Center', keywords: ['cancer center', 'oncology center', 'hospital oncology', 'cancer treatment'] },
  { category: 'Counseling', keywords: ['cancer counseling', 'oncology counselor', 'therapy'] },
  { category: 'Financial Aid', keywords: ['cancer financial assistance', 'patient financial services', 'charity financial aid'] },
  { category: 'Hospice', keywords: ['hospice care', 'palliative care', 'end of life care'] },
  { category: 'Transportation', keywords: ['medical transport', 'patient transport', 'healthcare transport'] },
];

export function usePlacesSearch() {
  const [loading, setLoading] = useState(false);
  const { isLoaded: googleMapsLoaded } = useGoogleMaps();
  const { toast } = useToast();

  const searchNearbyPlaces = useCallback(
    async (location: LatLng, radius: number, language: string = 'en'): Promise<Resource[]> => {
      if (!googleMapsLoaded || !window.google?.maps?.places) {
        throw new Error('Google Maps not loaded');
      }

      setLoading(true);
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));

      try {
        // Perform text searches for each category and keyword
        const searchPromises = SEARCH_QUERIES.map(({ category, keywords }) =>
          Promise.all(
            keywords.map(keyword =>
              new Promise<google.maps.places.PlaceResult[]>((resolve) => {
                const request: google.maps.places.TextSearchRequest = {
                  query: `${keyword} near me`,
                  location: new window.google.maps.LatLng(location.lat, location.lng),
                  radius: radius * 1000, // Convert km to meters
                };

                service.textSearch(request, (results, status) => {
                  if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    resolve(results);
                  } else {
                    resolve([]);
                  }
                });
              })
            )
          )
        );

        const allResults = await Promise.all(searchPromises);

        // Collect unique places
        const uniquePlaces = new Map<string, { place: google.maps.places.PlaceResult; category: ResourceCategory }>();

        allResults.forEach((categoryResults, categoryIndex) => {
          const category = SEARCH_QUERIES[categoryIndex].category;
          categoryResults.forEach(keywordResults => {
            keywordResults.forEach(place => {
              if (place.place_id && place.geometry?.location && place.name) {
                if (!uniquePlaces.has(place.place_id)) {
                  uniquePlaces.set(place.place_id, { place, category });
                }
              }
            });
          });
        });

        // Fetch detailed information for each place
        const detailPromises = Array.from(uniquePlaces.entries()).map(([placeId, { place, category }]) =>
          new Promise<Resource | null>((resolve) => {
            const request: google.maps.places.PlaceDetailsRequest = {
              placeId: placeId,
              fields: [
                'place_id', 'name', 'formatted_address', 'vicinity',
                'formatted_phone_number', 'website', 'geometry',
                'opening_hours', 'rating', 'business_status'
              ]
            };

            service.getDetails(request, (placeDetails, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                resolve({
                  id: placeDetails.place_id || placeId,
                  name: placeDetails.name || place.name,
                  category: category,
                  lat: placeDetails.geometry?.location?.lat() || place.geometry!.location!.lat(),
                  lng: placeDetails.geometry?.location?.lng() || place.geometry!.location!.lng(),
                  address: placeDetails.formatted_address || place.formatted_address || '',
                  city: placeDetails.vicinity || place.vicinity || '',
                  country: 'United States',
                  phone: placeDetails.formatted_phone_number || undefined,
                  website: placeDetails.website || undefined
                });
              } else {
                // Fallback to basic info
                resolve({
                  id: place.place_id!,
                  name: place.name!,
                  category: category,
                  lat: place.geometry!.location!.lat(),
                  lng: place.geometry!.location!.lng(),
                  address: place.formatted_address || '',
                  city: place.vicinity || '',
                  country: 'United States',
                  phone: undefined,
                  website: undefined
                });
              }
            });
          })
        );

        const detailedResults = await Promise.all(detailPromises);
        const validResources = detailedResults.filter((resource): resource is Resource => resource !== null);

        // Apply AI filtering
        let finalResources = validResources;
        try {
          finalResources = await filterCancerResources(validResources, language);
        } catch (error) {
          console.warn('AI filtering failed; showing unfiltered results', error);
        }

        return finalResources;
      } catch (error) {
        console.error('Error fetching places:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [googleMapsLoaded]
  );

  return {
    searchNearbyPlaces,
    loading,
  };
}