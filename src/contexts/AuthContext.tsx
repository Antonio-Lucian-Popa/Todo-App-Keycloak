import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, User, AuthTokens, LoginCredentials, RegisterData } from '@/types/auth';
import { keycloakService } from '@/services/keycloak';

interface AuthContextType extends AuthState {
  loginWithGoogle: () => void;
  loginWithCredentials: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    tokens: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for authorization code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        // Exchange code for tokens
        const tokens = await keycloakService.exchangeCodeForToken(code);
        console.log('Tokens received:', tokens);
        const user = await keycloakService.getUserInfo(tokens.access_token);
        
        setState({
          isAuthenticated: true,
          user,
          tokens,
          loading: false,
          error: null,
        });

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Check if already authenticated
      if (keycloakService.isAuthenticated()) {
        const accessToken = keycloakService.getAccessToken();
        console.log('Access token found:', accessToken);
        if (accessToken) {
          const user = await keycloakService.getUserInfo(accessToken);
          setState({
            isAuthenticated: true,
            user,
            tokens: null, // We don't store full tokens in state
            loading: false,
            error: null,
          });
          return;
        }
      }

      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState({
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  };

  const loginWithGoogle = () => {
    keycloakService.loginWithGoogle();
  };

  const loginWithCredentials = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const tokens = await keycloakService.loginWithCredentials(credentials);
      const user = await keycloakService.getUserInfo(tokens.access_token);
      
      setState({
        isAuthenticated: true,
        user,
        tokens,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await keycloakService.registerUser(userData);
      
      // After successful registration, automatically log in
      await loginWithCredentials({
        username: userData.username,
        password: userData.password,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await keycloakService.logout();
      setState({
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  };

  const refreshToken = async () => {
    try {
      const tokens = await keycloakService.refreshToken();
      const user = await keycloakService.getUserInfo(tokens.access_token);
      
      setState(prev => ({
        ...prev,
        user,
        tokens,
        error: null,
      }));
    } catch (error) {
      setState({
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      });
    }
  };

  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user }));
  };

  const value: AuthContextType = {
    ...state,
    loginWithGoogle,
    loginWithCredentials,
    register,
    logout,
    refreshToken,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};