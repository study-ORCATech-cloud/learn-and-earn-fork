
import { BackendResponse, ApiError } from '../types/backend';
import { LabContentResponse } from '../types/lab';
import { authService } from './authService';

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_PATH || 'http://localhost:5000';

// Log the base URL in development for debugging
if (import.meta.env.DEV) {
  console.log('API Base URL:', BASE_URL);
}

class ApiService {
  private async fetchWithRetry(url: string, options?: RequestInit, retries = 3): Promise<Response> {
    // Add authentication headers if user is logged in
    const enhancedOptions = this.enhanceRequestWithAuth(options);
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, enhancedOptions);
        
        // Handle authentication errors
        if (response.status === 401) {
          await this.handleAuthError();
          throw new Error('Authentication failed');
        }
        
        if (response.ok) {
          return response;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async getAllData(): Promise<BackendResponse> {
    try {
      const response = await this.fetchWithRetry(`${BASE_URL}/api/v1/data`);
      const responseData = await response.json();
      const data = responseData.data;
      
      return {
        learningPaths: data.learningPaths || [],
        courses: data.courses || [],
        projects: data.projects || [],
        roadmapItems: data.roadmapItems || [],
        roadmapProjects: data.roadmapProjects || [],
        metadata: data.metadata || {
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }
      };
    } catch (error) {
      console.error('Failed to fetch backend data:', error);
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Failed to fetch data',
        timestamp: new Date().toISOString()
      };
      throw new Error(apiError.message);
    }
  }

  async getLabContent(labUrl: string, options?: { type?: string }): Promise<LabContentResponse> {
    try {
      // Construct URL with query parameters
      const url = new URL(`${BASE_URL}/api/v1/lab/content`);
      if (options?.type) {
        url.searchParams.append('type', options.type);
      }

      // Make the request without retry for 403 errors
      const response = await fetch(
        url.toString(),
        this.enhanceRequestWithAuth({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Lab-Url': labUrl
          }
        })
      );

      // Handle 403 Forbidden specifically
      if (response.status === 403) {
        return {
          success: false,
          data: undefined,
          error: 'LAB_UNDER_CONSTRUCTION',
          statusCode: 403
        };
      }

      // Handle authentication errors
      if (response.status === 401) {
        await this.handleAuthError();
        throw new Error('Authentication failed');
      }

      // For other errors, use the retry mechanism
      if (!response.ok) {
        const response = await this.fetchWithRetry(
          url.toString(),
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Lab-Url': labUrl
            }
          }
        );
        const data = await response.json();
        
        return {
          success: true,
          data: data.data || data,
          error: undefined
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data || data,
        error: undefined
      };
    } catch (error) {
      console.error('Failed to fetch lab content:', error);
      return {
        success: false,
        data: {
          repository: {
            owner: '',
            name: '',
            branch: '',
            is_public: false
          },
          content: {
            files: [],
            tree: [],
            premium_files: [],
            free_files: []
          },
          access: {
            has_premium_access: false,
            wallet_balance: 0,
            premium_cost: 5,
            can_afford_premium: false,
            purchase_info: null
          },
          lab_config: {
            title: '',
            difficulty: 'beginner',
            category: '',
            tags: [],
            pricing: {
              base_price: 5,
              difficulty_multiplier: 1.0,
              final_price: 5
            }
          }
        },
        error: error instanceof Error ? error.message : 'Failed to fetch lab content'
      };
    }
  }


  async refreshData(): Promise<BackendResponse> {
    return this.getAllData();
  }

  // Authentication helpers - Updated for cookie-based auth
  private enhanceRequestWithAuth(options?: RequestInit): RequestInit {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    return {
      ...options,
      // Include cookies if auth is enabled - let backend decide if user is authenticated
      credentials: authService.isAuthEnabled() ? 'include' : undefined,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    };
  }

  private async handleAuthError(): Promise<void> {
    try {
      // Try to refresh the token
      const newToken = await authService.refreshToken();
      
      if (!newToken) {
        // Refresh failed, logout user
        await authService.logout();
        
        // Optionally redirect to login or show notification
        // This could be handled by the auth context
        console.warn('Session expired. Please login again.');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await authService.logout();
    }
  }

  // Optional: Methods for user-specific data
  async getUserProgress(): Promise<any> {
    if (!authService.isTokenValid()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await this.fetchWithRetry(`${BASE_URL}/api/v1/user/progress`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      throw error;
    }
  }

  async saveUserProgress(progressData: any): Promise<void> {
    if (!authService.isTokenValid()) {
      throw new Error('Authentication required');
    }

    try {
      await this.fetchWithRetry(`${BASE_URL}/api/v1/user/progress`, {
        method: 'POST',
        body: JSON.stringify(progressData),
      });
    } catch (error) {
      console.error('Failed to save user progress:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
