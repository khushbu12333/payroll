// import axios from 'axios';

// const API_BASE_URL = 'http://127.0.0.1:8002/api';

// export interface UserRole {
//   id: number;
//   user: {
//     id: number;
//     username: string;
//     email: string;
//   };
//   role: {
//     id: number;
//     name: string;
//     description: string;
//     permissions: Record<string, boolean>;
//     created_at: string;
//     updated_at: string;
//   };
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export const userRolesService = {
//   async getAllUserRoles(): Promise<UserRole[]> {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/user-roles/`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching user roles:', error);
//       throw error;
//     }
//   },

//   async createUserRole(data: Partial<UserRole>): Promise<UserRole> {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/user-roles/`, data);
//       return response.data;
//     } catch (error) {
//       console.error('Error creating user role:', error);
//       throw error;
//     }
//   },

//   async updateUserRole(id: number, data: Partial<UserRole>): Promise<UserRole> {
//     try {
//       const response = await axios.put(`${API_BASE_URL}/user-roles/${id}/`, data);
//       return response.data;
//     } catch (error) {
//       console.error('Error updating user role:', error);
//       throw error;
//     }
//   },

//   async deleteUserRole(id: number): Promise<void> {
//     try {
//       await axios.delete(`${API_BASE_URL}/user-roles/${id}/`);
//     } catch (error) {
//       console.error('Error deleting user role:', error);
//       throw error;
//     }
//   }
// }; 