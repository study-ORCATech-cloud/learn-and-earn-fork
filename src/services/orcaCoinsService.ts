import { authService } from './authService';
import {
  WalletDetails,
  BalanceResponse,
  PurchaseRequest,
  PurchaseResponse,
  LabAccessRequest,
  LabAccessInfo,
  UserLibrary,
  GrantCoinsRequest,
  GrantCoinsResponse,
  OrcaApiResponse,
  AdminTransactionsRequest,
  AdminTransactionsResponse,
  AdminAnalyticsResponse
} from '../types/orcaCoins';

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_PATH || 'http://localhost:5000';

class OrcaCoinsService {
  private async fetchWithAuth(
    endpoint: string, 
    options?: RequestInit
  ): Promise<Response> {
    const url = `${BASE_URL}/api/orca${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    const enhancedOptions: RequestInit = {
      ...options,
      credentials: 'include', // Include cookies for authentication
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    };

    const response = await fetch(url, enhancedOptions);
    
    // Handle authentication errors
    if (response.status === 401) {
      await this.handleAuthError();
      throw new Error('Authentication failed');
    }
    
    // Handle rate limiting
    if (response.status === 429) {
      const errorData = await response.json();
      const retryAfter = errorData.retry_after || 60;
      throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
    }
    
    return response;
  }

  private async handleAuthError(): Promise<void> {
    try {
      const newToken = await authService.refreshToken();
      
      if (!newToken) {
        await authService.logout();
        console.warn('Session expired. Please login again.');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await authService.logout();
    }
  }

  /**
   * Get comprehensive wallet information for the authenticated user
   */
  async getWalletDetails(): Promise<WalletDetails> {
    try {
      const response = await this.fetchWithAuth('/wallet');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: OrcaApiResponse<WalletDetails> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch wallet details');
      }
      
      return result.data;
    } catch (error) {
      console.error('Failed to fetch wallet details:', error);
      throw error;
    }
  }

  /**
   * Get current Orca Coins balance for the authenticated user
   */
  async getWalletBalance(): Promise<number> {
    try {
      const response = await this.fetchWithAuth('/wallet/balance');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: BalanceResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to fetch wallet balance');
      }
      
      return result.balance;
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      throw error;
    }
  }

  /**
   * Purchase premium access to a lab using Orca Coins
   */
  async purchaseLabAccess(purchaseData: PurchaseRequest): Promise<PurchaseResponse> {
    try {
      const response = await this.fetchWithAuth('/purchase/lab', {
        method: 'POST',
        body: JSON.stringify(purchaseData),
      });
      
      const result: PurchaseResponse = await response.json();
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400) {
          return result; // Return the error response with details
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to purchase lab access:', error);
      throw error;
    }
  }

  /**
   * Check if user has premium access to a specific lab
   */
  async checkLabAccess(labUrl: string): Promise<LabAccessInfo> {
    try {
      const response = await this.fetchWithAuth('/lab/access', {
        method: 'POST',
        body: JSON.stringify({ lab_url: labUrl }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: OrcaApiResponse<LabAccessInfo> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to check lab access');
      }
      
      return result.data;
    } catch (error) {
      console.error('Failed to check lab access:', error);
      throw error;
    }
  }

  /**
   * Get all labs the user has purchased
   */
  async getUserLibrary(): Promise<UserLibrary> {
    try {
      const response = await this.fetchWithAuth('/library');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: OrcaApiResponse<UserLibrary> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch user library');
      }
      
      return result.data;
    } catch (error) {
      console.error('Failed to fetch user library:', error);
      throw error;
    }
  }

  /**
   * Admin function to grant Orca Coins to a user
   */
  async grantCoins(grantData: GrantCoinsRequest): Promise<GrantCoinsResponse> {
    try {
      const response = await this.fetchWithAuth('/admin/grant', {
        method: 'POST',
        body: JSON.stringify(grantData),
      });
      
      const result: GrantCoinsResponse = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          return result; // Return the forbidden error
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to grant coins:', error);
      throw error;
    }
  }

  /**
   * Admin function to view all Orca transactions with filtering
   */
  async getAdminTransactions(params: AdminTransactionsRequest): Promise<AdminTransactionsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const response = await this.fetchWithAuth(`/admin/transactions?${queryParams.toString()}`);
      
      const result: AdminTransactionsResponse = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          return result; // Return the forbidden error
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to fetch admin transactions:', error);
      throw error;
    }
  }

  /**
   * Admin function to get Orca Coins analytics overview
   */
  async getAdminAnalytics(): Promise<AdminAnalyticsResponse> {
    try {
      const response = await this.fetchWithAuth('/admin/analytics');
      
      const result: AdminAnalyticsResponse = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          return result; // Return the forbidden error
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to fetch admin analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate lab price based on difficulty
   */
  calculateLabPrice(difficulty: 'beginner' | 'intermediate' | 'professional' | 'expert'): number {
    const basePrice = 5;
    const multipliers = {
      beginner: 1.0,
      intermediate: 2.0,
      professional: 3.0,
      expert: 4.0
    };
    
    return basePrice * multipliers[difficulty];
  }

  /**
   * Format currency display for Orca Coins
   */
  formatOrcaCoins(amount: number): string {
    return `${amount} 🪙`;
  }

  /**
   * Check if user can afford a lab purchase
   */
  canAfford(userBalance: number, labCost: number): boolean {
    return userBalance >= labCost;
  }
}

export const orcaCoinsService = new OrcaCoinsService();