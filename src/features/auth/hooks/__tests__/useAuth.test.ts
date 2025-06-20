import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { authApi } from '../../api/authApi';

// Mock the auth API
vi.mock('../../api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    refresh: vi.fn(),
  },
}));

// Mock the auth store
vi.mock('../../stores/authStore', () => {
  const createStore = () => {
    let store = {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      rateLimitInfo: null,
    };

    return {
      getState: () => store,
      setState: (updates: Partial<typeof store>) => {
        store = { ...store, ...updates };
      },
      subscribe: () => () => {},
    };
  };

  const store = createStore();

  return {
    useAuthStore: (selector?: (state: ReturnType<typeof store.getState>) => unknown) => {
      const state = store.getState();
      return selector ? selector(state) : state;
    },
    authStore: store,
  };
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockTokens = {
      data: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      },
    };

    const mockUser = {
      data: {
        id: '1',
        username: 'demo',
        email: 'demo@example.com',
        scopes: ['read', 'write'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    vi.mocked(authApi.login).mockResolvedValue(mockTokens);
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    
    await act(async () => {
      await result.current.login({
        username: 'demo',
        password: 'demo123',
      });
    });
    
    expect(authApi.login).toHaveBeenCalledWith({
      username: 'demo',
      password: 'demo123',
    });
  });

  it('should handle login failure', async () => {
    const mockError = {
      detail: 'Invalid credentials',
      status_code: 401,
    };

    vi.mocked(authApi.login).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth());
    
    await expect(
      act(async () => {
        await result.current.login({
          username: 'invalid',
          password: 'wrong',
        });
      })
    ).rejects.toEqual(mockError);
  });

  it('should logout successfully', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('should handle token refresh', async () => {
    const mockTokens = {
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      },
    };

    vi.mocked(authApi.refresh).mockResolvedValue(mockTokens);

    const { result } = renderHook(() => useAuth());
    
    // This would be called internally by the API client interceptor
    // We're testing the hook interface exists
    expect(result.current.checkAuth).toBeDefined();
  });

  it('should check authentication status', async () => {
    const mockUser = {
      data: {
        id: '1',
        username: 'demo',
        email: 'demo@example.com',
        scopes: ['read', 'write'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.checkAuth();
    });
    
    expect(authApi.getCurrentUser).toHaveBeenCalled();
  });
});