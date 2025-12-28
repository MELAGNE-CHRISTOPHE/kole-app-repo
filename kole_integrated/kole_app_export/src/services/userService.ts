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

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

// New Interface for Favorite Places
export interface FavoritePlace {
  id: string;
  label: string; // e.g., "Maison", "Travail"
  address: string; // Formatted address
  latitude: number;
  longitude: number;
}

export interface PaymentMethod {
  id: string;
  nameKey: string;
  balance?: number;
  iconName?: string; // e.g., 'Wallet', 'Landmark', 'Smartphone' from lucide-react
}

export interface UserRideStats {
  totalRides: number;
  totalDistanceKm: number;
  totalSpentFCFA: number;
  memberSince?: string;
}

// In-memory mock user profile data
let mockUserProfile: UserProfileData = {
  id: 'user123',
  firstName: "Aisha",
  lastName: "Diallo",
  email: "aisha.kole@example.com",
  phoneNumber: "+2250701020304",
  avatarUrl: `https://ui-avatars.com/api/?name=Aisha+Diallo&background=0D8ABC&color=fff&size=128&font-size=0.4`
};

// In-memory mock favorite places
let mockFavoritePlaces: FavoritePlace[] = [
  {
    id: 'fav_1',
    label: 'Maison',
    address: 'Cocody Angré, 7ème Tranche, Abidjan',
    latitude: 5.3579,
    longitude: -3.9918
  },
  {
    id: 'fav_2',
    label: 'Travail',
    address: 'Plateau, Avenue Lamblin, Abidjan',
    latitude: 5.3271,
    longitude: -4.0211
  },
];


export const getUserProfile = async (): Promise<{ data: UserProfileData | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9 || !mockUserProfile.id) {
        resolve({
          data: JSON.parse(JSON.stringify(mockUserProfile)),
          error: null,
        });
      } else {
        resolve({
          data: null,
          error: {
            messageKey: 'userService.errors.fetchProfileFailed',
            details: 'Simulated network or server error during profile fetch.',
          },
        });
      }
    }, 700);
  });
};

// --- User Ride Stats ---
export const getUserRideStats = async (): Promise<{ data: UserRideStats | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9) { // 90% success rate
        resolve({
          data: {
            totalRides: 27,
            totalDistanceKm: 183.5,
            totalSpentFCFA: 22750,
            memberSince: "Janvier 2024"
          },
          error: null
        });
      } else { // 10% failure rate
        resolve({
          data: null,
          error: { messageKey: 'userService.errors.fetchRideStatsFailed' }
        });
      }
    }, 800);
  });
};

// --- Payment Methods Functions ---
export const getAvailablePaymentMethods = async (): Promise<{ data: PaymentMethod[] | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9) { // 90% success rate
        const methods: PaymentMethod[] = [
          { id: 'WALLET', nameKey: 'paymentMethods.wallet', balance: 12500, iconName: 'Wallet' },
          { id: 'CASH', nameKey: 'paymentMethods.cash', iconName: 'Landmark' },
          { id: 'ORANGE_MONEY_CI', nameKey: 'paymentMethods.orangeMoneyCI', iconName: 'Smartphone' }
          // Add more mocked methods if needed e.g. MTN, Moov
        ];
        resolve({ data: methods, error: null });
      } else { // 10% failure rate
        resolve({ data: null, error: { messageKey: 'userService.errors.fetchPaymentMethodsFailed', details: 'Simulated error fetching payment methods.' } });
      }
    }, 300);
  });
};

export const updateUserProfile = async (
  dataToUpdate: Partial<Omit<UserProfileData, 'id'>>
): Promise<{ data: UserProfileData | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Updating user profile (mock):", dataToUpdate);
      if (Math.random() < 0.9) {
        mockUserProfile = { ...mockUserProfile, ...dataToUpdate };
        resolve({
          data: JSON.parse(JSON.stringify(mockUserProfile)),
          error: null,
        });
      } else {
        resolve({
          data: null,
          error: {
            messageKey: 'userService.errors.updateProfileFailed',
            details: 'Simulated network or server error during profile update.',
          },
        });
      }
    }, 1000);
  });
};

export const logoutUser = async (): Promise<{ error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("User logout simulated successfully.");
      resolve({ error: null });
    }, 500);
  });
};

export const getWalletDetails = async (): Promise<{ data: { balance: number } | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9) {
        resolve({ data: { balance: Math.floor(Math.random() * 20000) + 500 }, error: null });
      } else {
        resolve({ data: null, error: { messageKey: 'userService.errors.fetchWalletDetailsFailed', details: 'Simulated error fetching wallet balance.' } });
      }
    }, 700);
  });
};

const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = Array.from({ length: 17 }, (_, i) => {
  const type = i % 3 === 0 ? 'debit' : 'credit';
  const amount = type === 'debit'
    ? (Math.floor(Math.random() * 15) + 1) * 100
    : (Math.floor(Math.random() * 30) + 5) * 100;
  return {
    id: `txn_${Date.now()}_${i}`,
    date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000 + i * 7 * 60 * 60 * 1000).toISOString(),
    description: type === 'debit' ? `Course Kôlê #${12345 - i}` : `Recharge Portefeuille #${5678 + i}`,
    amount: amount,
    type: type,
  };
});

export const getWalletTransactions = async (
  page: number = 1,
  limit: number = 6
): Promise<{ data: WalletTransaction[] | null; totalPages: number; currentPage: number; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9) {
        const totalItems = MOCK_WALLET_TRANSACTIONS.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = MOCK_WALLET_TRANSACTIONS.slice(startIndex, endIndex);
        resolve({ data: paginatedData, totalPages, currentPage: page, error: null });
      } else {
        resolve({ data: null, totalPages: 0, currentPage: page, error: { messageKey: 'userService.errors.fetchTransactionsFailed', details: 'Simulated network error fetching wallet transactions.' } });
      }
    }, 1200);
  });
};

// --- Favorite Places Functions ---

export const getFavoritePlaces = async (): Promise<{ data: FavoritePlace[] | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9) { // 90% success rate
        resolve({ data: [...mockFavoritePlaces], error: null });
      } else { // 10% failure rate
        resolve({ data: null, error: { messageKey: 'userService.errors.getFavoritesFailed', details: 'Simulated error fetching favorites.' } });
      }
    }, 500);
  });
};

export const addFavoritePlace = async (
  placeData: Omit<FavoritePlace, 'id'>
): Promise<{ data: FavoritePlace | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.9) { // 90% success rate
        const newPlace: FavoritePlace = {
          ...placeData,
          id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        };
        mockFavoritePlaces.push(newPlace);
        resolve({ data: newPlace, error: null });
      } else { // 10% failure rate
        resolve({ data: null, error: { messageKey: 'userService.errors.addFavoriteFailed', details: 'Simulated error adding favorite.' } });
      }
    }, 500);
  });
};

export const deleteFavoritePlace = async (
  placeId: string
): Promise<{ data: { success: boolean; messageKey?: string } | null; error: ServiceError | null; }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = mockFavoritePlaces.length;
      mockFavoritePlaces = mockFavoritePlaces.filter(p => p.id !== placeId);
      if (mockFavoritePlaces.length < initialLength || Math.random() < 0.9) { // 90% success (even if item didn't exist, don't error)
        resolve({ data: { success: true, messageKey: 'userService.success.favoriteDeleted' }, error: null });
      } else { // 10% failure rate
        resolve({ data: null, error: { messageKey: 'userService.errors.deleteFavoriteFailed', details: 'Simulated error deleting favorite.' } });
      }
    }, 500);
  });
};
