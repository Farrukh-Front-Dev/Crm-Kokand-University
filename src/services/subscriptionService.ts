import axiosInstance from './axiosInstance';

export interface Subscription {
  id?: number;
  fullName: string;
  age: number;
  gender: string;
  resume_file: string;
  phone: string;
  email: string;
  yonalish: string;
  vacansy_id: number;
  created_at?: string;
}

export const subscriptionService = {
  async getSubscriptions(): Promise<Subscription[]> {
    const response = await axiosInstance.get('/subscriptions');
    return response.data;
  },

  async getDeletedSubscriptions(): Promise<Subscription[]> {
    const response = await axiosInstance.get('/subscriptions/deleted');
    return response.data;
  },

  async createSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription> {
    const response = await axiosInstance.post('/subscriptions', subscription);
    return response.data;
  },
};
