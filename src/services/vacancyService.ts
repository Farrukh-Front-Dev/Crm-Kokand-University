import axiosInstance from './axiosInstance';

export interface Vacancy {
  id?: string;
  title: string;
  description: string;
  location: string;
  image?: string;
  experience: string;
  requirement: string;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
}

export const vacancyService = {
  async getVacancies(): Promise<Vacancy[]> {
    const response = await axiosInstance.get('/vacancies');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  async getVacancy(id: string): Promise<Vacancy> {
    const response = await axiosInstance.get(`/vacancies/${id}`);
    return response.data?.data || response.data;
  },

  async getDeletedVacancies(): Promise<Vacancy[]> {
    const response = await axiosInstance.get('/vacancies/deleted');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  async createVacancy(vacancy: Omit<Vacancy, 'id'>): Promise<Vacancy> {
    const response = await axiosInstance.post('/vacancies', vacancy);
    return response.data?.data || response.data;
  },

  async updateVacancy(id: string, vacancy: Partial<Vacancy>): Promise<Vacancy> {
    const response = await axiosInstance.put(`/vacancies/${id}`, vacancy);
    return response.data?.data || response.data;
  },

  async deleteVacancy(id: string): Promise<void> {
    await axiosInstance.delete(`/vacancies/${id}`);
  },
};
