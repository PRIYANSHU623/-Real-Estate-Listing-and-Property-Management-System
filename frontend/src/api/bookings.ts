import { apiClient } from './client';
import { Booking, BookingCreateInput, BookingStatus, Page } from '../types';

export interface BookingListParams {
  page?: number;
  page_size?: number;
  status?: BookingStatus;
}

export const bookingsApi = {
  async list(params: BookingListParams = {}): Promise<Page<Booking>> {
    const res = await apiClient.get<Page<Booking>>('/bookings', { params });
    return res.data;
  },

  async get(id: number): Promise<Booking> {
    const res = await apiClient.get<Booking>(`/bookings/${id}`);
    return res.data;
  },

  async create(data: BookingCreateInput): Promise<Booking> {
    const res = await apiClient.post<Booking>('/bookings', data);
    return res.data;
  },

  async updateStatus(id: number, status: BookingStatus): Promise<Booking> {
    const res = await apiClient.put<Booking>(`/bookings/${id}/status`, { status });
    return res.data;
  },
};
