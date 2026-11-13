import { apiClient } from './client';
import { Page, Payment, PaymentOrderCreateInput, PaymentOrderResponse, PaymentStatus, PaymentVerifyInput } from '../types';

export interface PaymentHistoryParams {
  page?: number;
  page_size?: number;
  status?: PaymentStatus;
}

export const paymentsApi = {
  async createOrder(data: PaymentOrderCreateInput): Promise<PaymentOrderResponse> {
    const res = await apiClient.post<PaymentOrderResponse>('/payments/create-order', data);
    return res.data;
  },

  async verify(data: PaymentVerifyInput): Promise<Payment> {
    const res = await apiClient.post<Payment>('/payments/verify', data);
    return res.data;
  },

  async history(params: PaymentHistoryParams = {}): Promise<Page<Payment>> {
    const res = await apiClient.get<Page<Payment>>('/payments/history', { params });
    return res.data;
  },

  async get(id: number): Promise<Payment> {
    const res = await apiClient.get<Payment>(`/payments/${id}`);
    return res.data;
  },
};
