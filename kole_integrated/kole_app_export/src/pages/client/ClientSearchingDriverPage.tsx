import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react'; // Added Loader2
import RideInfoCard from '../../components/client/RideInfoCard';
import * as rideService from '../../services/rideService'; // Import rideService
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const POLLING_INTERVAL = 5000; // 5 seconds for polling
const DRIVER_FOUND_REDIRECT_DELAY = 3000; // 3 seconds

const ClientSearchingDriverPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Attempt to get bookingId and initialRideDetails from navigation state
  const { bookingId: navBookingId, rideDetails: navRideDetails } = location.state || {};

  const [initialRideDetails] = useState(navRideDetails || {
    pickup: { address: t('clientSearchingDriverPage.defaultPickup') },
    destination: { address: t('clientSearchingDriverPage.defaultDestination') },
    price: 0,
    estimatedTime: 'N/A'
  });
  const [bookingId] = useState<string | null>(navBookingId || null);

  const [driverFound, setDriverFound] = useState(false);
  const [driverDetails, setDriverDetails] = useState<rideService.DriverData | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false); // For the small loader icon next to text
  const [isCancelling, setIsCancelling] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);
  const [fetchAttemptCount, setFetchAttemptCount] = useState(0); // New state for error/attempt counting

  useEffect(() => {
    if (!bookingId) {
      toast.error(t('rideService.errors.bookingNotFound'));
      navigate('/client'); // Or back to booking page
      return;
    }

    // setIsCheckingStatus(true); // Initial check can be considered part of page load, main spinner is enough
    let currentFetchAttempts = 0; // Local variable for attempts within this effect's lifetime

    const intervalId = setInterval(async () => {
      currentFetchAttempts++;
      setFetchAttemptCount(currentFetchAttempts); // Update state for potential use elsewhere if needed
      setSearchTimer(prev => prev + POLLING_INTERVAL / 1000);
      setIsCheckingStatus(true); // Indicate active poll

      const result = await rideService.getBookingStatus(bookingId);
      setIsCheckingStatus(false); // Poll finished

      if (result.error) {
        toast.error(t(result.error.messageKey, { details: result.error.details }));
        if (result.error.messageKey === 'rideService.errors.bookingNotFound' || currentFetchAttempts >= 5) {
          clearInterval(intervalId);
          // Optionally set a page-level error state here to offer a "Try Again" button
          // For now, toast is the main feedback and polling stops.
          console.log(`Polling stopped due to: ${result.error.messageKey} or max attempts reached.`);
        }
      } else if (result.data) {
        if (result.data.status === 'DRIVER_FOUND' && result.data.driverDetails) {
          setDriverDetails(result.data.driverDetails);
          setDriverFound(true);
          setFetchAttemptCount(0); // Reset on success
          clearInterval(intervalId);
          setTimeout(() => {
            navigate('/client/track-ride', {
              state: {
                rideDetails: initialRideDetails,
                driver: result.data!.driverDetails, // Already checked DRIVER_FOUND
                bookingId
              }
            });
          }, DRIVER_FOUND_REDIRECT_DELAY);
        } else if (result.data.status === 'SEARCHING_FOR_DRIVER') {
          // Continue polling, driver not yet found
          // setIsCheckingStatus(true); // Status is set at the start of the interval work
        } else {
          // Handle other statuses if any, or treat as error/still searching
          console.warn("Unhandled booking status:", result.data.status);
          // If unhandled status persists, it will eventually hit fetchAttemptCount limit
        }
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [bookingId, navigate, t, initialRideDetails]);

  const handleCancelSearch = async () => {
    if (!bookingId) return;
    setIsCancelling(true);
    const result = await rideService.cancelRideRequest(bookingId);
    if (result.error) {
      toast.error(t(result.error.messageKey, { details: result.error.details }));
    } else if (result.data?.success && result.data.messageKey) {
      toast.success(t(result.data.messageKey));
      navigate('/client');
    }
    setIsCancelling(false);
  };

  const headerTitle = driverFound
    ? t('clientSearchingDriverPage.titleFound')
    : t('clientSearchingDriverPage.titleSearching');

  return (
    <div className="flex flex-col h-screen bg-kole-cream-bg">
      <div className="bg-white shadow-sm p-4 flex items-center border-b border-kole-border">
        <Button variant="ghost" size="icon" onClick={handleCancelSearch} disabled={isCancelling || driverFound} className="mr-2 hover:bg-kole-hover-bg rounded-full">
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </Button>
        <h1 className="text-lg font-semibold text-kole-text-primary">{headerTitle}</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!driverFound ? (
          <>
            {/* Radar Animation */}
            <div className="relative flex items-center justify-center w-40 h-40 mb-6"> {/* Increased size for better visibility */}
              <div className="absolute w-full h-full rounded-full bg-kole-blue-primary/10 animate-ping-slow-radar"></div>
              <div className="absolute w-2/3 h-2/3 rounded-full bg-kole-blue-primary/20 animate-ping-medium-radar"></div>
              <div className="absolute w-1/3 h-1/3 rounded-full bg-kole-blue-primary/30 animate-ping-fast-radar"></div>
              {/* Assuming a symbol logo exists, otherwise use a generic icon or remove */}
              <img src="/assets/kole_logo_principal.png" alt={t('authLayout.koleLogoAlt')} className="w-12 h-12 relative z-10" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-kole-text-primary">
              {t('clientSearchingDriverPage.loadingMessage')}
              {isCheckingStatus && <Loader2 className="inline h-5 w-5 animate-spin ml-2 text-kole-blue-primary" />}
            </h2>
            <p className="text-kole-text-secondary mb-6 text-center">{t('clientSearchingDriverPage.pleaseWait')}</p>
            {searchTimer > 0 && <p className="text-sm text-kole-text-tertiary">{t('clientSearchingDriverPage.searchTime', { time: searchTimer })}</p>}
          </>
        ) : driverDetails ? (
          <div className="w-full max-w-md animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-kole-green-light flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-kole-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-center mb-6 text-kole-text-primary">{t('clientSearchingDriverPage.driverFoundMessage')}</h2>
            <Card className="mb-4 border-kole-border">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                    <img src={driverDetails.photo} alt={driverDetails.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-kole-text-primary">{driverDetails.name}</h3>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-kole-orange-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm ml-1 text-kole-text-secondary">{driverDetails.rating}</span>
                    </div>
                    <p className="text-sm text-kole-text-secondary">{driverDetails.vehicle} • {driverDetails.plate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-center text-kole-text-secondary">
              {t('clientSearchingDriverPage.driverArrivalTime', {name: driverDetails.name, time: driverDetails.arrivalTime})}
            </p>
            <p className="text-center text-kole-text-secondary text-sm mt-1">
              {t('clientSearchingDriverPage.autoRedirect')}
            </p>
          </div>
        ) : null}
      </div>
      
      <div className="bg-white border-t border-kole-border p-4">
        <Card className="border-kole-border">
          <CardContent className="p-4">
            <RideInfoCard
              pickupAddress={initialRideDetails.pickup.address}
              destinationAddress={initialRideDetails.destination.address}
              price={initialRideDetails.price}
              estimatedTime={initialRideDetails.estimatedTime}
            />
            {!driverFound && (
              <Button 
                variant="outline" 
                className="w-full mt-4 border-kole-destructive text-kole-destructive hover:bg-kole-destructive/10 focus-visible:ring-kole-destructive"
                onClick={handleCancelSearch}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    {t('clientSearchingDriverPage.cancellingSearch')}
                  </span>
                ) : (
                  t('clientSearchingDriverPage.cancelSearchButton')
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientSearchingDriverPage;
