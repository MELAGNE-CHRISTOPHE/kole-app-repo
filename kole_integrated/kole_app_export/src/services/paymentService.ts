// src/services/paymentService.ts

// Assuming ServiceError is defined globally or in a shared types file.
// If not, define it here for clarity, though it should ideally be shared.
export interface ServiceError {
  messageKey: string;
  details?: string;
}

export interface TopUpRequestData {
  amount: number;
  operator: string; // e.g., 'ORANGE_MONEY', 'MTN_MONEY', 'MOOV_MONEY'
  phoneNumber?: string; // Optional: if a specific phone number is needed for the transaction, not just the account's default
}

export interface TopUpResponse {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string; // For payment gateways that require redirection
  messageKey?: string;  // For success/info messages
}

/**
 * Initiates a Mobile Money top-up.
 * Simulates an API call with a delay and random success/failure.
 * @param data The top-up request data.
 */
export const initiateMobileMoneyTopUp = async (
  data: TopUpRequestData
): Promise<{ data: TopUpResponse | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Initiating Mobile Money Top-Up (mock):", data);

      if (Math.random() < 0.9) { // 90% success rate
        resolve({
          data: {
            success: true,
            transactionId: `kole_mm_tx_${Date.now()}`,
            messageKey: 'paymentService.success.topUpInitiated',
            // redirectUrl: 'https://example.com/payment/proceed' // Example if redirection was needed
          },
          error: null,
        });
      } else { // 10% failure rate
        // Simulate a more specific operator failure sometimes
        if (data.operator === 'OPERATOR_XYZ_DOWN' && Math.random() < 0.5) { // Example specific failure
             resolve({ data: null, error: { messageKey: 'paymentService.errors.operatorTemporarilyUnavailable', details: `Service ${data.operator} down.` } });
        } else {
            resolve({
              data: null,
              error: {
                messageKey: 'paymentService.errors.topUpFailedGeneric',
                details: 'Simulated operator or network failure during top-up initiation.',
              },
            });
        }
      }
    }, 1500); // Simulate 1.5 seconds delay
  });
};
