import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { 
  Navigation, 
  Search, 
  Target,
  Loader2 // Added Loader2 for suggestions loading
} from 'lucide-react';
// MapPin, Home, Activity, CreditCard, User removed as they are not directly used or are in NavBar
import ClientBottomNavBar from '../../components/ClientBottomNavBar';
import MapComponent, { Marker as MapMarker } from '../../components/MapComponent'; // Renamed Marker to MapMarker to avoid conflict
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import * as mapService from '../../services/mapService'; // Import mapService
import { debounce } from '../../utils/debounce'; // Import debounce

const ClientMainMapPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyDrivers, setNearbyDrivers] = useState(3);
  
  const [suggestions, setSuggestions] = useState<mapService.MapboxFeature[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<mapService.MapboxFeature | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          const defaultLat = 5.3600;
          const defaultLng = -4.0083;
          setLocation({ latitude: defaultLat, longitude: defaultLng });
          switch (error.code) {
            case error.PERMISSION_DENIED: toast.error(t('errors.geolocationPermissionDenied')); break;
            case error.POSITION_UNAVAILABLE: toast.error(t('errors.geolocationPositionUnavailable')); break;
            case error.TIMEOUT: toast.error(t('errors.geolocationTimeout')); break;
            default: toast.error(t('errors.geolocationFailed')); break;
          }
        }
      );
    } else {
      toast.error(t('errors.geolocationUnavailable'));
      const defaultLat = 5.3600;
      const defaultLng = -4.0083;
      setLocation({ latitude: defaultLat, longitude: defaultLng });
    }
  }, [t]);

  const debouncedFetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        setIsSuggestionsLoading(false);
        return;
      }
      setIsSuggestionsLoading(true);
      const proximity = location ? { latitude: location.latitude, longitude: location.longitude } : undefined;
      const result = await mapService.getPlaceAutocomplete(query, proximity);
      if (result.data) {
        setSuggestions(result.data);
      } else if (result.error) {
        toast.error(t(result.error.messageKey));
        setSuggestions([]);
      }
      setIsSuggestionsLoading(false);
    }, 500),
    [location, t]
  );

  useEffect(() => {
    if (searchQuery.length > 0 && !selectedDestination) { // Only fetch if no destination is selected yet from suggestions
        debouncedFetchSuggestions(searchQuery);
    } else if (searchQuery.length < 3) { // Clear suggestions if query is too short
        setSuggestions([]);
    }
  }, [searchQuery, debouncedFetchSuggestions, selectedDestination]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedDestination(null); // Clear selected destination when user types
    if (e.target.value.length < 3) { // Clear suggestions immediately if query is too short
        setSuggestions([]);
        setIsSuggestionsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: mapService.MapboxFeature) => {
    setSearchQuery(suggestion.place_name);
    setSelectedDestination(suggestion);
    setSuggestions([]);
    // Immediately navigate to booking page with selected destination details
    navigate('/client/booking', {
        state: {
            destination: suggestion.place_name,
            destinationCoordinates: {
                latitude: suggestion.center[1],
                longitude: suggestion.center[0]
            }
        }
    });
  };

  const handleSearch = () => {
    if (selectedDestination) {
      navigate('/client/booking', {
        state: {
          destination: selectedDestination.place_name,
          destinationCoordinates: {
            latitude: selectedDestination.center[1],
            longitude: selectedDestination.center[0]
          }
        }
      });
    } else if (searchQuery.trim()) {
      // Fallback: navigate with query text, ClientBookingPage will geocode
      navigate('/client/booking', { state: { destination: searchQuery } });
    }
  };

  const handleBookRide = () => {
    // If there's a selected destination from autocomplete, use it directly
    if (selectedDestination) {
        navigate('/client/booking', {
            state: {
                destination: selectedDestination.place_name,
                destinationCoordinates: {
                    latitude: selectedDestination.center[1],
                    longitude: selectedDestination.center[0]
                }
            }
        });
    } else if (searchQuery.trim()) { // Or if user typed something and wants to book with that query
        navigate('/client/booking', { state: { destination: searchQuery } });
    } else { // Default booking action if no search query
        navigate('/client/booking');
    }
  };

  const mapMarkers: MapMarker[] = [];
  if (location) {
    mapMarkers.push({ id: 'clientLocation', latitude: location.latitude, longitude: location.longitude, color: '#0052FF', title: t('clientMainMapPage.markerClient') });
    // Faked nearby driver markers using isKoleDriver
    mapMarkers.push({ id: 'driver-1', latitude: location.latitude + 0.005, longitude: location.longitude + 0.005, isKoleDriver: true, title: t('clientMainMapPage.markerDriver') });
    mapMarkers.push({ id: 'driver-2', latitude: location.latitude - 0.005, longitude: location.longitude + 0.003, isKoleDriver: true, title: t('clientMainMapPage.markerDriver') });
    mapMarkers.push({ id: 'driver-3', latitude: location.latitude + 0.003, longitude: location.longitude - 0.005, isKoleDriver: true, title: t('clientMainMapPage.markerDriver') });
  }


  return (
    <div className="h-screen flex flex-col bg-kole-cream-light">
      <div className="flex-1 relative">
        {location ? (
          <MapComponent
            latitude={location.latitude}
            longitude={location.longitude}
            zoom={14}
            style={{ width: '100%', height: '100%' }}
            interactive={true}
            markers={mapMarkers}
          />
        ) : (
          <div className="w-full h-full bg-kole-cream-light flex items-center justify-center">
            <div className="text-center text-kole-text-secondary">
              <Loader2 className="h-12 w-12 mx-auto mb-2 text-kole-blue-primary animate-spin" />
              <p className="text-kole-brown-dark font-semibold">{t('clientBookingPage.loadingMap')}</p>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="kole-card border-kole-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Search className="h-5 w-5 text-kole-text-secondary" />
                <Input
                  placeholder={t('clientMainMapPage.searchPlaceholder')}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-none shadow-none text-lg font-medium text-kole-text-primary placeholder:text-kole-text-secondary"
                />
                <Button 
                  onClick={handleSearch}
                  className="kole-btn-primary px-4 py-2.5 aspect-square"
                  aria-label={t('clientMainMapPage.searchButtonLabel')}
                >
                  <Navigation className="h-5 w-5 text-white" />
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Suggestions List */}
          {searchQuery.length > 0 && !selectedDestination && (
            <Card className="kole-card border-kole-border mt-2 max-h-60 overflow-y-auto">
              <CardContent className="p-0">
                {isSuggestionsLoading && (
                  <div className="p-4 text-center text-kole-text-secondary flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {t('clientSearch.loadingSuggestions')}
                  </div>
                )}
                {!isSuggestionsLoading && suggestions.length === 0 && searchQuery.length >= 3 && (
                  <div className="p-4 text-center text-kole-text-secondary">
                    {t('clientSearch.noResults', { query: searchQuery })}
                  </div>
                )}
                {!isSuggestionsLoading && suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center w-full text-left p-4 hover:bg-kole-hover-bg border-b border-kole-border last:border-b-0"
                  >
                    <MapPin className="h-5 w-5 text-kole-text-secondary mr-3 flex-shrink-0" />
                    <span className="text-sm text-kole-text-primary truncate">{suggestion.place_name}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="absolute bottom-24 right-4 z-10">
          <Button
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-kole-border hover:bg-kole-cream-light"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                  },
                  (geoError) => {
                    console.error('Erreur de géolocalisation (recenter):', geoError);
                    switch (geoError.code) {
                      case geoError.PERMISSION_DENIED: toast.error(t('errors.geolocationPermissionDenied')); break;
                      case geoError.POSITION_UNAVAILABLE: toast.error(t('errors.geolocationPositionUnavailable')); break;
                      case geoError.TIMEOUT: toast.error(t('errors.geolocationTimeout')); break;
                      default: toast.error(t('errors.geolocationFailed')); break;
                    }
                  }
                );
              } else {
                toast.error(t('errors.geolocationUnavailable'));
              }
            }}
            aria-label={t('clientMainMapPage.recenterButtonLabel')}
          >
            <Target className="h-5 w-5 text-kole-blue-primary" />
          </Button>
        </div>

        <div className="absolute top-20 left-4 z-10">
          <Card className="kole-card border-kole-border">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-kole-brown-dark">{nearbyDrivers}</div>
                <div className="text-sm text-kole-text-secondary">{t('clientMainMapPage.nearbyDriversText')}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="absolute bottom-24 left-4 right-4 z-10">
          <Card className="kole-card border-kole-border">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-kole-text-secondary mb-3">{t('clientMainMapPage.quickBookPrompt')}</p>
                <Button 
                  onClick={handleBookRide}
                  className="kole-btn-primary w-full py-3 text-lg font-semibold"
                >
                  {t('clientMainMapPage.quickBookButton')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientMainMapPage;
