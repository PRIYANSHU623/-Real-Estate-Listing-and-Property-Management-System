import { apiClient } from './client';
import { Page, Vendor, VendorCreateInput, VendorUpdateInput } from '../types';

export interface VendorListParams {
  page?: number;
  page_size?: number;
  service_type?: string;
}

export const vendorsApi = {
  async list(params: VendorListParams = {}): Promise<Page<Vendor>> {
    const res = await apiClient.get<Page<Vendor>>('/vendors', { params });
    return res.data;
  },

  async get(id: number): Promise<Vendor> {
    const res = await apiClient.get<Vendor>(`/vendors/${id}`);
    return res.data;
  },

  async create(data: VendorCreateInput): Promise<Vendor> {
    const res = await apiClient.post<Vendor>('/vendors', data);
    return res.data;
  },

  async update(id: number, data: VendorUpdateInput): Promise<Vendor> {
    const res = await apiClient.put<Vendor>(`/vendors/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/vendors/${id}`);
  },
};
