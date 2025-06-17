import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { MapPin, Navigation, ArrowLeft, Search, Loader2 } from 'lucide-react';
import MapComponent, { Marker as MapMarker } from '../../components/MapComponent'; // Renamed to avoid conflict
import * as mapService from '../../services/mapService';
import * as rideService from '../../services/rideService';
import { useTranslation } from 'react-i18next';
import RideInfoCard from '../../components/client/RideInfoCard';
import { toast } from 'sonner';
import { debounce } from '../../utils/debounce'; // Import debounce

const ClientBookingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locationHook = useLocation();
  
  const initialDestinationQuery = locationHook.state?.destination || '';
  const initialDestinationCoords = locationHook.state?.destinationCoordinates || null;

  const [clientLocation, setClientLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [destinationQuery, setDestinationQuery] = useState(initialDestinationQuery);
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [destinationCoordinates, setDestinationCoordinates] = useState<{latitude: number, longitude: number} | null>(initialDestinationCoords);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);

  const [isGeocodingPickup, setIsGeocodingPickup] = useState(true);
  const [isGeocodingDestination, setIsGeocodingDestination] = useState(false);
  const [isDirectionsLoading, setIsDirectionsLoading] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const [suggestions, setSuggestions] = useState<mapService.MapboxFeature[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  // No selectedDestination state needed here as selection directly sets coordinates/address

  useEffect(() => {
    setIsGeocodingPickup(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setClientLocation({ latitude, longitude });
          const result = await mapService.reverseGeocode(latitude, longitude);
          if (result.data) setPickupAddress(result.data.address);
          else {
            toast.error(t(result.error?.messageKey || 'mapService.errors.reverseGeocodeFailed'));
            setPickupAddress(t('clientBookingPage.currentLocationDefault'));
          }
          setIsGeocodingPickup(false);
        },
        (error) => { /* ... existing error handling ... */
          console.error('Erreur de géolocalisation:', error);
          setClientLocation({ latitude: 5.3600, longitude: -4.0083 });
          setPickupAddress(t('clientBookingPage.defaultLocationName'));
          setIsGeocodingPickup(false);
          switch (error.code) {
            case error.PERMISSION_DENIED: toast.error(t('errors.geolocationPermissionDenied')); break;
            case error.POSITION_UNAVAILABLE: toast.error(t('errors.geolocationPositionUnavailable')); break;
            case error.TIMEOUT: toast.error(t('errors.geolocationTimeout')); break;
            default: toast.error(t('errors.geolocationFailed')); break;
          }
        }
      );
    } else { /* ... existing error handling ... */
      toast.error(t('errors.geolocationUnavailable'));
      setClientLocation({ latitude: 5.3600, longitude: -4.0083 });
      setPickupAddress(t('clientBookingPage.defaultLocationName'));
      setIsGeocodingPickup(false);
    }

    if (initialDestinationQuery && !initialDestinationCoords) {
      handleGeocodeDestination(initialDestinationQuery, false); // Geocode if only text is passed
    } else if (initialDestinationCoords && initialDestinationQuery) {
        setDestinationAddress(initialDestinationQuery); // Assume query is the place_name if coords are passed
    }
  }, [initialDestinationQuery, initialDestinationCoords, t]);

  useEffect(() => {
    if (clientLocation && destinationCoordinates) {
      fetchAndSetRouteDetails(
        [clientLocation.longitude, clientLocation.latitude],
        [destinationCoordinates.longitude, destinationCoordinates.latitude]
      );
    } else {
      // Clear route if either location is missing
      setRouteGeoJSON(null);
      setEstimatedPrice(0);
      setEstimatedTime('');
    }
  }, [clientLocation, destinationCoordinates]);
  
  const debouncedFetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        setIsSuggestionsLoading(false);
        return;
      }
      setIsSuggestionsLoading(true);
      const proximity = clientLocation ? { latitude: clientLocation.latitude, longitude: clientLocation.longitude } : undefined;
      const result = await mapService.getPlaceAutocomplete(query, proximity);
      if (result.data) {
        setSuggestions(result.data);
      } else if (result.error) {
        toast.error(t(result.error.messageKey));
        setSuggestions([]);
      }
      setIsSuggestionsLoading(false);
    }, 500),
    [clientLocation, t]
  );

  useEffect(() => {
    if (destinationQuery.length > 0 && destinationQuery !== destinationAddress) { // Fetch only if query changed and not from selection
        debouncedFetchSuggestions(destinationQuery);
    } else if (destinationQuery.length < 3) {
        setSuggestions([]);
    }
  }, [destinationQuery, destinationAddress, debouncedFetchSuggestions]);


  const handleGeocodeDestination = async (address: string, shouldClearSuggestions = true) => {
    if (!address.trim()) return;
    setIsGeocodingDestination(true);
    if (shouldClearSuggestions) setSuggestions([]); // Clear suggestions when explicitly geocoding
    
    const result = await mapService.geocodeAddress(address);
    if (result.data) {
      setDestinationCoordinates({ latitude: result.data.latitude, longitude: result.data.longitude });
      setDestinationAddress(result.data.placeName);
      setDestinationQuery(result.data.placeName); // Update query to reflect geocoded name
    } else if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details }));
      setDestinationAddress('');
      setDestinationCoordinates(null); // Clear coordinates on error
    }
    setIsGeocodingDestination(false);
  };
  
  const fetchAndSetRouteDetails = async (start: [number, number], end: [number, number]) => {
    setIsDirectionsLoading(true);
    setRouteGeoJSON(null); // Clear previous route
    setEstimatedPrice(0);
    setEstimatedTime('');

    const result = await mapService.getMapboxDirections(start, end);
    if (result.data) {
      setRouteGeoJSON(result.data.geometry);
      if (result.data.distance) {
        const distanceKm = result.data.distance / 1000;
        const basePrice = 300;
        const pricePerKm = 100;
        setEstimatedPrice(Math.round(basePrice + (distanceKm * pricePerKm)));
      }
      if (result.data.duration) {
        setEstimatedTime(`${Math.round(result.data.duration / 60)} min`);
      }
    } else if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details }));
    }
    setIsDirectionsLoading(false);
  };
  
  const handleSearch = () => { // Triggered by search button
    handleGeocodeDestination(destinationQuery);
  };

  const handleSuggestionClick = (suggestion: mapService.MapboxFeature) => {
    setDestinationQuery(suggestion.place_name); // Update input field
    setDestinationAddress(suggestion.place_name); // Set formatted address
    setDestinationCoordinates({ longitude: suggestion.center[0], latitude: suggestion.center[1] });
    setSuggestions([]); // Clear suggestions
    // Route fetching will be triggered by useEffect watching destinationCoordinates
  };
  
  const bookRide = async () => {
    if (clientLocation && destinationCoordinates && destinationAddress && pickupAddress && routeGeoJSON) { // Ensure route is calculated
      setIsSubmittingBooking(true);
      const rideRequestData: rideService.RideRequestData = {
        pickup: { coordinates: clientLocation, address: pickupAddress },
        destination: { coordinates: destinationCoordinates, address: destinationAddress },
        price: estimatedPrice,
        estimatedTime: estimatedTime,
      };
      const result = await rideService.requestRide(rideRequestData);
      if (result.error) {
        toast.error(t(result.error.messageKey, { details: result.error.details }));
      } else if (result.data) {
        navigate('/client/searching-driver', {
          state: {
            rideDetails: rideRequestData,
            bookingId: result.data.bookingId,
          }
        });
      }
      setIsSubmittingBooking(false);
    } else {
      toast.error(t('clientBookingPage.errors.selectDestination'));
    }
  };

  const markers: MapMarker[] = [];
  if (clientLocation) {
    markers.push({ id: 'pickup', latitude: clientLocation.latitude, longitude: clientLocation.longitude, color: '#0052FF', title: t('clientBookingPage.markerTitles.pickup') });
  }
  if (destinationCoordinates) {
    markers.push({ id: 'destination', latitude: destinationCoordinates.latitude, longitude: destinationCoordinates.longitude, color: '#FF8C00', title: t('clientBookingPage.markerTitles.destination') });
  }

  return (
    <div className="flex flex-col h-screen bg-kole-cream-bg">
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button onClick={() => navigate('/client')} className="mr-4 p-2 rounded-full hover:bg-kole-hover-bg">
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </button>
        <h1 className="text-lg font-semibold text-kole-text-primary">{t('clientBookingPage.title')}</h1>
      </div>
      
      <div className="bg-white p-4 shadow-sm">
        <div className="flex gap-2 mb-3">
          <div className="flex-none pt-2">
            <MapPin className="h-5 w-5 text-kole-blue-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-kole-text-secondary">{t('clientBookingPage.labels.from')}</p>
            {isGeocodingPickup ? (
              <p className="font-medium text-kole-text-secondary animate-pulse">{t('clientBookingPage.loadingAddress')}</p>
            ) : (
              <p className="font-medium truncate text-kole-text-primary" title={pickupAddress}>{pickupAddress}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-none pt-2">
            <Navigation className="h-5 w-5 text-kole-orange-primary" />
          </div>
          <div className="flex-1 relative"> {/* Added relative for suggestions positioning */}
            <p className="text-sm text-kole-text-secondary">{t('clientBookingPage.labels.to')}</p>
            <div className="flex gap-2">
              <Input
                placeholder={t('clientBookingPage.placeholders.destination')}
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                className="flex-1 kole-input"
                disabled={isGeocodingDestination || isDirectionsLoading}
              />
              <Button onClick={handleSearch} className="kole-btn-secondary p-2.5 aspect-square" disabled={isGeocodingDestination || isDirectionsLoading || !destinationQuery.trim()}>
                {isGeocodingDestination ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>
            {/* Suggestions List */}
            {destinationQuery.length > 0 && suggestions.length > 0 && (
              <Card className="absolute z-20 w-full mt-1 kole-card border-kole-border max-h-48 overflow-y-auto">
                <CardContent className="p-0">
                  {isSuggestionsLoading && (
                    <div className="p-4 text-center text-kole-text-secondary flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {t('clientSearch.loadingSuggestions')}
                    </div>
                  )}
                  {!isSuggestionsLoading && suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center w-full text-left p-3 hover:bg-kole-hover-bg border-b border-kole-border last:border-b-0"
                    >
                      <MapPin className="h-4 w-4 text-kole-text-secondary mr-2.5 flex-shrink-0" />
                      <span className="text-sm text-kole-text-primary truncate">{suggestion.place_name}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
            {isGeocodingDestination && !destinationAddress && destinationQuery.length > 0 && !suggestions.length && !isSuggestionsLoading && (
                 <p className="text-xs text-kole-text-secondary mt-1">{t('clientBookingPage.loadingAddress')}</p>
            )}
             {!isSuggestionsLoading && !isGeocodingDestination && destinationQuery.length >=3 && suggestions.length === 0 && (
                <p className="text-xs text-red-500 mt-1">{t('clientSearch.noResults', {query: destinationQuery})}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {clientLocation ? (
          <MapComponent
            latitude={clientLocation.latitude}
            longitude={clientLocation.longitude}
            zoom={11}
            style={{ width: '100%', height: '100%' }}
            interactive={true}
            markers={markers}
            route={destinationCoordinates && clientLocation ? {
              origin: [clientLocation.longitude, clientLocation.latitude],
              destination: [destinationCoordinates.longitude, destinationCoordinates.latitude]
            } : undefined}
            routeGeoJSON={routeGeoJSON}
          />
        ) : (
          <div className="flex-1 flex justify-center items-center bg-kole-cream-light">
             <Loader2 className="h-8 w-8 text-kole-blue-primary animate-spin mr-2" />
            <p className="text-kole-brown-dark font-semibold">{t('clientBookingPage.loadingMap')}</p>
          </div>
        )}
        {isDirectionsLoading && (
             <div className="absolute inset-0 bg-kole-cream-light/70 flex justify-center items-center z-20">
                <Loader2 className="h-8 w-8 text-kole-blue-primary animate-spin mr-2" />
                <p className="ml-3 text-kole-text-secondary">{t('clientBookingPage.loadingRoute')}</p>
            </div>
        )}
      </div>
      
      {destinationCoordinates && !isDirectionsLoading && (
        <div className="bg-white border-t border-kole-border p-4">
          <Card className="border-kole-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-kole-text-primary">{t('clientBookingPage.rideDetailsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RideInfoCard
                pickupAddress={pickupAddress || t('clientBookingPage.currentLocationDefault')}
                destinationAddress={destinationAddress || (destinationQuery ? t('clientBookingPage.destinationNotGeocoded') : t('clientBookingPage.destinationNotSet'))}
                price={estimatedPrice > 0 ? estimatedPrice : t('clientBookingPage.priceUnavailable')}
                estimatedTime={estimatedTime || t('clientBookingPage.timeUnavailable')}
              />
              <Button className="w-full kole-btn-primary mt-4" onClick={bookRide} disabled={!pickupAddress || !destinationAddress || isGeocodingPickup || isGeocodingDestination || !routeGeoJSON || isSubmittingBooking}>
                {isSubmittingBooking ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    {t('clientBookingPage.buttons.submittingRequest')}
                  </span>
                ) : (
                  t('clientBookingPage.buttons.bookNow')
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientBookingPage;
