// src/services/userService.ts

export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface ServiceError {
  messageKey: string; // For i18n
  details?: string;
}

// New Interface for Wallet Transactions
export interface WalletTransaction {
  id: string;
  date: string; // Should ideally be a Date object or ISO string, formatted on display
  description: string;
  amount: number; // Positive for credit, negative for debit (or use type to determine)
  type: 'credit' | 'debit';
}


/**
 * Fetches the user profile data.
 * Simulates an API call with a delay and random success/failure.
 */
export const getUserProfile = async (): Promise<{ data: UserProfileData | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9) { // 90% success rate
        resolve({
          data: {
            id: 'user123',
            firstName: "Aisha",
            lastName: "Diallo",
            email: "aisha.kole@example.com",
            phoneNumber: "+2250701020304",
            avatarUrl: `https://ui-avatars.com/api/?name=Aisha+Diallo&background=0D8ABC&color=fff&size=128&font-size=0.4`
          },
          error: null,
        });
      } else { // 10% failure rate
        resolve({
          data: null,
          error: {
            messageKey: 'userService.errors.fetchProfileFailed',
            details: 'Simulated network or server error during profile fetch.',
          },
        });
      }
    }, 1000);
  });
};

/**
 * Logs out the current user.
 * Simulates an API call with a delay.
 */
export const logoutUser = async (): Promise<{ error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("User logout simulated successfully.");
      resolve({ error: null });
    }, 500);
  });
};

/**
 * Fetches the user's wallet balance.
 */
export const getWalletDetails = async (): Promise<{ data: { balance: number } | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9) { // 90% success rate
        resolve({ data: { balance: Math.floor(Math.random() * 20000) + 500 }, error: null });
      } else { // 10% failure rate
        resolve({ data: null, error: { messageKey: 'userService.errors.fetchWalletDetailsFailed', details: 'Simulated error fetching wallet balance.' } });
      }
    }, 700); // Simulate 0.7 second delay
  });
};

const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = Array.from({ length: 17 }, (_, i) => {
  const type = i % 3 === 0 ? 'debit' : 'credit';
  const amount = type === 'debit'
    ? (Math.floor(Math.random() * 15) + 1) * 100 // Debits between 100 and 1500
    : (Math.floor(Math.random() * 30) + 5) * 100; // Credits between 500 and 3000
  return {
    id: `txn_${Date.now()}_${i}`,
    date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000 + i * 7 * 60 * 60 * 1000).toISOString(),
    description: type === 'debit' ? `Course Kôlê #${12345 - i}` : `Recharge Portefeuille #${5678 + i}`,
    amount: amount,
    type: type,
  };
});

/**
 * Fetches a paginated list of wallet transactions.
 * @param page The current page number (1-indexed).
 * @param limit The number of items per page.
 */
export const getWalletTransactions = async (
  page: number = 1,
  limit: number = 6
): Promise<{ data: WalletTransaction[] | null; totalPages: number; currentPage: number; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9) { // 90% success rate
        const totalItems = MOCK_WALLET_TRANSACTIONS.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = MOCK_WALLET_TRANSACTIONS.slice(startIndex, endIndex);

        resolve({
          data: paginatedData,
          totalPages,
          currentPage: page,
          error: null,
        });
      } else { // 10% failure rate
        resolve({
          data: null,
          totalPages: 0,
          currentPage: page,
          error: {
            messageKey: 'userService.errors.fetchTransactionsFailed',
            details: 'Simulated network error fetching wallet transactions.',
          },
        });
      }
    }, 1200); // Simulate 1.2 seconds delay
  });
};
