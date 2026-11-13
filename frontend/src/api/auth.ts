import { apiClient } from './client';
import { TokenResponse, User, UserRole } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<User> {
    const res = await apiClient.post<User>('/auth/register', payload);
    return res.data;
  },

  async login(payload: LoginPayload): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>('/auth/login', payload);
    return res.data;
  },

  async me(): Promise<User> {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken });
    return res.data;
  },
};
