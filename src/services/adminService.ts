import axiosInstance from './axiosInstance';

export interface Admin {
  email: string;
  name: string;
  password?: string;
}

export const adminService = {
  async getAdmins(): Promise<Admin[]> {
    const response = await axiosInstance.get('/admins');
    return response.data;
  },

  async createAdmin(admin: Admin): Promise<Admin> {
    const response = await axiosInstance.post('/admins', admin);
    return response.data;
  },

  async updateAdmin(email: string, admin: Partial<Admin>): Promise<Admin> {
    const response = await axiosInstance.put(`/admins/${email}`, admin);
    return response.data;
  },
};
