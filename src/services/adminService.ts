import axiosInstance from './axiosInstance';

export interface Admin {
  email: string;
  name: string;
  password?: string;
}

export const adminService = {
  async getAdmins(): Promise<Admin[]> {
    const response = await axiosInstance.get('/admins');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  async createAdmin(admin: Admin): Promise<Admin> {
    const response = await axiosInstance.post('/admins', admin);
    return response.data?.data || response.data;
  },

  async updateAdmin(email: string, admin: Partial<Admin>): Promise<Admin> {
    const response = await axiosInstance.put(`/admins/${email}`, admin);
    return response.data?.data || response.data;
  },
};
