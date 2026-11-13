import { apiClient } from './client';
import { Page, Property, PropertyCreateInput, PropertyStatus, PropertyType, PropertyUpdateInput } from '../types';

export interface PropertyFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  city?: string;
  property_type?: PropertyType;
  min_rent?: number;
  max_rent?: number;
  bedrooms?: number;
  status?: PropertyStatus;
  owner_id?: number;
  sort_by?: 'created_at' | 'rent' | 'bedrooms' | 'city' | 'title';
  sort_order?: 'asc' | 'desc';
}

export const propertiesApi = {
  async list(params: PropertyFilterParams = {}): Promise<Page<Property>> {
    const res = await apiClient.get<Page<Property>>('/properties', { params });
    return res.data;
  },

  async get(id: number): Promise<Property> {
    const res = await apiClient.get<Property>(`/properties/${id}`);
    return res.data;
  },

  async create(data: PropertyCreateInput): Promise<Property> {
    const res = await apiClient.post<Property>('/properties', data);
    return res.data;
  },

  async update(id: number, data: PropertyUpdateInput): Promise<Property> {
    const res = await apiClient.put<Property>(`/properties/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/properties/${id}`);
  },
};
