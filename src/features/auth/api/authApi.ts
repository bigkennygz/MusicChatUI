import { apiClient } from '@lib/api/client';
import type { AuthTokens, LoginCredentials, RegisterData, User, ApiKey } from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ data: AuthTokens }> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    formData.append('grant_type', 'password');
    
    const response = await apiClient.post<AuthTokens>('/api/v1/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    return { data: response.data };
  },

  refresh: async (refreshToken: string): Promise<{ data: AuthTokens }> => {
    const formData = new URLSearchParams();
    formData.append('refresh_token', refreshToken);
    formData.append('grant_type', 'refresh_token');
    
    const response = await apiClient.post<AuthTokens>('/api/v1/auth/refresh', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    return { data: response.data };
  },

  register: async (data: RegisterData): Promise<{ data: User }> => {
    const response = await apiClient.post<User>('/api/v1/auth/register', data);
    return { data: response.data };
  },

  getCurrentUser: async (): Promise<{ data: User }> => {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return { data: response.data };
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
  },

  createApiKey: async (name: string, scopes: string[]): Promise<{ data: ApiKey & { key: string } }> => {
    const response = await apiClient.post<ApiKey & { key: string }>('/api/v1/auth/api-keys', {
      name,
      scopes,
    });
    return { data: response.data };
  },

  listApiKeys: async (): Promise<{ data: ApiKey[] }> => {
    const response = await apiClient.get<ApiKey[]>('/api/v1/auth/api-keys');
    return { data: response.data };
  },

  revokeApiKey: async (keyId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/auth/api-keys/${keyId}`);
  },
};