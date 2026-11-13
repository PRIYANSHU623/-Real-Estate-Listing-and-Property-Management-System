import { apiClient } from './client';
import { AdminAnalytics, OwnerAnalytics } from '../types';

export const analyticsApi = {
  async getOwnerAnalytics(): Promise<OwnerAnalytics> {
    const res = await apiClient.get<OwnerAnalytics>('/analytics/owner');
    return res.data;
  },

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await apiClient.get<AdminAnalytics>('/analytics/admin');
    return res.data;
  },
};
