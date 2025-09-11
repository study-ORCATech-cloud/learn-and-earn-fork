import { jwtDecode } from 'jwt-decode';
import { User, TokenPayload, LoginResponse } from '../types/auth';

const BACKEND_AUTH_URL = import.meta.env.VITE_BACKEND_AUTH_URL || 'http://localhost:5000/auth';
const TOKEN_STORAGE_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'labdojo_auth_token';

class AuthService {
  private baseUrl: string;
  private tokenKey: string;

  constructor() {
    this.baseUrl = BACKEND_AUTH_URL;
    this.tokenKey = TOKEN_STORAGE_KEY;
  }

  // Token Management
  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to retrieve auth token:', error);
      return null;
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to remove auth token:', error);
    }
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Invalid token format:', error);
      return false;
    }
  }

  // Check if user is authenticated by verifying with backend
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    }
  }

  decodeToken(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // Authentication Actions
  initiateGoogleLogin(): void {
    const state = this.generateStateToken();
    sessionStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
      state,
      redirect_uri: window.location.origin + '/auth/callback',
      redirect_url: window.location.pathname + window.location.search
    });
    
    window.location.href = `${this.baseUrl}/google?${params.toString()}`;
  }

  initiateGitHubLogin(): void {
    const state = this.generateStateToken();
    sessionStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
      state,
      redirect_uri: window.location.origin + '/auth/callback',
      redirect_url: window.location.pathname + window.location.search
    });
    
    window.location.href = `${this.baseUrl}/github?${params.toString()}`;
  }

  async handleAuthCallback(token: string, state?: string): Promise<User> {
    // Validate state token for CSRF protection
    if (state) {
      const storedState = sessionStorage.getItem('oauth_state');
      if (storedState !== state) {
        throw new Error('Invalid state parameter - potential CSRF attack');
      }
      sessionStorage.removeItem('oauth_state');
    }

    // Validate and store token
    if (!token) {
      throw new Error('No authentication token received');
    }

    const decoded = jwtDecode<TokenPayload>(token);
    this.setToken(token);

    // Return user data from token
    return {
      id: decoded.user_id,
      email: decoded.email,
      name: decoded.name,
      avatar: decoded.avatar,
      provider: decoded.provider,
      createdAt: new Date(decoded.iat * 1000).toISOString()
    };
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Backend logout failed:', error);
      // Continue with local cleanup even if backend fails
    }

    // Clear any OAuth state
    sessionStorage.removeItem('oauth_state');
    
    // Clear legacy localStorage token if it exists (cleanup)
    this.removeToken();
  }

  // User Management - Updated for cookie-based auth
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          return null;
        }
        throw new Error(`Failed to get user: ${response.statusText}`);
      }

      const data: LoginResponse = await response.json();
      return data.user || null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Utility Methods
  private generateStateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  isAuthEnabled(): boolean {
    return import.meta.env.VITE_AUTH_ENABLED === 'true';
  }

  // Auto-refresh token before expiry
  setupTokenRefresh(): void {
    const checkTokenExpiry = () => {
      const token = this.getToken();
      if (!token) return;

      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = decoded.exp - currentTime;

        // Refresh token when it has 5 minutes left
        if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
          this.refreshToken().catch(error => {
            console.error('Auto token refresh failed:', error);
          });
        }
      } catch (error) {
        console.error('Token expiry check failed:', error);
      }
    };

    // Check every minute
    setInterval(checkTokenExpiry, 60000);
    
    // Check immediately
    checkTokenExpiry();
  }
}

export const authService = new AuthService();