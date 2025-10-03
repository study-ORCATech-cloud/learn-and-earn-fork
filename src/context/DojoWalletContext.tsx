import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { dojoCoinsService } from '../services/dojoCoinsService';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  WalletDetails,
  LabPurchase,
  UserLibrary,
  LabAccessInfo,
  PurchaseRequest,
  PurchaseResponse
} from '../types/dojoCoins';

interface DojoWalletState {
  // Wallet data
  balance: number | null;
  walletDetails: WalletDetails | null;
  userLibrary: UserLibrary | null;
  
  // Loading states
  isLoadingBalance: boolean;
  isLoadingWallet: boolean;
  isLoadingLibrary: boolean;
  isPurchasing: boolean;
  
  // Error states
  error: string | null;
  purchaseError: string | null;
  
  // Cache for lab access checks
  labAccessCache: Record<string, LabAccessInfo>;
}

type DojoWalletAction =
  | { type: 'SET_LOADING_BALANCE'; payload: boolean }
  | { type: 'SET_LOADING_WALLET'; payload: boolean }
  | { type: 'SET_LOADING_LIBRARY'; payload: boolean }
  | { type: 'SET_PURCHASING'; payload: boolean }
  | { type: 'SET_BALANCE'; payload: number }
  | { type: 'SET_WALLET_DETAILS'; payload: WalletDetails }
  | { type: 'SET_USER_LIBRARY'; payload: UserLibrary }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PURCHASE_ERROR'; payload: string | null }
  | { type: 'SET_LAB_ACCESS'; payload: { labUrl: string; accessInfo: LabAccessInfo } }
  | { type: 'UPDATE_BALANCE_AFTER_PURCHASE'; payload: { newBalance: number; purchase: LabPurchase } }
  | { type: 'RESET_STATE' };

const initialState: DojoWalletState = {
  balance: null,
  walletDetails: null,
  userLibrary: null,
  isLoadingBalance: false,
  isLoadingWallet: false,
  isLoadingLibrary: false,
  isPurchasing: false,
  error: null,
  purchaseError: null,
  labAccessCache: {},
};

function walletReducer(state: DojoWalletState, action: DojoWalletAction): DojoWalletState {
  switch (action.type) {
    case 'SET_LOADING_BALANCE':
      return { ...state, isLoadingBalance: action.payload };
    case 'SET_LOADING_WALLET':
      return { ...state, isLoadingWallet: action.payload };
    case 'SET_LOADING_LIBRARY':
      return { ...state, isLoadingLibrary: action.payload };
    case 'SET_PURCHASING':
      return { ...state, isPurchasing: action.payload };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload, error: null };
    case 'SET_WALLET_DETAILS':
      return { 
        ...state, 
        walletDetails: action.payload, 
        balance: action.payload.wallet.coin_balance,
        error: null 
      };
    case 'SET_USER_LIBRARY':
      return { ...state, userLibrary: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PURCHASE_ERROR':
      return { ...state, purchaseError: action.payload };
    case 'SET_LAB_ACCESS':
      return {
        ...state,
        labAccessCache: {
          ...state.labAccessCache,
          [action.payload.labUrl]: action.payload.accessInfo
        }
      };
    case 'UPDATE_BALANCE_AFTER_PURCHASE':
      return {
        ...state,
        balance: action.payload.newBalance,
        userLibrary: state.userLibrary ? {
          ...state.userLibrary,
          purchased_labs: [...state.userLibrary.purchased_labs, action.payload.purchase],
          total_purchases: state.userLibrary.total_purchases + 1
        } : null,
        walletDetails: state.walletDetails ? {
          ...state.walletDetails,
          wallet: {
            ...state.walletDetails.wallet,
            balance: action.payload.newBalance,
            total_spent: state.walletDetails.wallet.total_spent + action.payload.purchase.cost,
            lifetime_purchases: state.walletDetails.wallet.lifetime_purchases + 1
          }
        } : null
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

interface DojoWalletContextValue extends DojoWalletState {
  // Actions
  refreshBalance: () => Promise<void>;
  refreshWalletDetails: () => Promise<void>;
  refreshUserLibrary: () => Promise<void>;
  checkLabAccess: (labUrl: string, forceRefresh?: boolean) => Promise<LabAccessInfo>;
  purchaseLabAccess: (purchaseData: PurchaseRequest) => Promise<PurchaseResponse>;
  
  // Utility functions
  canAffordLab: (cost: number) => boolean;
  formatCoins: (amount: number) => string;
  calculateLabCost: (difficulty: 'beginner' | 'intermediate' | 'professional' | 'expert') => number;
  hasAccessToLab: (labUrl: string) => boolean;
  
  // Clear functions
  clearErrors: () => void;
}

const DojoWalletContext = createContext<DojoWalletContextValue | undefined>(undefined);

interface DojoWalletProviderProps {
  children: ReactNode;
}

export const DojoWalletProvider: React.FC<DojoWalletProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Reset state when user logs out
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [isAuthenticated, authLoading]);

  // Load initial data when user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      refreshBalance();
      refreshUserLibrary();
    }
  }, [isAuthenticated, authLoading]);

  const refreshBalance = useCallback(async () => {
    if (!isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING_BALANCE', payload: true });
    try {
      const balance = await dojoCoinsService.getWalletBalance();
      dispatch({ type: 'SET_BALANCE', payload: balance });
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch balance' });
    } finally {
      dispatch({ type: 'SET_LOADING_BALANCE', payload: false });
    }
  }, [isAuthenticated]);

  const refreshWalletDetails = useCallback(async () => {
    if (!isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING_WALLET', payload: true });
    try {
      const walletDetails = await dojoCoinsService.getWalletDetails();
      dispatch({ type: 'SET_WALLET_DETAILS', payload: walletDetails });
      
      // Check for welcome bonus and show message for new users
      const hasWelcomeBonus = walletDetails.recent_transactions.some(
        transaction => transaction.transaction_type === 'WELCOME_BONUS'
      );
      
      if (hasWelcomeBonus && walletDetails.wallet.coin_balance === 5 && walletDetails.recent_transactions.length === 1) {
        // This appears to be a new user who just received their welcome bonus
        toast({
          title: "Welcome to LabDojo! 🎉",
          description: "You've received 5 free Dojo Coins to get started. Use them to unlock premium lab content!",
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('Failed to refresh wallet details:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch wallet details' });
    } finally {
      dispatch({ type: 'SET_LOADING_WALLET', payload: false });
    }
  }, [isAuthenticated, toast]);

  const refreshUserLibrary = useCallback(async () => {
    if (!isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING_LIBRARY', payload: true });
    try {
      const userLibrary = await dojoCoinsService.getUserLibrary();
      dispatch({ type: 'SET_USER_LIBRARY', payload: userLibrary });
    } catch (error) {
      console.error('Failed to refresh user library:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch user library' });
    } finally {
      dispatch({ type: 'SET_LOADING_LIBRARY', payload: false });
    }
  }, [isAuthenticated]);

  const checkLabAccess = useCallback(async (labUrl: string, forceRefresh = false): Promise<LabAccessInfo> => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Return cached result if available and not forcing refresh
    if (!forceRefresh && state.labAccessCache[labUrl]) {
      return state.labAccessCache[labUrl];
    }

    try {
      const accessInfo = await dojoCoinsService.checkLabAccess(labUrl);
      dispatch({ type: 'SET_LAB_ACCESS', payload: { labUrl, accessInfo } });
      return accessInfo;
    } catch (error) {
      console.error('Failed to check lab access:', error);
      throw error;
    }
  }, [isAuthenticated, state.labAccessCache]);

  const purchaseLabAccess = useCallback(async (purchaseData: PurchaseRequest): Promise<PurchaseResponse> => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    dispatch({ type: 'SET_PURCHASING', payload: true });
    dispatch({ type: 'SET_PURCHASE_ERROR', payload: null });
    
    try {
      const response = await dojoCoinsService.purchaseLabAccess(purchaseData);
      
      if (response.success && response.data) {
        // Update local state with new balance and purchase
        dispatch({
          type: 'UPDATE_BALANCE_AFTER_PURCHASE',
          payload: {
            newBalance: response.data.new_balance,
            purchase: response.data.purchase
          }
        });
        
        // Update lab access cache
        dispatch({
          type: 'SET_LAB_ACCESS',
          payload: {
            labUrl: purchaseData.lab_url,
            accessInfo: {
              has_access: true,
              purchase_info: {
                id: response.data.purchase.id,
                lab_title: response.data.purchase.lab_title,
                purchased_at: response.data.purchase.purchased_at,
                last_accessed_at: response.data.purchase.last_accessed_at,
                total_access_count: response.data.purchase.total_access_count
              },
              wallet_balance: response.data.new_balance
            }
          }
        });
      } else {
        // Handle error response
        dispatch({ type: 'SET_PURCHASE_ERROR', payload: response.error || response.message || 'Purchase failed' });
      }
      
      return response;
    } catch (error) {
      console.error('Failed to purchase lab access:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to purchase lab access';
      dispatch({ type: 'SET_PURCHASE_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_PURCHASING', payload: false });
    }
  }, [isAuthenticated]);

  const canAffordLab = useCallback((cost: number): boolean => {
    return state.balance !== null && dojoCoinsService.canAfford(state.balance, cost);
  }, [state.balance]);

  const formatCoins = useCallback((amount: number): string => {
    return dojoCoinsService.formatDojoCoins(amount);
  }, []);

  const calculateLabCost = useCallback((difficulty: 'beginner' | 'intermediate' | 'professional' | 'expert'): number => {
    return dojoCoinsService.calculateLabPrice(difficulty);
  }, []);

  const hasAccessToLab = useCallback((labUrl: string): boolean => {
    const accessInfo = state.labAccessCache[labUrl];
    return accessInfo?.has_access || false;
  }, [state.labAccessCache]);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_PURCHASE_ERROR', payload: null });
  }, []);

  const contextValue: DojoWalletContextValue = {
    ...state,
    refreshBalance,
    refreshWalletDetails,
    refreshUserLibrary,
    checkLabAccess,
    purchaseLabAccess,
    canAffordLab,
    formatCoins,
    calculateLabCost,
    hasAccessToLab,
    clearErrors,
  };

  return (
    <DojoWalletContext.Provider value={contextValue}>
      {children}
    </DojoWalletContext.Provider>
  );
};

export const useDojoWallet = (): DojoWalletContextValue => {
  const context = useContext(DojoWalletContext);
  if (context === undefined) {
    throw new Error('useDojoWallet must be used within an DojoWalletProvider');
  }
  return context;
};