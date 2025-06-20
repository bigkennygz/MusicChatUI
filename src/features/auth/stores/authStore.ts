import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials } from '@/types/auth';
import type { RateLimitInfo } from '@/types/api';
import { authApi } from '../api/authApi';
import { ApiErrorHandler } from '@lib/api/errorHandler';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rateLimitInfo: RateLimitInfo | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setRateLimitInfo: (info: RateLimitInfo) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      rateLimitInfo: null,
      
      login: async (credentials) => {
        try {
          const response = await authApi.login(credentials);
          const { access_token, refresh_token } = response.data;
          
          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          });
          
          await get().checkAuth();
        } catch (error) {
          throw ApiErrorHandler.handle(error);
        }
      },
      
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          rateLimitInfo: null,
        });
      },
      
      refreshTokens: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        try {
          const response = await authApi.refresh(refreshToken);
          const { access_token, refresh_token: newRefreshToken } = response.data;
          
          set({
            accessToken: access_token,
            refreshToken: newRefreshToken,
          });
        } catch (error) {
          // If refresh fails, logout the user
          get().logout();
          throw ApiErrorHandler.handle(error);
        }
      },
      
      checkAuth: async () => {
        const token = get().accessToken;
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }
        
        set({ isLoading: true });
        try {
          const response = await authApi.getCurrentUser();
          set({ 
            user: response.data, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          // Don't logout on check failure, just mark as not authenticated
          set({ 
            isAuthenticated: false,
            isLoading: false 
          });
          
          // Only throw if it's not an auth error
          if (!ApiErrorHandler.isAuthError(error)) {
            throw ApiErrorHandler.handle(error);
          }
        }
      },
      
      setRateLimitInfo: (info) => {
        set({ rateLimitInfo: info });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// Export for API client interceptors
export const authStore = useAuthStore;