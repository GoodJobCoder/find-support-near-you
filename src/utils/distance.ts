interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param point1 First coordinate point
 * @param point2 Second coordinate point
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: LatLng, point2: LatLng): number {
  const EARTH_RADIUS_KM = 6371;
  
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  
  const deltaLat = toRadians(point2.lat - point1.lat);
  const deltaLng = toRadians(point2.lng - point1.lng);
  
  const lat1Rad = toRadians(point1.lat);
  const lat2Rad = toRadians(point2.lat);

  const a = Math.sin(deltaLat / 2) ** 2 + 
           Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) ** 2;
  
  const c = 2 * Math.asin(Math.sqrt(a));
  
  return EARTH_RADIUS_KM * c;
}

/**
 * Filter resources by distance and sort them by proximity
 */
export function filterResourcesByDistance<T extends { lat: number; lng: number }>(
  resources: T[],
  center: LatLng,
  maxRadius: number
): (T & { distance: number })[] {
  return resources
    .map(resource => ({
      ...resource,
      distance: calculateDistance(center, { lat: resource.lat, lng: resource.lng })
    }))
    .filter(resource => resource.distance <= maxRadius)
    .sort((a, b) => a.distance - b.distance);
}