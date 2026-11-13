import { apiClient } from './client';
import { Lease, LeaseCreateInput, LeaseStatus, LeaseUpdateInput, Page } from '../types';

export interface LeaseListParams {
  page?: number;
  page_size?: number;
  status?: LeaseStatus;
}

export const leasesApi = {
  async list(params: LeaseListParams = {}): Promise<Page<Lease>> {
    const res = await apiClient.get<Page<Lease>>('/leases', { params });
    return res.data;
  },

  async my(params: { page?: number; page_size?: number } = {}): Promise<Page<Lease>> {
    const res = await apiClient.get<Page<Lease>>('/leases/my', { params });
    return res.data;
  },

  async get(id: number): Promise<Lease> {
    const res = await apiClient.get<Lease>(`/leases/${id}`);
    return res.data;
  },

  async create(data: LeaseCreateInput): Promise<Lease> {
    const res = await apiClient.post<Lease>('/leases', data);
    return res.data;
  },

  async update(id: number, data: LeaseUpdateInput): Promise<Lease> {
    const res = await apiClient.put<Lease>(`/leases/${id}`, data);
    return res.data;
  },

  async updateStatus(id: number, status: LeaseStatus): Promise<Lease> {
    const res = await apiClient.put<Lease>(`/leases/${id}/status`, { status });
    return res.data;
  },
};
