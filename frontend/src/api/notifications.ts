import { apiClient } from './client';
import { Notification, Page } from '../types';

export const notificationsApi = {
  async list(params: { page?: number; page_size?: number; unread_only?: boolean } = {}): Promise<Page<Notification>> {
    const res = await apiClient.get<Page<Notification>>('/notifications', { params });
    return res.data;
  },

  async unreadCount(): Promise<{ unread: number }> {
    const res = await apiClient.get<{ unread: number }>('/notifications/unread-count');
    return res.data;
  },

  async markRead(id: number): Promise<Notification> {
    const res = await apiClient.put<Notification>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead(): Promise<{ success: boolean; data: { marked_read: number } }> {
    const res = await apiClient.put<{ success: boolean; data: { marked_read: number } }>('/notifications/read-all');
    return res.data;
  },
};
