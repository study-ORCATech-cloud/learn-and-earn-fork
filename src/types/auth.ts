export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github';
  role?: 'user' | 'moderator' | 'admin' | 'owner';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (provider: 'google' | 'github') => void;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
  refreshAuthState: (skipVerification?: boolean) => Promise<void>;
}

export interface TokenPayload {
  user_id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github';
  exp: number;
  iat: number;
}

export interface AuthCallbackParams {
  token?: string;
  error?: string;
  state?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}