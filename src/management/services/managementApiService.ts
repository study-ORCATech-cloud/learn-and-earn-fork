// Core management API service

import { authService } from '../../services/authService';
import type { ApiResponse } from '../types/management';

class ManagementApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    this.timeout = parseInt(import.meta.env.VITE_MANAGEMENT_API_TIMEOUT || '30000');
  }

  /**
   * Get authorization headers with JWT token
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication token if available
    if (authService.isAuthEnabled()) {
      // For cookie-based auth, we don't need to manually add headers
      // The browser will automatically include cookies
      headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    return headers;
  }

  /**
   * Make an authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        credentials: 'include', // Include cookies for authentication
        signal: AbortSignal.timeout(this.timeout),
      });

      // Handle authentication errors
      if (response.status === 401) {
        throw new Error('authentication_failed');
      }

      if (response.status === 403) {
        throw new Error('permission_denied');
      }

      if (response.status === 404) {
        throw new Error('resource_not_found');
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'request_failed',
          message: data.message || `Request failed with status ${response.status}`,
          field: data.field,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          return {
            success: false,
            error: 'request_timeout',
            message: 'Request timed out. Please try again.',
          };
        }

        if (error.message === 'authentication_failed') {
          return {
            success: false,
            error: 'authentication_failed',
            message: 'Authentication failed. Please log in again.',
          };
        }

        if (error.message === 'permission_denied') {
          return {
            success: false,
            error: 'permission_denied',
            message: 'You do not have permission to perform this action.',
          };
        }

        if (error.message === 'resource_not_found') {
          return {
            success: false,
            error: 'resource_not_found',
            message: 'The requested resource was not found.',
          };
        }
      }

      return {
        success: false,
        error: 'network_error',
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.makeRequest<T>(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Check if management is enabled
   */
  isManagementEnabled(): boolean {
    return import.meta.env.VITE_MANAGEMENT_ENABLED === 'true';
  }

  /**
   * Get management base path
   */
  getManagementBasePath(): string {
    return import.meta.env.VITE_MANAGEMENT_BASE_PATH || '/management';
  }
}

export const managementApiService = new ManagementApiService();