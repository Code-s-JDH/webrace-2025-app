import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { API_URL } from '@/app/constats';

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'courier';
};

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: User | null;
};

type AuthContextType = AuthState & {
  login: (token: string, userData?: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: User) => void;
};

const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  token: null,
  user: null
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
      const userData = await AsyncStorage.getItem('userData');
      
      setState(prev => ({
        ...prev,
        isAuthenticated: !!token,
        token,
        user: userData ? JSON.parse(userData) : null,
        isLoading: false
      }));
      
      // If we have a token but no user data, fetch the user profile
      if (token && !userData) {
        try {
          const response = await fetch(`${API_URL}profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          
          if (data.success && data.data) {
            await AsyncStorage.setItem('userData', JSON.stringify(data.data));
            setState(prev => ({
              ...prev,
              user: data.data
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  const login = async (token: string, userData?: User) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      
      if (userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        token,
        user: userData || prev.user
      }));
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Login failed');
    }
  };

  const updateUser = (userData: User) => {
    try {
      AsyncStorage.setItem('userData', JSON.stringify(userData));
      setState(prev => ({
        ...prev,
        user: userData
      }));
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem('userData');
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        token: null,
        user: null
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
    refreshToken,
    updateUser
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