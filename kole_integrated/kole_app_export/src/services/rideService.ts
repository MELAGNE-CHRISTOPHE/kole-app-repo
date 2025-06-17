// src/services/rideService.ts

export interface RideHistoryEntry {
  id: string;
  date: string;
  pickup: string;
  destination: string;
  price: string;
  driverName: string;
  statusKey: string;
  driverAvatarUrl?: string;
  vehicleInfo?: string;
}

export interface ServiceError {
  messageKey: string;
  details?: string;
}

export interface RideRequestData {
  pickup: { coordinates: { latitude: number; longitude: number }; address: string };
  destination: { coordinates: { latitude: number; longitude: number }; address: string };
  price: number;
  estimatedTime: string;
}

export interface DriverData {
  name: string;
  rating: number;
  vehicle: string;
  plate: string;
  arrivalTime: string;
  photo: string;
  phone: string;
}

export interface BookingResponse {
  bookingId: string;
  status: string;
}

export interface BookingStatusResponse {
  status: string;
  driverDetails?: DriverData;
}

export type RideStatus = 'TO_CLIENT' | 'WAITING_AT_PICKUP' | 'IN_PROGRESS_TO_DESTINATION' | 'ARRIVED_AT_DESTINATION';

export interface DriverLocationUpdate {
  latitude: number;
  longitude: number;
  eta?: string;
  rideStatus: RideStatus;
}

// New Interface for Rating Submission
export interface RatingData {
  bookingId: string; // Or any other ride identifier
  rating: number;
  comment?: string;
}


const MOCK_RIDE_HISTORY_DATA: RideHistoryEntry[] = Array.from({ length: 14 }, (_, i) => ({
  id: `ride${i + 1}`,
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000 - (i % 3) * 12 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  pickup: `Point de départ ${i + 1}, Abidjan`,
  destination: `Destination ${i + 1}, Plateau`,
  price: `${(Math.floor(Math.random() * 20) + 5) * 100} FCFA`,
  driverName: i % 3 === 0 ? `Konan Kouassi` : (i % 3 === 1 ? `Aisha Diallo` : `Yao N'Guessan`),
  statusKey: i % 5 === 4 ? 'rideStatuses.cancelled' : 'rideStatuses.completed',
  driverAvatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(i % 3 === 0 ? 'Konan Kouassi' : (i % 3 === 1 ? 'Aisha Diallo' : 'Yao NGuessan'))}&background=random&color=fff`,
  vehicleInfo: `Moto - SY ${String(1000 + i).padStart(4, '0')} CI`,
}));

export const getRideHistory = async (
  page: number = 1,
  limit: number = 5
): Promise<{ data: RideHistoryEntry[] | null; totalPages: number; currentPage: number; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9) {
        const totalItems = MOCK_RIDE_HISTORY_DATA.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = MOCK_RIDE_HISTORY_DATA.slice(startIndex, endIndex);
        resolve({ data: paginatedData, totalPages, currentPage: page, error: null });
      } else {
        resolve({ data: null, totalPages: 0, currentPage: page, error: { messageKey: 'rideService.errors.fetchHistoryFailed', details: 'Simulated network error fetching ride history.' } });
      }
    }, 1000);
  });
};

let mockBooking: {
  id: string;
  status: string;
  searchCount: number;
  driver: DriverData | null;
  currentLat?: number;
  currentLng?: number;
  etaCounter?: number;
  pickupLoc?: { lat: number; lng: number };
  destLoc?: { lat: number; lng: number };
} = {
  id: '',
  status: 'SEARCHING_FOR_DRIVER',
  searchCount: 0,
  driver: null,
};

export const requestRide = async (
  rideDetails: RideRequestData
): Promise<{ data: BookingResponse | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockBooking = {
        id: `ride_${Date.now()}`,
        status: 'SEARCHING_FOR_DRIVER',
        searchCount: 0,
        driver: null,
        currentLat: rideDetails.pickup.coordinates.latitude - 0.002,
        currentLng: rideDetails.pickup.coordinates.longitude - 0.002,
        pickupLoc: { lat: rideDetails.pickup.coordinates.latitude, lng: rideDetails.pickup.coordinates.longitude },
        destLoc: { lat: rideDetails.destination.coordinates.latitude, lng: rideDetails.destination.coordinates.longitude },
        etaCounter: 5,
      };
      console.log('Mock ride request successful:', mockBooking.id, mockBooking);
      resolve({ data: { bookingId: mockBooking.id, status: 'SEARCHING_FOR_DRIVER' }, error: null });
    }, 1000);
  });
};

const POLLING_INTERVAL_MS = 5000;

export const getBookingStatus = async (
  bookingId: string
): Promise<{ data: BookingStatusResponse | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mockBooking.id === '' || bookingId !== mockBooking.id) {
        console.warn('getBookingStatus called with unknown bookingId or before requestRide:', bookingId);
        resolve({ data: null, error: { messageKey: 'rideService.errors.bookingNotFound' } });
        return;
      }

      mockBooking.searchCount++;
      console.log(`Polling for bookingId: ${bookingId}, count: ${mockBooking.searchCount}`);

      if (mockBooking.searchCount >= 2) {
        if (!mockBooking.driver) {
            mockBooking.driver = {
                name: 'Yao Koffi', rating: 4.9, vehicle: 'Bajaj Pulsar', plate: 'MC 5678 EF',
                arrivalTime: '5 min',
                photo: `https://ui-avatars.com/api/?name=Yao+Koffi&background=FF8C00&color=fff`,
                phone: '+2250712345678'
            };
        }
        resolve({ data: { status: 'DRIVER_FOUND', driverDetails: mockBooking.driver }, error: null });
      } else {
        resolve({ data: { status: 'SEARCHING_FOR_DRIVER' }, error: null });
      }
    }, POLLING_INTERVAL_MS / 2.5); // Adjusted for slightly faster driver finding in demo
  });
};


export const getDriverLocationUpdates = (
  bookingId: string,
  onUpdate: (update: DriverLocationUpdate) => void,
  initialDriverLoc: { latitude: number; longitude: number; },
  pickupLoc: { latitude: number; longitude: number; },
  destLoc: { latitude: number; longitude: number; }
): (() => void) => {

  if (mockBooking.id !== bookingId || !mockBooking.pickupLoc || !mockBooking.destLoc) {
    console.error("getDriverLocationUpdates called with invalid bookingId or booking not properly initialized with locations.");
    // Immediately call onUpdate with an error-like status or a default initial state if desired
     onUpdate({
      latitude: initialDriverLoc.latitude, // last known or default
      longitude: initialDriverLoc.longitude,
      eta: "N/A",
      rideStatus: mockBooking.status as RideStatus // This might be problematic if status isn't a RideStatus yet
    });
    return () => {};
  }

  let currentLat = mockBooking.currentLat !== undefined ? mockBooking.currentLat : initialDriverLoc.latitude;
  let currentLng = mockBooking.currentLng !== undefined ? mockBooking.currentLng : initialDriverLoc.longitude;
  let currentStatus: RideStatus = mockBooking.status as RideStatus || 'TO_CLIENT';
  let etaCounter = mockBooking.etaCounter !== undefined ? mockBooking.etaCounter : 5;

  // If status was from getBookingStatus and was DRIVER_FOUND, start ride as TO_CLIENT for live updates
  if (currentStatus === ('DRIVER_FOUND' as any)) {
      currentStatus = 'TO_CLIENT';
  }


  const intervalId = setInterval(() => {
    let targetLat: number, targetLng: number;

    switch (currentStatus) {
      case 'TO_CLIENT':
        targetLat = pickupLoc.latitude;
        targetLng = pickupLoc.longitude;
        currentLat += (targetLat - currentLat) * 0.25; // Faster simulation
        currentLng += (targetLng - currentLng) * 0.25;
        etaCounter = Math.max(0, etaCounter - (2000 / 60000 * 5)); // Simulate 5 min ETA over ~10 updates (2s interval)

        if (Math.abs(targetLat - currentLat) < 0.0001 && Math.abs(targetLng - currentLng) < 0.0001) {
          currentStatus = 'WAITING_AT_PICKUP';
          etaCounter = 180;
        }
        break;

      case 'WAITING_AT_PICKUP':
        // This status change should be triggered by client's "confirmPresence" action in a real app.
        // Here, we simulate it being potentially updated by client action or timeout.
        // The page component will manage the waitingTimer display and extra charges.
        // The service just reports the status. If the client confirms, the page updates the status.
        // For this mock, we will assume if this service is still running in WAITING_AT_PICKUP,
        // it means the client hasn't confirmed yet. The etaCounter here can represent time *spent* waiting.
        // Or, if the service needs to auto-progress:
        // etaCounter -= 2; // decrement by interval seconds
        // if (etaCounter <= 0) { currentStatus = 'IN_PROGRESS_TO_DESTINATION'; etaCounter = 10; }
        break;

      case 'IN_PROGRESS_TO_DESTINATION':
        targetLat = destLoc.latitude;
        targetLng = destLoc.longitude;
        currentLat += (targetLat - currentLat) * 0.25;
        currentLng += (targetLng - currentLng) * 0.25;
        etaCounter = Math.max(0, etaCounter - (2000 / 60000 * 10)); // Simulate 10 min ETA

        if (Math.abs(targetLat - currentLat) < 0.0001 && Math.abs(targetLng - currentLng) < 0.0001) {
          currentStatus = 'ARRIVED_AT_DESTINATION';
          clearInterval(intervalId);
        }
        break;

      case 'ARRIVED_AT_DESTINATION':
        clearInterval(intervalId);
        break;
    }

    mockBooking.currentLat = currentLat;
    mockBooking.currentLng = currentLng;
    mockBooking.status = currentStatus;
    mockBooking.etaCounter = etaCounter;

    let etaString = "";
    if (currentStatus === 'TO_CLIENT') etaString = `~${Math.ceil(etaCounter)} min`;
    else if (currentStatus === 'WAITING_AT_PICKUP') etaString = `Attend`; // Page will use its own timer
    else if (currentStatus === 'IN_PROGRESS_TO_DESTINATION') etaString = `~${Math.ceil(etaCounter)} min`;
    else if (currentStatus === 'ARRIVED_AT_DESTINATION') etaString = "Arrivé";

    onUpdate({
      latitude: currentLat,
      longitude: currentLng,
      eta: etaString,
      rideStatus: currentStatus,
    });

  }, 2000); // Update every 2 seconds for faster demo

  return () => {
    clearInterval(intervalId);
  };
};

export const cancelRideRequest = async (
  bookingId: string
): Promise<{ data: { success: boolean; messageKey?: string } | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (bookingId === mockBooking.id) {
        mockBooking = { id: '', status: 'SEARCHING_FOR_DRIVER', searchCount: 0, driver: null, currentLat: undefined, currentLng: undefined, etaCounter: undefined, pickupLoc: undefined, destLoc: undefined };
        resolve({ data: { success: true, messageKey: 'rideService.success.rideCancelled' }, error: null });
      } else {
        resolve({ data: null, error: { messageKey: 'rideService.errors.bookingNotFound' } });
      }
    }, 500);
  });
};

// New function for submitting ride rating
export const submitRideRating = async (
  ratingData: RatingData
): Promise<{ data: { success: boolean; messageKey?: string } | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Submitting rating to backend (mock):", ratingData);
      if (Math.random() < 0.9) { // 90% success rate
        resolve({ data: { success: true, messageKey: 'rideService.success.ratingSubmitted' }, error: null });
      } else { // 10% failure rate
        resolve({ data: null, error: { messageKey: 'rideService.errors.submitRatingFailed', details: 'Simulated network error during rating submission.' } });
      }
    }, 1000); // Simulate 1 second delay
  });
};
