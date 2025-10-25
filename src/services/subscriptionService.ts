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

const API_BASE_URL = 'https://univer-production.up.railway.app/api';

export const subscriptionService = {
  async getSubscriptions(): Promise<Subscription[]> {
    const response = await axiosInstance.get('/subscriptions');
    const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return data.map(sub => ({
      ...sub,
      resume_file: sub.resume_file?.startsWith('http') 
        ? sub.resume_file 
        : `${API_BASE_URL}/${sub.resume_file}`
    }));
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
