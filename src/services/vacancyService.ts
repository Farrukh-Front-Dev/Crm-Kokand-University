import axiosInstance from './axiosInstance';

export interface Vacancy {
  id?: number;
  title: string;
  description: string;
  location: string;
  image?: string;
  experience: string;
  requirement: string;
  created_at?: string;
  updated_at?: string;
}

export const vacancyService = {
  async getVacancies(): Promise<Vacancy[]> {
    const response = await axiosInstance.get('/vacancies');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  async getVacancy(id: number): Promise<Vacancy> {
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

  async updateVacancy(id: number, vacancy: Partial<Vacancy>): Promise<Vacancy> {
    const response = await axiosInstance.put(`/vacancies/${id}`, vacancy);
    return response.data?.data || response.data;
  },

  async deleteVacancy(id: number): Promise<void> {
    await axiosInstance.delete(`/vacancies/${id}`);
  },
};
