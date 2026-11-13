import { apiClient } from './client';
import { User } from '../types';

export interface UserProfileUpdateInput {
  name?: string;
  phone?: string | null;
  password?: string;
}

export const usersApi = {
  async updateProfile(data: UserProfileUpdateInput): Promise<User> {
    const res = await apiClient.put<User>('/users/me', data);
    return res.data;
  },

  async deactivateAccount(): Promise<void> {
    await apiClient.delete('/users/me');
  },
};
