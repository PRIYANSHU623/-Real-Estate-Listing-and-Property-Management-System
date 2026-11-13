import { apiClient } from './client';
import { Page, User } from '../types';

export const tenantsApi = {
  async list(params: { page?: number; page_size?: number; owner_id?: number } = {}): Promise<Page<User>> {
    const res = await apiClient.get<Page<User>>('/tenants', { params });
    return res.data;
  },

  async get(id: number): Promise<User> {
    const res = await apiClient.get<User>(`/tenants/${id}`);
    return res.data;
  },
};
