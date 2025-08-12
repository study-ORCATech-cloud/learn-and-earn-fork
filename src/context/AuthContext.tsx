import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, AuthState, User } from '../types/auth';
import { authService } from '../services/authService';
import { errorLoggingService } from '../services/errorLoggingService';

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Initialize authentication state
  useEffect(() => {
    // Skip initialization if we're on the callback page - let the callback handle auth
    if (window.location.pathname === '/auth/callback') {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check if authentication is enabled
        if (!authService.isAuthEnabled()) {
          setAuthState(prev => ({ 
            ...prev, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          }));
          return;
        }

        // Check authentication status via cookie-based API call
        const isAuthenticated = await authService.isAuthenticated();
        
        if (isAuthenticated) {
          const user = await authService.getCurrentUser();

          if (user) {
            setAuthState({
              user,
              token: 'cookie-based', // We don't have direct access to the cookie token
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Setup automatic token refresh
            authService.setupTokenRefresh();
            return;
          }
        }

        // No valid authentication found
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
          token: null,
        }));

      } catch (error) {
        console.error('Auth initialization failed:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
          token: null,
          error: error instanceof Error ? error.message : 'Authentication initialization failed',
        }));
      }
    };

    initializeAuth();
  }, []);

  // Update error logging service with current user data
  useEffect(() => {
    if (authState.user) {
      errorLoggingService.setCurrentUser({
        id: authState.user.id,
        email: authState.user.email,
        role: authState.user.role,
      });
    } else {
      errorLoggingService.setCurrentUser({});
    }
  }, [authState.user]);

  // Handle authentication callback (for cookie-based OAuth redirects)
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');

      if (error) {
        setAuthState(prev => ({
          ...prev,
          error: decodeURIComponent(error),
          isLoading: false,
        }));
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // For cookie-based auth, we don't need to handle tokens from URL
      // The authentication state will be checked via the API on page load
      // Clean up URL if it has old token parameters (legacy cleanup)
      if (urlParams.has('token')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // Only handle callback if we have error params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
      handleAuthCallback();
    }
  }, []);

  const login = (provider: 'google' | 'github') => {
    try {
      setAuthState(prev => ({ ...prev, error: null, isLoading: true }));
      
      if (provider === 'google') {
        authService.initiateGoogleLogin();
      } else if (provider === 'github') {
        authService.initiateGitHubLogin();
      }
    } catch (error) {
      console.error('Login initiation failed:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed to start',
        isLoading: false,
      }));
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await authService.logout();
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Logout failed:', error);
      
      // Even if backend logout fails, clear local state
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const refreshToken = async () => {
    try {
      const refreshSuccess = await authService.refreshToken();
      
      if (refreshSuccess) {
        const user = await authService.getCurrentUser();
        
        if (user) {
          setAuthState(prev => ({
            ...prev,
            token: 'cookie-based',
            user,
            isAuthenticated: true,
            error: null,
          }));
        }
      } else {
        // Refresh failed, logout user
        await logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  // Method to refresh auth state (useful for callback page)
  const refreshAuthState = async (skipVerification = false) => {
    try {
      // If skipVerification is true, we assume auth is already verified
      // This avoids duplicate /verify calls from callback page
      let isAuthenticated = skipVerification;
      
      if (!skipVerification) {
        isAuthenticated = await authService.isAuthenticated();
      }
      
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        
        if (user) {
          setAuthState(prev => ({
            ...prev,
            user,
            token: 'cookie-based',
            isAuthenticated: true,
            error: null,
          }));
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          user: null,
          token: null,
          isAuthenticated: false,
        }));
      }
    } catch (error) {
      console.error('Auth state refresh failed:', error);
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    clearError,
    refreshToken,
    refreshAuthState,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;