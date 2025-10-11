import axiosInstance from './axiosInstance';

export interface Subscription {
  id?: string;
  fullName: string;
  age: string;
  gender: string;
  resume_file: string;
  phone: string;
  email: string;
  major: string;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export const subscriptionService = {
  async getSubscriptions(): Promise<Subscription[]> {
    const response = await axiosInstance.get('/subscriptions');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  async getDeletedSubscriptions(): Promise<Subscription[]> {
    const response = await axiosInstance.get('/subscriptions/deleted');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  async createSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription> {
    const response = await axiosInstance.post('/subscriptions', subscription);
    return response.data?.data || response.data;
  },
};
