// src/services/emergencyService.ts

// Assuming ServiceError is defined globally or in a common types file.
// If not, it should be defined here:
export interface ServiceError {
  messageKey: string; // For i18n
  details?: string;
}

export interface SOSRequestData {
  bookingId: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface SOSResponse {
  success: boolean;
  messageKey?: string; // Optional: could be used for specific success messages
}

/**
 * Triggers an SOS alert for a given booking and location.
 * This is a mock implementation.
 */
export const triggerSOS = async (
  bookingId: string,
  location: { latitude: number; longitude: number; }
): Promise<{ data: SOSResponse | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    console.log("SOS Triggered (mock) for booking:", bookingId, "at location:", location);

    setTimeout(() => {
      if (Math.random() < 0.95) { // 95% success rate
        resolve({
          data: {
            success: true,
            messageKey: 'emergencyService.success.sosActivated',
          },
          error: null,
        });
      } else { // 5% failure rate
        resolve({
          data: null,
          error: {
            messageKey: 'emergencyService.errors.sosFailed',
            details: 'Simulated network or server error during SOS activation.',
          },
        });
      }
    }, 1000); // Simulate 1 second delay
  });
};
