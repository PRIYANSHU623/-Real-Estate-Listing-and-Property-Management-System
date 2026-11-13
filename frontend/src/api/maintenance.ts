import { apiClient } from './client';
import { MaintenanceTicket, Page, TicketCreateInput, TicketPriority, TicketStatus, TicketUpdateInput } from '../types';

export interface TicketListParams {
  page?: number;
  page_size?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  property_id?: number;
}

export const maintenanceApi = {
  async list(params: TicketListParams = {}): Promise<Page<MaintenanceTicket>> {
    const res = await apiClient.get<Page<MaintenanceTicket>>('/maintenance', { params });
    return res.data;
  },

  async get(id: number): Promise<MaintenanceTicket> {
    const res = await apiClient.get<MaintenanceTicket>(`/maintenance/${id}`);
    return res.data;
  },

  async create(data: TicketCreateInput): Promise<MaintenanceTicket> {
    const res = await apiClient.post<MaintenanceTicket>('/maintenance', data);
    return res.data;
  },

  async update(id: number, data: TicketUpdateInput): Promise<MaintenanceTicket> {
    const res = await apiClient.put<MaintenanceTicket>(`/maintenance/${id}`, data);
    return res.data;
  },

  async updateStatus(id: number, status: TicketStatus): Promise<MaintenanceTicket> {
    const res = await apiClient.put<MaintenanceTicket>(`/maintenance/${id}/status`, { status });
    return res.data;
  },

  async assignVendor(id: number, vendor_id: number): Promise<MaintenanceTicket> {
    const res = await apiClient.put<MaintenanceTicket>(`/maintenance/${id}/assign`, { vendor_id });
    return res.data;
  },
};
