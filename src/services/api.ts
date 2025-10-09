const API_BASE_URL = 'https://univer-xrec.onrender.com/api';

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

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Vacancies
  async getVacancies(): Promise<Vacancy[]> {
    return this.request<Vacancy[]>('/vacancies');
  }

  async getVacancy(id: number): Promise<Vacancy> {
    return this.request<Vacancy>(`/vacancies/${id}`);
  }

  async getDeletedVacancies(): Promise<Vacancy[]> {
    return this.request<Vacancy[]>('/vacancies/deleted');
  }

  async createVacancy(vacancy: Omit<Vacancy, 'id'>): Promise<Vacancy> {
    return this.request<Vacancy>('/vacancies', {
      method: 'POST',
      body: JSON.stringify(vacancy),
    });
  }

  async updateVacancy(id: number, vacancy: Partial<Vacancy>): Promise<Vacancy> {
    return this.request<Vacancy>(`/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vacancy),
    });
  }

  async deleteVacancy(id: number): Promise<void> {
    return this.request<void>(`/vacancies/${id}`, {
      method: 'DELETE',
    });
  }

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    return this.request<Subscription[]>('/subscriptions');
  }

  async getDeletedSubscriptions(): Promise<Subscription[]> {
    return this.request<Subscription[]>('/subscriptions/deleted');
  }

  async createSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription> {
    return this.request<Subscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }
}

export const apiService = new ApiService();
