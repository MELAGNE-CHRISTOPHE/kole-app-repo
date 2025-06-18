import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Navigation, Phone, MessageCircle, Star, Loader2, AlertTriangle, Share2 } from 'lucide-react'; // Added Share2
import MapComponent, { Marker } from '../../components/MapComponent';
import * as rideService from '../../services/rideService';
import * as mapService from '../../services/mapService'; // Added mapService
import * as emergencyService from '../../services/emergencyService';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { GeoJSONFeature } from 'mapbox-gl'; // For routeGeoJSON typing

const ClientTrackRidePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locationHook = useLocation();

  const {
    rideDetails: initialRideDetails,
    driver: initialDriverDetails,
    bookingId: navBookingId
  } = locationHook.state || {};

  const [rideDetails] = useState(initialRideDetails || {
    pickup: { coordinates: { latitude: 5.3410, longitude: -4.0170 }, address: t('clientTrackRidePage.defaultPickup') },
    destination: { coordinates: { latitude: 5.3450, longitude: -4.0250 }, address: t('clientTrackRidePage.defaultDestination') },
    price: 0,
    estimatedTime: 'N/A', // This might be initial estimate, live ETA will update
  });

  const [driverStaticDetails] = useState<rideService.DriverData | null>(initialDriverDetails || null);
  const [bookingId] = useState<string | null>(navBookingId || null);
  
  const [liveDriverLocation, setLiveDriverLocation] = useState<{latitude: number, longitude: number} | null>(
    initialDriverDetails ? { latitude: initialDriverDetails.latitude, longitude: initialDriverDetails.longitude } : null // Start with initial driver loc if passed
  );
  const [currentRideStatus, setCurrentRideStatus] = useState<rideService.RideStatus | null>(null);
  const [currentEta, setCurrentEta] = useState<string | null>(initialDriverDetails?.arrivalTime || rideDetails.estimatedTime);
  
  const [waitingTimer, setWaitingTimer] = useState<number | null>(null);
  const [extraCharge, setExtraCharge] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // SOS State
  const [showSosConfirmDialog, setShowSosConfirmDialog] = useState(false);
  const [isActivatingSos, setIsActivatingSos] = useState(false);

  // Cancel Ride State
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);
  const [isCancellingRide, setIsCancellingRide] = useState(false);
  const stopLocationUpdatesRef = useRef<(() => void) | null>(null);

  // Detailed Route State
  const [currentRouteGeoJSON, setCurrentRouteGeoJSON] = useState<GeoJSONFeature | null>(null);
  const [isFetchingTrackRoute, setIsFetchingTrackRoute] = useState(false);

  useEffect(() => {
    if (!bookingId || !driverStaticDetails || !rideDetails.pickup?.coordinates || !rideDetails.destination?.coordinates) {
      toast.error(t('rideService.errors.bookingNotFound'));
      navigate('/client');
      return;
    }

    // Use initial driver location from navigation state if available, otherwise use a fallback for simulation
    const initialSimDriverLat = liveDriverLocation?.latitude || rideDetails.pickup.coordinates.latitude - 0.02; // Start driver bit away
    const initialSimDriverLng = liveDriverLocation?.longitude || rideDetails.pickup.coordinates.longitude - 0.02;

    setIsLoading(false); // Assuming initial data is enough to show map, service will update live.
    
    const cleanupSubscription = rideService.getDriverLocationUpdates(
      bookingId,
      (update) => {
        console.log("Driver update received:", update);
        setLiveDriverLocation({ latitude: update.latitude, longitude: update.longitude });
        if (update.eta) setCurrentEta(update.eta);
        setCurrentRideStatus(update.rideStatus);

        if (update.rideStatus === 'WAITING_AT_PICKUP' && waitingTimer === null) {
            // Driver just arrived, start the 3-minute free waiting timer
            setWaitingTimer(180);
        }
      },
      { lat: initialSimDriverLat, lng: initialSimDriverLng },
      { lat: rideDetails.pickup.coordinates.latitude, lng: rideDetails.pickup.coordinates.longitude },
      { lat: rideDetails.destination.coordinates.latitude, lng: rideDetails.destination.coordinates.longitude }
    );
    stopLocationUpdatesRef.current = cleanupSubscription;

    return () => {
      if (stopLocationUpdatesRef.current) {
        stopLocationUpdatesRef.current();
      }
    };
  }, [bookingId, driverStaticDetails, rideDetails, navigate, t]);

  useEffect(() => {
    if (currentRideStatus === 'ARRIVED_AT_DESTINATION') {
      setTimeout(() => {
        navigate('/client/rate-ride', {
          state: {
            rideDetails, // This should include the final price with extra charges
            driver: driverStaticDetails,
            bookingId,
            extraCharge
          }
        });
      }, 3000);
    }
  }, [currentRideStatus, navigate, rideDetails, driverStaticDetails, bookingId, extraCharge]);

  useEffect(() => {
    let timerIntervalId: number | undefined = undefined;
    if (currentRideStatus === 'WAITING_AT_PICKUP' && waitingTimer !== null) {
      timerIntervalId = window.setInterval(() => {
        setWaitingTimer(prev => {
          if (prev === null) return null;
          if (prev <= 0) { // Free waiting time is over
            const timeOver = Math.abs(prev);
            if (timeOver > 0 && timeOver % 60 === 0) { // Charge per minute after free time
              setExtraCharge(c => c + 50);
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (currentRideStatus !== 'WAITING_AT_PICKUP' && waitingTimer !== null) {
        // If status changes from waiting, ensure timer is cleared if it was running.
        // This might be redundant if confirmPresence clears it, but good as a safeguard.
        setWaitingTimer(null);
    }
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, [currentRideStatus, waitingTimer]);

  const fetchAndDisplayRouteForLeg = async (
    originCoords: { latitude: number; longitude: number },
    targetCoords: { latitude: number; longitude: number }
  ) => {
    setIsFetchingTrackRoute(true);
    try {
      const result = await mapService.getMapboxDirections(
        [originCoords.longitude, originCoords.latitude],
        [targetCoords.longitude, targetCoords.latitude]
      );
      if (result.data && result.data.geometry) {
        setCurrentRouteGeoJSON({
          type: 'Feature',
          geometry: result.data.geometry,
          properties: {},
        } as GeoJSONFeature); // Type assertion
        if (result.data.duration && currentRideStatus !== 'WAITING_AT_PICKUP') { // Don't overwrite ETA if driver is waiting
          setCurrentEta(`~${Math.round(result.data.duration / 60)} min`);
        }
      } else if (result.error) {
        toast.error(t(result.error.messageKey || 'mapService.errors.directionsFailed'));
        setCurrentRouteGeoJSON(null); // Clear old route on error
      }
    } catch (error) {
      console.error("Error fetching route for leg:", error);
      toast.error(t('mapService.errors.directionsFailed'));
      setCurrentRouteGeoJSON(null);
    } finally {
      setIsFetchingTrackRoute(false);
    }
  };

  // Effect to fetch route when driver location or ride status changes
  useEffect(() => {
    if (!liveDriverLocation || !currentRideStatus || !rideDetails.pickup?.coordinates || !rideDetails.destination?.coordinates) {
      return;
    }

    let targetCoords;
    if (currentRideStatus === 'TO_CLIENT' || currentRideStatus === 'WAITING_AT_PICKUP') {
      targetCoords = rideDetails.pickup.coordinates;
    } else if (currentRideStatus === 'IN_PROGRESS_TO_DESTINATION') {
      targetCoords = rideDetails.destination.coordinates;
    } else {
      // For ARRIVED or other states, clear the actively fetched route.
      // A static full route might be shown if desired, but that's separate.
      setCurrentRouteGeoJSON(null);
      return;
    }
    // Avoid fetching if driver is at the target already for TO_CLIENT/WAITING (e.g. at pickup)
    // or at destination for IN_PROGRESS
    const R_EARTH = 6371e3; // metres
    const lat1 = liveDriverLocation.latitude * Math.PI/180;
    const lat2 = targetCoords.latitude * Math.PI/180;
    const deltaLat = (targetCoords.latitude-liveDriverLocation.latitude) * Math.PI/180;
    const deltaLng = (targetCoords.longitude-liveDriverLocation.longitude) * Math.PI/180;
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R_EARTH * c; // in metres

    if (distance > 50) { // Only fetch if driver is more than 50m away from current leg's target
        fetchAndDisplayRouteForLeg(liveDriverLocation, targetCoords);
    } else if (currentRideStatus === 'TO_CLIENT') { // If close to pickup, and status is TO_CLIENT, it implies arrival at pickup
        // Potentially redundant if service updates status quickly, but can help UI feel responsive
        // setCurrentRideStatus('WAITING_AT_PICKUP'); // This might conflict with service push
    }


  }, [liveDriverLocation, currentRideStatus, rideDetails.pickup, rideDetails.destination, t]);


  const formatWaitingTime = () => {
    if (waitingTimer === null) return '00:00';
    const absTimer = Math.abs(waitingTimer);
    const minutes = Math.floor(absTimer / 60);
    const seconds = absTimer % 60;
    const sign = waitingTimer < 0 ? '-' : '';
    return `${sign}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const callDriver = () => {
    if (driverStaticDetails?.phone) window.location.href = `tel:${driverStaticDetails.phone}`;
  };

  const handleShareRide = async () => {
    if (!bookingId || !rideDetails || !driverStaticDetails) {
      toast.info(t('clientTrackRidePage.toasts.shareNotReady', "Les détails du trajet ne sont pas encore prêts pour le partage."));
      return;
    }

    const rideTrackUrl = `https://kole.africa/track?id=${bookingId}`; // Conceptual URL
    const shareData = {
      title: t('clientTrackRidePage.shareContent.title'),
      text: t('clientTrackRidePage.shareContent.text', {
        destinationAddress: rideDetails.destination?.address || t('clientTrackRidePage.shareContent.unknownDestination', "destination inconnue"),
        driverName: driverStaticDetails.name || t('clientTrackRidePage.shareContent.yourKoleDriver', "votre chauffeur Kôlê"),
        rideTrackUrl: rideTrackUrl,
      }),
      url: rideTrackUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success(t('clientTrackRidePage.toasts.shareSuccessful'));
      } catch (err) {
        console.error('Share failed:', err);
        if ((err as Error).name !== 'AbortError') { // Don't toast if user cancelled
          toast.error(t('clientTrackRidePage.toasts.shareFailed', { error: (err as Error).message }));
        }
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(rideTrackUrl);
        toast.success(t('clientTrackRidePage.toasts.clipboardCopySuccess'));
      } catch (err) {
        console.error('Clipboard copy failed:', err);
        toast.error(t('clientTrackRidePage.toasts.clipboardCopyFailed'));
      }
    }
  };

  const handleSosConfirm = async () => {
    if (!bookingId) {
      toast.error(t('rideService.errors.bookingNotFound')); // Or a more generic SOS error
      return;
    }
    // Determine current location for SOS
    const currentLocation = liveDriverLocation
      ? { latitude: liveDriverLocation.latitude, longitude: liveDriverLocation.longitude }
      : (rideDetails.pickup?.coordinates || { latitude: 0, longitude: 0 }); // Fallback if no live location

    setIsActivatingSos(true);
    const toastId = toast.loading(t('clientTrackRidePage.toasts.sosActivationInProgress'));

    try {
      const result = await emergencyService.triggerSOS(bookingId, currentLocation);
      toast.dismiss(toastId);

      if (result.error) {
        toast.error(t(result.error.messageKey, { details: result.error.details }));
      } else if (result.data?.success) {
        toast.success(t(result.data.messageKey || 'emergencyService.success.sosActivated'));
        // Potentially further UI changes or navigation, out of scope for this task
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(t('emergencyService.errors.sosFailed'));
      console.error("SOS activation unexpected error:", error);
    } finally {
      setShowSosConfirmDialog(false);
      setIsActivatingSos(false);
    }
  };

  const handleCancelRideConfirm = async () => {
    if (!bookingId) {
      toast.error(t('rideService.errors.bookingNotFound'));
      return;
    }
    setIsCancellingRide(true);
    const toastId = toast.loading(t('clientTrackRidePage.toasts.cancelRideInProgress'));

    try {
      const result = await rideService.cancelRideRequest(bookingId);
      toast.dismiss(toastId);

      if (result.error) {
        toast.error(t(result.error.messageKey || 'rideService.errors.cancelRideFailed'));
      } else if (result.data?.success) {
        toast.success(t(result.data.messageKey || 'rideService.success.rideCancelled'));
        if (stopLocationUpdatesRef.current) {
          stopLocationUpdatesRef.current(); // Stop listening to location updates
        }
        navigate('/client'); // Navigate to main map or dashboard
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(t('rideService.errors.cancelRideFailed'));
      console.error("Cancel ride unexpected error:", error);
    } finally {
      setShowCancelConfirmDialog(false);
      setIsCancellingRide(false);
    }
  };
  
  const confirmPresence = () => {
    // This action now primarily updates the local state to reflect the client is ready.
    // The service simulation `getDriverLocationUpdates` will see this change if it checks `mockBooking.status`
    // or this page could send a specific event to a real backend.
    // For the mock, we directly influence the state that the service's simulation might also be trying to set.
    setCurrentRideStatus('IN_PROGRESS_TO_DESTINATION');
    // Reset ETA for the next leg of the journey (driver to destination)
    // This should ideally come from the service based on the new leg.
    // For now, we might just clear it or set a placeholder.
    // setCurrentEta(null); // ETA will be updated by fetchAndDisplayRouteForLeg
    setWaitingTimer(null); // Stop and clear waiting timer

    // Fetch route for the next leg (driver at pickup to destination)
    if (liveDriverLocation && rideDetails.destination?.coordinates) {
      fetchAndDisplayRouteForLeg(liveDriverLocation, rideDetails.destination.coordinates);
    }
  };

  const mapMarkers: Marker[] = [];
  if (rideDetails.pickup?.coordinates) {
    mapMarkers.push({ id: 'pickup', latitude: rideDetails.pickup.coordinates.latitude, longitude: rideDetails.pickup.coordinates.longitude, color: '#FF8C00', title: t('clientTrackRidePage.markerTitles.pickup') });
  }
  if (rideDetails.destination?.coordinates) {
    mapMarkers.push({ id: 'destination', latitude: rideDetails.destination.coordinates.latitude, longitude: rideDetails.destination.coordinates.longitude, color: '#22C55E', title: t('clientTrackRidePage.markerTitles.destination') });
  }
  // const routeForMap variable and its logic can be removed as currentRouteGeoJSON is now used.

  let pageTitle = t('clientTrackRidePage.titleToClient');
  let statusMessage = driverStaticDetails ? t('clientTrackRidePage.statusMessageToClient', { driverName: driverStaticDetails.name, eta: currentEta || '...' }) : "";

  if (currentRideStatus === 'WAITING_AT_PICKUP') {
    pageTitle = t('clientTrackRidePage.titleWaiting');
    statusMessage = driverStaticDetails ? t('clientTrackRidePage.statusMessageWaiting', { driverName: driverStaticDetails.name }) : "";
  } else if (currentRideStatus === 'IN_PROGRESS_TO_DESTINATION') {
    pageTitle = t('clientTrackRidePage.titleInProgress');
    statusMessage = t('clientTrackRidePage.statusMessageInProgress', { destinationAddress: rideDetails.destination.address, eta: currentEta || '...' });
  } else if (currentRideStatus === 'ARRIVED_AT_DESTINATION') {
    pageTitle = t('clientTrackRidePage.titleArrived');
    statusMessage = t('clientTrackRidePage.statusMessageArrived', { destinationAddress: rideDetails.destination.address });
  }


  if (isLoading && !liveDriverLocation) { // Show full page loader only if initial driver location isn't even set
    return (
      <div className="h-screen flex flex-col bg-kole-cream-bg items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-kole-blue-primary mb-4" />
        <p className="text-kole-text-secondary">{t('clientTrackRidePage.loadingInitial')}</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen bg-kole-cream-bg">
      <div className="bg-white shadow-sm p-4 border-b border-kole-border">
        <h1 className="text-lg font-semibold text-kole-text-primary text-center">{pageTitle}</h1>
      </div>
      
      <div className="flex-1 relative">
        {liveDriverLocation ? (
            <MapComponent
                latitude={liveDriverLocation.latitude}
                longitude={liveDriverLocation.longitude}
                zoom={15}
                style={{ width: '100%', height: '100%' }}
                interactive={true}
                driverLatitude={liveDriverLocation.latitude}
                driverLongitude={liveDriverLocation.longitude}
                markers={mapMarkers}
                routeGeoJSON={currentRouteGeoJSON} // Use detailed GeoJSON route
            />
        ) : (
             <div className="w-full h-full flex items-center justify-center bg-kole-cream-light">
                <Loader2 className="h-8 w-8 text-kole-blue-primary animate-spin mr-2" />
                <p className="text-kole-brown-dark font-semibold">{t('clientBookingPage.loadingMap')}</p> {/* Re-use existing key */}
            </div>
        )}
        
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white px-4 py-2 rounded-full shadow-md text-kole-text-primary flex items-center">
          {isFetchingTrackRoute && <Loader2 className="h-4 w-4 animate-spin text-kole-blue-primary mr-2" />}
          <p className="text-sm font-medium text-center">{statusMessage}</p>
        </div>
      </div>
      
      <div className="bg-white border-t border-kole-border p-4">
        <Card className="border-kole-border">
          <CardContent className="p-4">
            {driverStaticDetails && (
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                  <img src={driverStaticDetails.photo} alt={driverStaticDetails.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-kole-text-primary">{driverStaticDetails.name}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-kole-orange-primary" fill="currentColor" />
                    <span className="text-sm ml-1 text-kole-text-secondary">{driverStaticDetails.rating}</span>
                  </div>
                  <p className="text-sm text-kole-text-secondary">{driverStaticDetails.vehicle} • {driverStaticDetails.plate}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={callDriver} className="border-kole-blue-primary text-kole-blue-primary hover:bg-kole-blue-primary/10 p-2" aria-label={t('clientTrackRidePage.callDriverLabel', {driverName: driverStaticDetails.name})}>
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="border-kole-blue-primary text-kole-blue-primary hover:bg-kole-blue-primary/10 p-2" aria-label={t('clientTrackRidePage.messageDriverLabel', {driverName: driverStaticDetails.name})}>
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShareRide} className="border-kole-blue-primary text-kole-blue-primary hover:bg-kole-blue-primary/10 p-2" aria-label={t('clientTrackRidePage.buttons.shareRideAriaLabel')}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-kole-orange-primary mr-2 mt-0.5" />
                <div>
                  <p className="text-xs text-kole-text-secondary uppercase">{t('rideInfoCard.fromLabel')}</p>
                  <p className="text-sm text-kole-text-primary">{rideDetails.pickup.address}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Navigation className="h-5 w-5 text-kole-green-dark mr-2 mt-0.5" />
                <div>
                  <p className="text-xs text-kole-text-secondary uppercase">{t('rideInfoCard.toLabel')}</p>
                  <p className="text-sm text-kole-text-primary">{rideDetails.destination.address}</p>
                </div>
              </div>
            </div>
            
            {currentRideStatus === 'WAITING_AT_PICKUP' && (
              <div className="space-y-3 my-4 p-3 bg-kole-blue-primary/5 rounded-lg">
                <div className="flex justify-between items-center text-kole-blue-dark">
                  <div>
                    <p className="text-sm font-medium">{t('clientTrackRidePage.waitingTimeLabel')}</p>
                    <p className={`font-bold text-lg ${waitingTimer !== null && waitingTimer < 0 ? 'text-kole-destructive' : ''}`}>
                      {formatWaitingTime()}
                    </p>
                  </div>
                  {waitingTimer !== null && waitingTimer < 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium">{t('clientTrackRidePage.extraChargeLabel')}</p>
                      <p className="font-bold text-kole-destructive text-lg">+{extraCharge} FCFA</p>
                    </div>
                  )}
                </div>
                <Button className="w-full kole-btn-primary bg-kole-green-dark hover:bg-kole-green-dark/90" onClick={confirmPresence}>
                  {t('clientTrackRidePage.confirmPresenceButton')}
                </Button>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-kole-border">
              <div className="flex justify-between">
                <p className="font-medium text-kole-text-secondary">{t('clientTrackRidePage.totalPriceLabel')}</p>
                <p className="font-bold text-kole-text-primary text-lg">{rideDetails.price + extraCharge} FCFA</p>
              </div>
            </div>

            {/* SOS Button and Dialog */}
            <div className="mt-4">
              <AlertDialog open={showSosConfirmDialog} onOpenChange={setShowSosConfirmDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full font-bold bg-kole-destructive text-white hover:bg-kole-destructive/90"
                    disabled={isActivatingSos}
                  >
                    {isActivatingSos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                    {t('clientTrackRidePage.buttons.sos')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="kole-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('clientTrackRidePage.sosConfirmDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('clientTrackRidePage.sosConfirmDialog.message')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="kole-btn-secondary" disabled={isActivatingSos}>{t('clientTrackRidePage.sosConfirmDialog.cancelText')}</AlertDialogCancel>
                    <AlertDialogAction
                      className="kole-btn-destructive" // Ensure this style exists or use bg-kole-destructive etc.
                      onClick={handleSosConfirm}
                      disabled={isActivatingSos}
                    >
                      {isActivatingSos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {t('clientTrackRidePage.sosConfirmDialog.confirmText')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Cancel Ride Button and Dialog */}
            {(currentRideStatus === 'TO_CLIENT' || currentRideStatus === 'WAITING_AT_PICKUP') && (
              <div className="mt-2">
                <AlertDialog open={showCancelConfirmDialog} onOpenChange={setShowCancelConfirmDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full font-semibold border-kole-destructive text-kole-destructive hover:bg-kole-destructive/10"
                      disabled={isCancellingRide}
                    >
                      {isCancellingRide ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {t('clientTrackRidePage.buttons.cancelRide')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="kole-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('clientTrackRidePage.cancelRideDialog.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {currentRideStatus === 'TO_CLIENT'
                          ? t('clientTrackRidePage.cancelRideDialog.messageBeforeDriverArrival')
                          : t('clientTrackRidePage.cancelRideDialog.messageDefault')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="kole-btn-secondary" disabled={isCancellingRide}>
                        {t('clientTrackRidePage.cancelRideDialog.keepRideText')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-kole-destructive hover:bg-kole-destructive/90 text-white"
                        onClick={handleCancelRideConfirm}
                        disabled={isCancellingRide}
                      >
                        {isCancellingRide ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {t('clientTrackRidePage.cancelRideDialog.confirmText')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientTrackRidePage;
