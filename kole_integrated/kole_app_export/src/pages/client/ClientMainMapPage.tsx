import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { 
  Navigation, 
  Search, 
  Target,
  Loader2,
  MapPin as MapPinIcon, // Aliased to avoid conflict with state/prop
  Home as HomeIcon, // Aliased
  Briefcase as WorkIcon // Aliased
} from 'lucide-react';
import ClientBottomNavBar from '../../components/ClientBottomNavBar';
import MapComponent, { Marker as MapMarker } from '../../components/MapComponent';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import * as mapService from '../../services/mapService';
import * as userService from '../../services/userService'; // Import userService
import { debounce } from '../../utils/debounce';

const ClientMainMapPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyDrivers, setNearbyDrivers] = useState(3);
  
  const [suggestions, setSuggestions] = useState<mapService.MapboxFeature[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<mapService.MapboxFeature | null>(null);

  const [favoritePlaces, setFavoritePlaces] = useState<userService.FavoritePlace[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [showInitialSuggestions, setShowInitialSuggestions] = useState(false);


  useEffect(() => {
    // Fetch initial geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setLocation({ latitude: 5.3600, longitude: -4.0083 }); // Default to Abidjan
          // Error handling toasts as before
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
      setLocation({ latitude: 5.3600, longitude: -4.0083 });
    }

    // Fetch favorite places
    const fetchFavorites = async () => {
      setIsLoadingFavorites(true);
      const result = await userService.getFavoritePlaces();
      if (result.data) {
        setFavoritePlaces(result.data);
      } else if (result.error) {
        // Silently fail or show a non-blocking error for favorites
        console.warn("Failed to load favorites:", t(result.error.messageKey));
      }
      setIsLoadingFavorites(false);
    };
    fetchFavorites();
  }, [t]);

  const debouncedFetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        setIsSuggestionsLoading(false);
        return;
      }
      setIsSuggestionsLoading(true);
      setShowInitialSuggestions(false); // Hide favorites/initial when typing for autocomplete
      const proximity = location ? { latitude: location.latitude, longitude: location.longitude } : undefined;
      const result = await mapService.getPlaceAutocomplete(query, proximity);
      if (result.data) {
        setSuggestions(result.data);
      } else if (result.error) {
        toast.error(t(result.error.messageKey));
        setSuggestions([]);
      }
      setIsSuggestionsLoading(false);
    }, 300), // Adjusted debounce time
    [location, t]
  );

  useEffect(() => {
    if (searchQuery.length >= 3 && !selectedDestination) {
        debouncedFetchSuggestions(searchQuery);
    } else { // Clear API suggestions if query is short or a destination is selected
        setSuggestions([]);
        setIsSuggestionsLoading(false); // Ensure loading is off
    }
    // Show initial suggestions (favorites) if query is short and input is focused
    if (searchQuery.length < 3) {
        setShowInitialSuggestions(true);
    } else {
        setShowInitialSuggestions(false);
    }
  }, [searchQuery, selectedDestination, debouncedFetchSuggestions]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    setSelectedDestination(null);
    if (newQuery.length < 3) {
      setShowInitialSuggestions(true); // Show favorites when query is short
      setSuggestions([]); // Clear API suggestions
    } else {
      setShowInitialSuggestions(false); // Hide favorites when typing for API suggestions
    }
  };

  const handleInputFocus = () => {
    if (searchQuery.length < 3) {
        setShowInitialSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click
    setTimeout(() => {
        setShowInitialSuggestions(false);
        // Do not clear API suggestions here, let useEffect handle it based on query length
    }, 150);
  };


  const handleSuggestionOrFavoriteClick = (item: mapService.MapboxFeature | userService.FavoritePlace) => {
    const placeName = 'place_name' in item ? item.place_name : item.address;
    const coords = 'center' in item ? { latitude: item.center[1], longitude: item.center[0] } : { latitude: item.latitude, longitude: item.longitude };

    setSearchQuery(placeName);
    setSelectedDestination(item as mapService.MapboxFeature); // Store the selected item, cast for now
    setSuggestions([]);
    setShowInitialSuggestions(false);

    navigate('/client/booking', {
        state: {
            destination: placeName,
            destinationCoordinates: coords
        }
    });
  };

  const handleSearch = () => {
    // This function is triggered by the search button
    if (selectedDestination) { // If a suggestion was clicked and state updated before this call
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
      navigate('/client/booking', { state: { destination: searchQuery } });
    }
  };

  const handleBookRide = () => {
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
        navigate('/client/booking', { state: { destination: searchQuery } });
    } else {
        navigate('/client/booking');
    }
  };

  const mapMarkers: MapMarker[] = [];
  if (location) {
    mapMarkers.push({ id: 'clientLocation', latitude: location.latitude, longitude: location.longitude, color: '#0052FF', title: t('clientMainMapPage.markerClient') });
    mapMarkers.push({ id: 'driver-1', latitude: location.latitude + 0.005, longitude: location.longitude + 0.005, isKoleDriver: true, title: t('clientMainMapPage.markerDriver') });
    mapMarkers.push({ id: 'driver-2', latitude: location.latitude - 0.005, longitude: location.longitude + 0.003, isKoleDriver: true, title: t('clientMainMapPage.markerDriver') });
    mapMarkers.push({ id: 'driver-3', latitude: location.latitude + 0.003, longitude: location.longitude - 0.005, isKoleDriver: true, title: t('clientMainMapPage.markerDriver') });
  }

  const getFavoriteIcon = (label: string) => {
    if (label.toLowerCase().includes(t('clientSearch.homeLabel').toLowerCase())) return <HomeIcon className="h-5 w-5 text-kole-blue-primary mr-3 flex-shrink-0" />;
    if (label.toLowerCase().includes(t('clientSearch.workLabel').toLowerCase())) return <WorkIcon className="h-5 w-5 text-kole-blue-primary mr-3 flex-shrink-0" />;
    return <MapPinIcon className="h-5 w-5 text-kole-text-secondary mr-3 flex-shrink-0" />;
  };

  return (
    <div className="h-screen flex flex-col bg-kole-cream-light">
      <div className="flex-1 relative">
        {location ? (
          <MapComponent latitude={location.latitude} longitude={location.longitude} zoom={14} style={{ width: '100%', height: '100%' }} interactive={true} markers={mapMarkers} />
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
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-none shadow-none text-lg font-medium text-kole-text-primary placeholder:text-kole-text-secondary"
                />
                <Button onClick={handleSearch} className="kole-btn-primary px-4 py-2.5 aspect-square" aria-label={t('clientMainMapPage.searchButtonLabel')}>
                  <Navigation className="h-5 w-5 text-white" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions Area: Combines Favorites and Autocomplete */}
          {(showInitialSuggestions || (searchQuery.length >= 3 && !selectedDestination)) && (
            <Card className="kole-card border-kole-border mt-2 max-h-60 overflow-y-auto">
              <CardContent className="p-0">
                {/* Show Favorites if query is short and input is focused */}
                {showInitialSuggestions && searchQuery.length < 3 && (
                  <>
                    {isLoadingFavorites && <div className="p-4 text-center text-kole-text-secondary">{t('clientSearch.loadingFavorites')}</div>}
                    {!isLoadingFavorites && favoritePlaces.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold text-kole-text-primary p-3 border-b border-kole-border">{t('clientSearch.favoritePlacesTitle')}</h4>
                        {favoritePlaces.map((fav) => (
                          <button key={fav.id} onClick={() => handleSuggestionOrFavoriteClick(fav)} className="flex items-center w-full text-left p-3 hover:bg-kole-hover-bg border-b border-kole-border last:border-b-0">
                            {getFavoriteIcon(fav.label)}
                            <div>
                                <span className="text-sm text-kole-text-primary block truncate font-medium">{fav.label}</span>
                                <span className="text-xs text-kole-text-secondary block truncate">{fav.address}</span>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                    {!isLoadingFavorites && favoritePlaces.length === 0 && (
                      <div className="p-4 text-center text-sm text-kole-text-secondary">{t('clientSearch.noFavoritesFound')}</div>
                    )}
                     {/* Separator if both favorites and suggestions might show, though current logic makes them exclusive */}
                    {suggestions.length > 0 && favoritePlaces.length > 0 && <hr className="border-kole-border"/>}
                  </>
                )}

                {/* API Autocomplete Suggestions */}
                {searchQuery.length >= 3 && !selectedDestination && (
                  <>
                    {isSuggestionsLoading && (
                      <div className="p-4 text-center text-kole-text-secondary flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        {t('clientSearch.loadingSuggestions')}
                      </div>
                    )}
                    {!isSuggestionsLoading && suggestions.length === 0 && (
                      <div className="p-4 text-center text-kole-text-secondary">
                        {t('clientSearch.noResults', { query: searchQuery })}
                      </div>
                    )}
                    {!isSuggestionsLoading && suggestions.map((suggestion) => (
                      <button key={suggestion.id} onClick={() => handleSuggestionOrFavoriteClick(suggestion)} className="flex items-center w-full text-left p-3 hover:bg-kole-hover-bg border-b border-kole-border last:border-b-0">
                        <MapPinIcon className="h-5 w-5 text-kole-text-secondary mr-3 flex-shrink-0" />
                        <span className="text-sm text-kole-text-primary truncate">{suggestion.place_name}</span>
                      </button>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="absolute bottom-24 right-4 z-10">
          <Button
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-kole-border hover:bg-kole-cream-light"
            onClick={() => { /* ... existing recenter logic ... */
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
                <Button onClick={handleBookRide} className="kole-btn-primary w-full py-3 text-lg font-semibold">
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
