import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription, // Added for potential use
  SheetFooter, // Added for potential use
  SheetClose,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch"; // Import Switch
import {
  MapPin, Navigation, ArrowLeft, Search, Loader2,
  Home as HomeIcon, Briefcase as WorkIcon, Wallet, Landmark, Smartphone, ChevronDown, CheckCircle,
  Minus, Plus // Import Minus and Plus
} from 'lucide-react';
import MapComponent, { Marker as MapMarker } from '../../components/MapComponent';
import * as mapService from '../../services/mapService';
import * as rideService from '../../services/rideService';
import * as userService from '../../services/userService'; // Import userService
import { useTranslation } from 'react-i18next';
import RideInfoCard from '../../components/client/RideInfoCard';
import { toast } from 'sonner';
import { debounce } from '../../utils/debounce';

// Define Vehicle Type Options
const VEHICLE_OPTIONS = [
  { id: 'MOTO_STANDARD', labelKey: 'clientBookingPage.vehicleTypes.standard', priceMultiplier: 1.0, baseEtaMinutes: 5, icon: '🏍️' },
  { id: 'MOTO_CONFORT', labelKey: 'clientBookingPage.vehicleTypes.confort', priceMultiplier: 1.5, baseEtaMinutes: 7, icon: '🛵' },
];
type VehicleOptionId = typeof VEHICLE_OPTIONS[number]['id'];

// Helper to get Lucide icons dynamically
const iconComponents: { [key: string]: React.ElementType } = {
  Wallet,
  Landmark,
  Smartphone,
  MapPin // Default/fallback icon
};


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
  const [basePrice, setBasePrice] = useState(0); // Store base price from route calculation

  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState<VehicleOptionId>(VEHICLE_OPTIONS[0].id);

  const [isGeocodingPickup, setIsGeocodingPickup] = useState(true);
  const [isGeocodingDestination, setIsGeocodingDestination] = useState(false);
  const [isDirectionsLoading, setIsDirectionsLoading] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const [suggestions, setSuggestions] = useState<mapService.MapboxFeature[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  const [favoritePlaces, setFavoritePlaces] = useState<userService.FavoritePlace[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [showInitialSuggestions, setShowInitialSuggestions] = useState(false);

  // Payment Method State
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<userService.PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

  // Passenger and Luggage State
  const [passengerCount, setPassengerCount] = useState(1);
  const [hasLuggage, setHasLuggage] = useState(false);

  // This useEffect handles initialization from navigation state (redo trip, search from map) and default geolocation
  useEffect(() => {
    const {
      initialPickupAddress: navPickupAddress,
      initialPickupCoords: navPickupCoords,
      initialDestinationAddress: navDestAddress, // This is what initialDestinationQuery was
      initialDestinationCoords: navDestCoords     // This is what initialDestinationCoords was
    } = locationHook.state || {};

    let pickupHandled = false;
    let destinationHandled = false;

    // Handle Pickup Location from navigation state (Redo Trip)
    if (navPickupCoords) {
      setClientLocation(navPickupCoords);
      if (navPickupAddress) {
        setPickupAddress(navPickupAddress);
        setIsGeocodingPickup(false);
      } else {
        // Coords provided, but no address string - reverse geocode
        mapService.reverseGeocode(navPickupCoords.latitude, navPickupCoords.longitude).then(result => {
          if (result.data) setPickupAddress(result.data.address);
          else {
            toast.error(t(result.error?.messageKey || 'mapService.errors.reverseGeocodeFailed'));
            setPickupAddress(t('clientBookingPage.currentLocationDefault'));
          }
          setIsGeocodingPickup(false);
        });
      }
      pickupHandled = true;
    }

    // Handle Destination Location from navigation state (Redo Trip or Search from Map)
    if (navDestCoords) {
      setDestinationCoordinates(navDestCoords);
      if (navDestAddress) {
        setDestinationAddress(navDestAddress);
        setDestinationQuery(navDestAddress); // Pre-fill search input as well
      } else {
        // Coords provided, but no address string - reverse geocode
        setIsGeocodingDestination(true);
        mapService.reverseGeocode(navDestCoords.latitude, navDestCoords.longitude).then(result => {
          if (result.data) {
            setDestinationAddress(result.data.address);
            setDestinationQuery(result.data.address);
          } else {
            toast.error(t(result.error?.messageKey || 'mapService.errors.reverseGeocodeFailed'));
            setDestinationAddress(t('clientBookingPage.destinationNotGeocoded'));
          }
          setIsGeocodingDestination(false);
        });
      }
      destinationHandled = true;
    } else if (navDestAddress) { // Only address string provided (e.g. from main map search)
      setDestinationQuery(navDestAddress); // Set query to trigger geocoding via handleGeocodeDestination
      handleGeocodeDestination(navDestAddress, false); // Geocode this address
      destinationHandled = true; // Geocoding will set destinationAddress and destinationCoordinates
    }


    // Default Geolocation for Pickup (if not handled by Redo Trip's pickup)
    if (!pickupHandled) {
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
          (error) => {
            console.error('Erreur de géolocalisation:', error);
            setClientLocation({ latitude: 5.3600, longitude: -4.0083 }); // Default Abidjan
            setPickupAddress(t('clientBookingPage.defaultLocationName'));
            setIsGeocodingPickup(false);
            // ... (toast error handling as before)
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
        setClientLocation({ latitude: 5.3600, longitude: -4.0083 }); // Default Abidjan
        setPickupAddress(t('clientBookingPage.defaultLocationName'));
        setIsGeocodingPickup(false);
      }
    }

    // Fetch favorite places (runs regardless of Redo Trip)
    const fetchFavorites = async () => {
        setIsLoadingFavorites(true);
        const result = await userService.getFavoritePlaces();
        if (result.data) {
          setFavoritePlaces(result.data);
        } else if (result.error) {
          console.warn("Failed to load favorites for booking page:", t(result.error.messageKey));
        }
        setIsLoadingFavorites(false);
      };
      fetchFavorites();

    // Fetch available payment methods
    const fetchPaymentMethods = async () => {
      setIsLoadingPaymentMethods(true);
      const result = await userService.getAvailablePaymentMethods();
      if (result.data) {
        setAvailablePaymentMethods(result.data);
        // Set default payment method
        const walletMethod = result.data.find(m => m.id === 'WALLET');
        if (walletMethod && (walletMethod.balance ?? 0) > 0) {
          setSelectedPaymentMethodId('WALLET');
        } else if (result.data.some(m => m.id === 'CASH')) {
          setSelectedPaymentMethodId('CASH');
        } else if (result.data.length > 0) {
          setSelectedPaymentMethodId(result.data[0].id);
        }
      } else if (result.error) {
        toast.error(t(result.error.messageKey, { details: result.error.details || "Payment methods could not be loaded."}));
      }
      setIsLoadingPaymentMethods(false);
    };
    fetchPaymentMethods();

  }, [locationHook.state, t]); // Depend on locationHook.state to re-run if nav state changes

  // Effect for fetching route details (base price/time)
  useEffect(() => {
    if (clientLocation && destinationCoordinates) {
      fetchAndSetRouteDetails(
        [clientLocation.longitude, clientLocation.latitude],
        [destinationCoordinates.longitude, destinationCoordinates.latitude]
      );
    } else {
      setRouteGeoJSON(null);
      setBasePrice(0); // Reset base price
      setEstimatedPrice(0);
      setEstimatedTime('');
    }
  }, [clientLocation, destinationCoordinates]);

  // Effect for recalculating price/ETA based on selected vehicle
  useEffect(() => {
    const selectedOption = VEHICLE_OPTIONS.find(opt => opt.id === selectedVehicleTypeId);
    if (selectedOption && basePrice > 0) {
      setEstimatedPrice(Math.round(basePrice * selectedOption.priceMultiplier));
      // ETA could also be adjusted here if needed, e.g., from selectedOption.baseEtaMinutes
      // For now, primary ETA comes from route, vehicle selection mainly impacts price in this mock
    } else if (basePrice === 0) { // If no route, price is 0
      setEstimatedPrice(0);
    }
    // If route provides an ETA, use that primarily. Vehicle ETA could be a secondary display or factor.
    // For this iteration, we'll keep route ETA and adjust price.
  }, [basePrice, selectedVehicleTypeId]);
  
  const debouncedFetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        setIsSuggestionsLoading(false);
        return;
      }
      setIsSuggestionsLoading(true);
      setShowInitialSuggestions(false);
      const proximity = clientLocation ? { latitude: clientLocation.latitude, longitude: clientLocation.longitude } : undefined;
      const result = await mapService.getPlaceAutocomplete(query, proximity);
      if (result.data) {
        setSuggestions(result.data);
      } else if (result.error) {
        toast.error(t(result.error.messageKey));
        setSuggestions([]);
      }
      setIsSuggestionsLoading(false);
    }, 300),
    [clientLocation, t]
  );

  useEffect(() => {
    // If query is not same as a fully resolved destinationAddress, it means user is typing or query is from initial state
    if (destinationQuery.length > 0 && destinationQuery !== destinationAddress) {
        debouncedFetchSuggestions(destinationQuery);
    } else if (destinationQuery.length < 3) {
        setSuggestions([]); // Clear API suggestions
    }
    // Control visibility of initial suggestions (favorites)
    if (destinationQuery.length < 3) {
        setShowInitialSuggestions(true);
    } else {
        setShowInitialSuggestions(false);
    }
  }, [destinationQuery, destinationAddress, debouncedFetchSuggestions]);

  const handleGeocodeDestination = async (address: string, clearSuggestionsList = true) => {
    if (!address.trim()) return;
    setIsGeocodingDestination(true);
    if (clearSuggestionsList) setSuggestions([]);
    setShowInitialSuggestions(false);

    const result = await mapService.geocodeAddress(address);
    if (result.data) {
      setDestinationCoordinates({ latitude: result.data.latitude, longitude: result.data.longitude });
      setDestinationAddress(result.data.placeName);
      setDestinationQuery(result.data.placeName);
    } else if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details }));
      setDestinationAddress('');
      setDestinationCoordinates(null);
    }
    setIsGeocodingDestination(false);
  };
  
  const fetchAndSetRouteDetails = async (start: [number, number], end: [number, number]) => {
    setIsDirectionsLoading(true);
    setRouteGeoJSON(null);
    setEstimatedPrice(0);
    setEstimatedTime('');
    const result = await mapService.getMapboxDirections(start, end);
    if (result.data) {
      setRouteGeoJSON(result.data.geometry);
      if (result.data.distance) {
        const distanceKm = result.data.distance / 1000;
        const calculatedBasePrice = 300;
        const pricePerKm = 100;
        const newBasePrice = Math.round(calculatedBasePrice + (distanceKm * pricePerKm));
        setBasePrice(newBasePrice); // Set base price first

        // Then let the other useEffect handle selectedVehicleTypeId
        const selectedOption = VEHICLE_OPTIONS.find(opt => opt.id === selectedVehicleTypeId);
        if (selectedOption) {
          setEstimatedPrice(Math.round(newBasePrice * selectedOption.priceMultiplier));
        } else {
          setEstimatedPrice(newBasePrice); // Fallback if somehow no option selected
        }
      } else {
        setBasePrice(0); // No distance, no base price
        setEstimatedPrice(0);
      }
      if (result.data.duration) {
        // For now, vehicle baseEtaMinutes is not directly used to override mapbox ETA
        // It could be displayed alongside or used if mapbox ETA is unavailable
        setEstimatedTime(`${Math.round(result.data.duration / 60)} min`);
      }
    } else if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details }));
    }
    setIsDirectionsLoading(false);
  };
  
  const handleSearch = () => {
    handleGeocodeDestination(destinationQuery);
  };

  const handleSuggestionOrFavoriteClick = (item: mapService.MapboxFeature | userService.FavoritePlace) => {
    const placeName = 'place_name' in item ? item.place_name : item.address;
    const coords = 'center' in item
        ? { latitude: item.center[1], longitude: item.center[0] }
        : { latitude: item.latitude, longitude: item.longitude };

    setDestinationQuery(placeName);
    setDestinationAddress(placeName);
    setDestinationCoordinates(coords);
    setSuggestions([]);
    setShowInitialSuggestions(false);
  };

  const handleDestinationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setDestinationQuery(newQuery);
    // If user clears input or types something new, clear resolved destinationAddress & coords
    // to allow new geocoding or favorite selection.
    if (newQuery !== destinationAddress) {
        setDestinationAddress("");
        setDestinationCoordinates(null);
    }
    if (newQuery.length < 3) {
      setShowInitialSuggestions(true);
      setSuggestions([]);
    } else {
      setShowInitialSuggestions(false);
    }
  };

  const handleDestinationInputFocus = () => {
    if (destinationQuery.length < 3) {
        setShowInitialSuggestions(true);
    }
  };

  const handleDestinationInputBlur = () => {
    setTimeout(() => {
        setShowInitialSuggestions(false);
    }, 150);
  };
  
  const bookRide = async () => {
    if (!selectedPaymentMethodId) {
      toast.error(t('clientBookingPage.errors.selectPaymentMethod', "Veuillez sélectionner un mode de paiement.")); // Added fallback text
      return;
    }
    if (clientLocation && destinationCoordinates && destinationAddress && pickupAddress && routeGeoJSON) {
      setIsSubmittingBooking(true);
      const rideRequestData: rideService.RideRequestData = {
        pickup: { coordinates: clientLocation, address: pickupAddress },
        destination: { coordinates: destinationCoordinates, address: destinationAddress },
        price: estimatedPrice,
        estimatedTime: estimatedTime,
        vehicleType: selectedVehicleTypeId,
        paymentMethodId: selectedPaymentMethodId,
        passengerCount: passengerCount, // Add passengerCount
        hasLuggage: hasLuggage, // Add hasLuggage
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

  const getFavoriteIcon = (label: string) => {
    if (label.toLowerCase().includes(t('clientSearch.homeLabel', { lng: 'fr' }).toLowerCase())) return <HomeIcon className="h-5 w-5 text-kole-blue-primary mr-3 flex-shrink-0" />;
    if (label.toLowerCase().includes(t('clientSearch.workLabel', { lng: 'fr' }).toLowerCase())) return <WorkIcon className="h-5 w-5 text-kole-blue-primary mr-3 flex-shrink-0" />;
    return <MapPin className="h-5 w-5 text-kole-text-secondary mr-3 flex-shrink-0" />;
  };

  const renderPaymentMethodIcon = (iconName?: string) => {
    const IconComponent = iconName ? iconComponents[iconName] : iconComponents['MapPin']; // Default to MapPin if no iconName
    return <IconComponent className="h-5 w-5 mr-3 text-kole-text-secondary group-hover:text-kole-blue-primary transition-colors" />;
  };

  const selectedPaymentMethod = availablePaymentMethods.find(pm => pm.id === selectedPaymentMethodId);

  return (
    <div className="flex flex-col h-screen bg-kole-cream-bg">
      <div className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-30">
        <button onClick={() => navigate('/client')} className="mr-4 p-2 rounded-full hover:bg-kole-hover-bg">
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </button>
        <h1 className="text-lg font-semibold text-kole-text-primary">{t('clientBookingPage.title')}</h1>
      </div>
      
      <div className="bg-white p-4 shadow-sm mb-2"> {/* Added mb-2 for spacing from map if content scrolls */}
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
          <div className="flex-1 relative">
            <p className="text-sm text-kole-text-secondary">{t('clientBookingPage.labels.to')}</p>
            <div className="flex gap-2">
              <Input
                placeholder={t('clientBookingPage.placeholders.destination')}
                value={destinationQuery}
                onChange={handleDestinationInputChange}
                onFocus={handleDestinationInputFocus}
                onBlur={handleDestinationInputBlur}
                className="flex-1 kole-input"
                disabled={isGeocodingDestination || isDirectionsLoading}
                autoComplete="off"
              />
              <Button onClick={handleSearch} className="kole-btn-secondary p-2.5 aspect-square" disabled={isGeocodingDestination || isDirectionsLoading || !destinationQuery.trim()}>
                {isGeocodingDestination ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>
            {/* Suggestions Area: Combines Favorites and Autocomplete */}
            {(showInitialSuggestions || (destinationQuery.length >= 3 && suggestions.length > 0 && !destinationAddress)) && (
                 <Card className="absolute z-20 w-full mt-1 kole-card border-kole-border max-h-60 overflow-y-auto">
                    <CardContent className="p-0">
                        {showInitialSuggestions && destinationQuery.length < 3 && (
                            <>
                            {isLoadingFavorites && <div className="p-3 text-sm text-kole-text-secondary flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin mr-2" />{t('clientSearch.loadingFavorites')}</div>}
                            {!isLoadingFavorites && favoritePlaces.length > 0 && (
                                <>
                                <h4 className="text-xs font-semibold text-kole-text-secondary p-2 border-b border-kole-border">{t('clientSearch.favoritePlacesTitle')}</h4>
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
                            {!isLoadingFavorites && favoritePlaces.length === 0 && destinationQuery.length === 0 && /* Only show 'no favorites' if input is truly empty */ (
                                <div className="p-3 text-sm text-kole-text-secondary text-center">{t('clientSearch.noFavoritesFound')}</div>
                            )}
                            {(suggestions.length > 0 && favoritePlaces.length > 0 && destinationQuery.length < 3) && <hr className="border-kole-border"/>}
                            </>
                        )}

                        {/* API Autocomplete Suggestions (only if query is long enough and not showing initial) */}
                        {destinationQuery.length >= 3 && !destinationAddress && (
                            <>
                                {isSuggestionsLoading && (
                                <div className="p-3 text-sm text-kole-text-secondary flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin mr-2" />{t('clientSearch.loadingSuggestions')}</div>
                                )}
                                {!isSuggestionsLoading && suggestions.length === 0 && (
                                <div className="p-3 text-sm text-kole-text-secondary text-center">{t('clientSearch.noResults', { query: destinationQuery })}</div>
                                )}
                                {!isSuggestionsLoading && suggestions.map((suggestion) => (
                                <button key={suggestion.id} onClick={() => handleSuggestionOrFavoriteClick(suggestion)} className="flex items-center w-full text-left p-3 hover:bg-kole-hover-bg border-b border-kole-border last:border-b-0">
                                    <MapPin className="h-4 w-4 text-kole-text-secondary mr-2.5 flex-shrink-0" />
                                    <span className="text-sm text-kole-text-primary truncate">{suggestion.place_name}</span>
                                </button>
                                ))}
                            </>
                        )}
                    </CardContent>
                 </Card>
            )}
            {isGeocodingDestination && !destinationAddress && destinationQuery.length > 0 && !suggestions.length && !isSuggestionsLoading && (
                 <p className="text-xs text-kole-text-secondary mt-1">{t('clientBookingPage.loadingAddress')}</p>
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
        <div className="bg-white border-t border-kole-border p-4 space-y-4">
          {/* Vehicle Selection UI */}
          <div>
            <h3 className="text-md font-semibold text-kole-text-primary mb-2">
              {t('clientBookingPage.labels.selectVehicleType')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {VEHICLE_OPTIONS.map((option) => {
                const isActive = selectedVehicleTypeId === option.id;
                const currentPriceDisplay = basePrice > 0 ? Math.round(basePrice * option.priceMultiplier) : estimatedPrice;

                return (
                  <Button
                    key={option.id}
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => setSelectedVehicleTypeId(option.id)}
                    className={`flex flex-col items-center justify-center p-3 h-auto kole-card hover:shadow-md transition-all duration-200 ease-in-out ${isActive ? 'kole-btn-primary ring-2 ring-kole-orange-primary shadow-lg' : 'bg-white border-kole-border text-kole-text-primary hover:bg-kole-cream-light'}`}
                  >
                    <span className="text-2xl mb-1">{option.icon}</span>
                    <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-kole-text-primary'}`}>{t(option.labelKey)}</span>
                    {basePrice > 0 && (
                       <span className={`text-xs ${isActive ? 'text-white/90' : 'text-kole-text-secondary'}`}>
                         {currentPriceDisplay.toLocaleString()} FCFA
                       </span>
                    )}
                     <span className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-kole-text-tertiary'}`}>
                        {t('clientBookingPage.vehicleEtaDisplay', { eta: option.baseEtaMinutes })}
                      </span>
                  </Button>
                );
              })}
            </div>
          </div>

          <Card className="border-kole-border">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-lg text-kole-text-primary">{t('clientBookingPage.rideDetailsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 space-y-3">
              <RideInfoCard
                pickupAddress={pickupAddress || t('clientBookingPage.currentLocationDefault')}
                destinationAddress={destinationAddress || (destinationQuery ? t('clientBookingPage.destinationNotGeocoded') : t('clientBookingPage.destinationNotSet'))}
                price={estimatedPrice > 0 ? estimatedPrice : t('clientBookingPage.priceUnavailable')}
                estimatedTime={estimatedTime || t('clientBookingPage.timeUnavailable')}
              />

              {/* Payment Method Display and Selection Trigger */}
              <div>
                <p className="text-xs text-kole-text-secondary mb-1">{t('clientBookingPage.labels.paymentMethod')}</p>
                <Sheet open={isPaymentSheetOpen} onOpenChange={setIsPaymentSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full justify-between kole-input hover:bg-kole-hover-bg">
                      <span className="flex items-center">
                        {selectedPaymentMethod ? (
                          <>
                            {renderPaymentMethodIcon(selectedPaymentMethod.iconName)}
                            {t(selectedPaymentMethod.nameKey, { balance: selectedPaymentMethod.balance?.toLocaleString() })}
                          </>
                        ) : (
                          isLoadingPaymentMethods ? t('clientBookingPage.loadingPaymentMethods', "Chargement...") : t('clientBookingPage.selectPaymentMethodPlaceholder', "Choisir...")
                        )}
                      </span>
                      <ChevronDown className="h-4 w-4 text-kole-text-secondary" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-xl kole-card">
                    <SheetHeader className="mb-4">
                      <SheetTitle className="text-kole-text-primary">{t('selectPaymentMethodSheet.title')}</SheetTitle>
                      {availablePaymentMethods.length === 0 && !isLoadingPaymentMethods && (
                        <SheetDescription className="text-kole-text-secondary">{t('selectPaymentMethodSheet.noMethodsAvailable', "Aucun mode de paiement disponible pour le moment.")}</SheetDescription>
                      )}
                    </SheetHeader>
                    {isLoadingPaymentMethods && (
                       <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-kole-blue-primary mr-2" />
                        <span className="text-kole-text-secondary">{t('clientBookingPage.loadingPaymentMethods', "Chargement des modes de paiement...")}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      {availablePaymentMethods.map((method) => (
                        <Button
                          key={method.id}
                          variant="ghost"
                          className={`w-full justify-start p-3 h-auto group hover:bg-kole-blue-primary/10 ${selectedPaymentMethodId === method.id ? 'bg-kole-blue-primary/10 ring-1 ring-kole-blue-primary' : ''}`}
                          onClick={() => {
                            setSelectedPaymentMethodId(method.id);
                            setIsPaymentSheetOpen(false);
                          }}
                        >
                          {renderPaymentMethodIcon(method.iconName)}
                          <div className="flex flex-col items-start">
                            <span className={`text-sm font-medium ${selectedPaymentMethodId === method.id ? 'text-kole-blue-primary' : 'text-kole-text-primary'}`}>
                              {t(method.nameKey, { balance: method.balance?.toLocaleString() })}
                            </span>
                            {method.id === 'WALLET' && method.balance !== undefined && (
                               <span className={`text-xs ${selectedPaymentMethodId === method.id ? 'text-kole-blue-primary/80' : 'text-kole-text-secondary'}`}>
                                {t('selectPaymentMethodSheet.currentBalance', { balance: method.balance.toLocaleString() })}
                              </span>
                            )}
                          </div>
                          {selectedPaymentMethodId === method.id && (
                            <CheckCircle className="h-5 w-5 text-kole-green-primary ml-auto" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Passenger Count and Luggage Options */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="passenger-count" className="text-sm font-medium text-kole-text-primary">
                      {t('clientBookingPage.labels.passengers')}
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 border-kole-border text-kole-text-secondary hover:bg-kole-hover-bg"
                        onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                        disabled={passengerCount === 1}
                        aria-label={t('clientBookingPage.buttons.decreasePassengers', "Diminuer passagers")}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span id="passenger-count" className="text-sm font-medium text-kole-text-primary w-4 text-center">{passengerCount}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 border-kole-border text-kole-text-secondary hover:bg-kole-hover-bg"
                        onClick={() => setPassengerCount(Math.min(2, passengerCount + 1))} // Max 2 for moto
                        disabled={passengerCount === 2}
                        aria-label={t('clientBookingPage.buttons.increasePassengers', "Augmenter passagers")}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-kole-text-secondary">{t('clientBookingPage.tooltips.passengersInfo')}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="luggage-switch" className="text-sm font-medium text-kole-text-primary">
                      {t('clientBookingPage.labels.luggage')}
                    </label>
                    <Switch
                      id="luggage-switch"
                      checked={hasLuggage}
                      onCheckedChange={setHasLuggage}
                      className="data-[state=checked]:bg-kole-green-primary data-[state=unchecked]:bg-kole-border"
                    />
                  </div>
                  <p className="text-xs text-kole-text-secondary">{t('clientBookingPage.tooltips.luggageInfo')}</p>
                </div>
              </div>

              <Button
                className="w-full kole-btn-primary mt-4"
                onClick={bookRide}
                disabled={!pickupAddress || !destinationAddress || isGeocodingPickup || isGeocodingDestination || !routeGeoJSON || isSubmittingBooking || !selectedPaymentMethodId || isLoadingPaymentMethods}
              >
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
