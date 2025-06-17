// src/services/mapService.ts

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY || '';

if (!MAPBOX_ACCESS_TOKEN && process.env.NODE_ENV !== 'test') {
  console.error("Mapbox Access Token is not configured. Please check your .env file and VITE_MAPBOX_API_KEY variable.");
}

export interface ServiceError {
  messageKey: string;
  details?: string;
}

export interface ReverseGeocodeData {
  address: string;
}
export interface GeocodeAddressData {
  latitude: number;
  longitude: number;
  placeName: string;
}
export interface MapboxDirectionsData {
  geometry: any;
  distance: number;
  duration: number;
}

// New interface for Mapbox Geocoding Feature
export interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  // Add other properties from Mapbox Feature object if needed
  // e.g., context, place_type, etc.
}

export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{ data: ReverseGeocodeData | null; error: ServiceError | null }> => {
  if (!MAPBOX_ACCESS_TOKEN) {
    const errorMsg = "Mapbox Access Token is not available for reverseGeocode.";
    console.error(errorMsg);
    return { data: null, error: { messageKey: 'mapService.errors.misconfigured', details: errorMsg } };
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}&language=fr&limit=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Reverse geocoding failed: ${response.status} ${response.statusText}`, errorText);
      return { data: null, error: { messageKey: 'mapService.errors.reverseGeocodeFailed', details: `HTTP ${response.status}: ${response.statusText}. ${errorText}` } };
    }
    const apiData = await response.json();
    if (apiData.features && apiData.features.length > 0) {
      return { data: { address: apiData.features[0].place_name }, error: null };
    }
    console.warn("No features found for reverse geocoding:", latitude, longitude);
    return { data: null, error: { messageKey: 'mapService.errors.noAddressFound' } };
  } catch (error) {
    console.error('Exception during reverse geocoding:', error);
    return { data: null, error: { messageKey: 'mapService.errors.networkError', details: (error instanceof Error ? error.message : String(error)) } };
  }
};

export const geocodeAddress = async (
  address: string
): Promise<{ data: GeocodeAddressData | null; error: ServiceError | null }> => {
  if (!MAPBOX_ACCESS_TOKEN) {
    const errorMsg = "Mapbox Access Token is not available for geocodeAddress.";
    console.error(errorMsg);
    return { data: null, error: { messageKey: 'mapService.errors.misconfigured', details: errorMsg } };
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&language=fr&limit=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Geocoding failed: ${response.status} ${response.statusText}`, errorText);
      return { data: null, error: { messageKey: 'mapService.errors.geocodeFailed', details: `HTTP ${response.status}: ${response.statusText}. ${errorText}` } };
    }
    const apiData = await response.json();
    if (apiData.features && apiData.features.length > 0) {
      const [longitude, latitude] = apiData.features[0].center;
      const placeName = apiData.features[0].place_name;
      return { data: { latitude, longitude, placeName }, error: null };
    }
    console.warn("No features found for geocoding address:", address);
    return { data: null, error: { messageKey: 'mapService.errors.noCoordinatesFound' } };
  } catch (error) {
    console.error('Exception during address geocoding:', error);
    return { data: null, error: { messageKey: 'mapService.errors.networkError', details: (error instanceof Error ? error.message : String(error)) } };
  }
};

export const getMapboxDirections = async (
  originLngLat: [number, number],
  destinationLngLat: [number, number]
): Promise<{ data: MapboxDirectionsData | null; error: ServiceError | null }> => {
  if (!MAPBOX_ACCESS_TOKEN) {
    const errorMsg = "Mapbox Access Token is not available for getMapboxDirections.";
    console.error(errorMsg);
    return { data: null, error: { messageKey: 'mapService.errors.misconfigured', details: errorMsg } };
  }
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originLngLat[0]},${originLngLat[1]};${destinationLngLat[0]},${destinationLngLat[1]}?steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}&language=fr`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mapbox Directions API request failed: ${response.status} ${response.statusText}`, errorText);
      return { data: null, error: { messageKey: 'mapService.errors.directionsFailed', details: `HTTP ${response.status}: ${response.statusText}. ${errorText}` } };
    }
    const json = await response.json();
    if (json.routes && json.routes.length > 0) {
      return { data: json.routes[0] as MapboxDirectionsData, error: null };
    }
    console.warn("No routes found for the given coordinates.");
    return { data: null, error: { messageKey: 'mapService.errors.noRoutesFound' } };
  } catch (error) {
    console.error('Exception fetching Mapbox directions:', error);
    return { data: null, error: { messageKey: 'mapService.errors.networkError', details: (error instanceof Error ? error.message : String(error)) } };
  }
};

/**
 * Fetches place autocomplete suggestions from Mapbox Geocoding API.
 * @param query The search query string.
 * @param proximity Optional proximity to bias results { latitude: number; longitude: number; }
 * @returns A promise that resolves to an object containing an array of MapboxFeatures or an error.
 */
export const getPlaceAutocomplete = async (
  query: string,
  proximity?: { latitude: number; longitude: number; }
): Promise<{ data: MapboxFeature[] | null; error: ServiceError | null; }> => {
  if (!MAPBOX_ACCESS_TOKEN) {
    const errorMsg = "Mapbox Access Token is not available for getPlaceAutocomplete.";
    console.error(errorMsg);
    return { data: null, error: { messageKey: 'mapService.errors.misconfigured', details: errorMsg } };
  }

  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&autocomplete=true&language=fr&country=CI`; // CI for Côte d'Ivoire

  if (proximity) {
    url += `&proximity=${proximity.longitude},${proximity.latitude}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Autocomplete search failed: ${response.status} ${response.statusText}`, errorText);
      return { data: null, error: { messageKey: 'mapService.errors.autocompleteFailed', details: `HTTP ${response.status}: ${response.statusText}. ${errorText}` } };
    }
    const apiData = await response.json();
    if (apiData.features) {
      return { data: apiData.features as MapboxFeature[], error: null };
    }
    // This case should ideally not be reached if API call is successful but has no features,
    // as features would be an empty array. But as a safeguard:
    console.warn("No features found for autocomplete query:", query);
    return { data: [], error: null }; // Return empty array for no results
  } catch (error) {
    console.error('Exception during place autocomplete:', error);
    return { data: null, error: { messageKey: 'mapService.errors.networkError', details: (error instanceof Error ? error.message : String(error)) } };
  }
};
