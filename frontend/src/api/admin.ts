import { apiClient } from './client';
import { Page, User, UserRole } from '../types';

export interface AdminUserUpdateInput {
  role?: UserRole;
  is_active?: boolean;
}

export const adminApi = {
  async listUsers(params: { page?: number; page_size?: number; role?: UserRole } = {}): Promise<Page<User>> {
    const res = await apiClient.get<Page<User>>('/admin/users', { params });
    return res.data;
  },

  async getUser(id: number): Promise<User> {
    const res = await apiClient.get<User>(`/admin/users/${id}`);
    return res.data;
  },

  async updateUser(id: number, data: AdminUserUpdateInput): Promise<User> {
    const res = await apiClient.put<User>(`/admin/users/${id}`, data);
    return res.data;
  },

  async deactivateUser(id: number): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },
};
