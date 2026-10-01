import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/auth';
import { useRouter, useSegments } from 'expo-router';

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'MECHANIC' | 'ADMIN';
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Load token on startup
  useEffect(() => {
    async function loadSession() {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        if (storedToken) {
          setToken(storedToken);
          // Verify token and fetch user details from backend
          const res = await authApi.getMe();
          if (res.user) {
            setUser(res.user);
          } else {
            // Token might be invalid
            await SecureStore.deleteItemAsync('token');
            setToken(null);
          }
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (isLoading) return;

    // which route group are we currently in?
    const inAuthGroup = segments[0] === '(auth)';

    if (!user) {
      // If not logged in and not in the auth group, send to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // If logged in, redirect away from auth screens to correct home
      if (inAuthGroup) {
        if (user.role === 'MECHANIC') {
          router.replace('/(mechanic)/jobs');
        } else {
          // Both CUSTOMER and ADMIN go to customer home for now (no admin app yet)
          router.replace('/(customer)/home');
        }
      }
    }
  }, [user, isLoading, segments]);

  const login = async (newToken: string, newUser: User) => {
    await SecureStore.setItemAsync('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
