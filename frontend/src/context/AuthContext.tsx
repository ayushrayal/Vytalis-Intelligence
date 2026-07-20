import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '../services/api.client';

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  isOnboarded: boolean;
  lastLoginAt?: string;
  lastActiveAt?: string;
  subscription: {
    plan: 'starter' | 'growth' | 'agency';
    status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
    trialStartsAt: string;
    trialEndsAt: string;
    currentPeriodEnd?: string;
  };
  connectedAccounts: {
    metaConnected: boolean;
    shopifyConnected: boolean;
  };
  meta?: {
    connected: boolean;
    userId?: string;
    lastSyncedAt?: string;
    adAccounts?: Array<{
      id: string;
      name: string;
      currency: string;
      accountStatus: number;
    }>;
  };
  shopify?: {
    connected: boolean;
    shopDomain?: string;
    shopName?: string;
    lastSyncedAt?: string;
  };
  preferences: {
    theme: 'dark' | 'light';
    timezone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  completeOnboarding: (plan: 'starter' | 'growth' | 'agency') => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { user: User } }>('/users/me');
      if (response.data?.data?.user) {
        console.log('[AuthContext] Hydrated User:', response.data.data.user);
        console.log('[AuthContext] isOnboarded:', response.data.data.user.isOnboarded);
        setUser(response.data.data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const success = await fetchUser();
    if (!success) {
      try {
        await apiClient.post('/auth/refresh');
        await fetchUser();
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, [fetchUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(() => {
    window.location.href = '/api/v1/auth/google';
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout request errors
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      await apiClient.post('/auth/refresh');
      await fetchUser();
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, [fetchUser]);

  const completeOnboarding = useCallback(async (plan: 'starter' | 'growth' | 'agency') => {
    const response = await apiClient.post<{ success: boolean; data: { user: User } }>('/users/onboarding', { plan });
    if (response.data?.data?.user) {
      setUser(response.data.data.user);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshSession,
        completeOnboarding,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
