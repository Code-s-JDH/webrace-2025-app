import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
};

type AuthContextType = AuthState & {
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
};

const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  token: null
};

export const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_TOKEN_KEY = 'authToken';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      setState(prev => ({
        ...prev,
        isAuthenticated: !!token,
        token,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error checking auth:', error);
      setState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  const login = async (token: string) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        token
      }));
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        token: null
      }));
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Logout failed');
    }
  };

  const refreshToken = async () => {
    try {
      const newToken = await fetch('/refresh-token');
      const { token } = await newToken.json();
      await login(token);
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout();
    }
  };

  if (state.isLoading) {
    return null;
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}