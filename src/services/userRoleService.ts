// import api from '@/config/api';

// // API endpoints
// const ENDPOINTS = {
//   USERS: '/user-roles/',
//   ROLES: '/roles/',
//   USER_ROLES: '/user-roles/'
// };

// export interface User {
//   id: number;
//   name?: string;
//   email?: string;
//   role?: string;
//   status?: "ACTIVE" | "INACTIVE";
//   googleProfilePic?: string;
// }

// export interface Role {
//   id: number;
//   name: string;
//   description: string;
//   permissions: Record<string, boolean>;
//   created_at: string;
//   updated_at: string;
// }

// export interface UserRole {
//   id: number;
//   user: {
//     id: number;
//     username?: string;
//     email?: string;
//   };
//   role: Role;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export interface InviteUserForm {
//   name: string;
//   email: string;
//   role: string;
// }

// const userRoleService = {
//   // Get all users
//   getUsers: async (): Promise<User[]> => {
//     try {
//       const response = await api.get(ENDPOINTS.USERS);
//       const data = response.data;
      
//       // Ensure we have an array of valid user objects
//       if (Array.isArray(data)) {
//         return data.map(user => ({
//           id: user.id || 0,
//           name: user.name || '',
//           email: user.email || '',
//           role: user.role || '',
//           status: user.status || 'INACTIVE',
//           googleProfilePic: user.googleProfilePic
//         }));
//       }
      
//       // If it's a single user object
//       if (data && typeof data === 'object') {
//         return [{
//           id: data.id || 0,
//           name: data.name || '',
//           email: data.email || '',
//           role: data.role || '',
//           status: data.status || 'INACTIVE',
//           googleProfilePic: data.googleProfilePic
//         }];
//       }
      
//       return [];
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       throw new Error('Failed to fetch users. Please try again later.');
//     }
//   },

//   // Get all roles
//   getRoles: async (): Promise<Role[]> => {
//     try {
//       const response = await api.get(ENDPOINTS.ROLES);
//       const data = response.data;
      
//       // Ensure we have an array of valid role objects
//       if (Array.isArray(data)) {
//         return data.map(role => ({
//           id: role.id || 0,
//           name: role.name || '',
//           description: role.description || '',
//           permissions: role.permissions || {},
//           created_at: role.created_at || new Date().toISOString(),
//           updated_at: role.updated_at || new Date().toISOString()
//         }));
//       }
      
//       // If it's a single role object
//       if (data && typeof data === 'object') {
//         return [{
//           id: data.id || 0,
//           name: data.name || '',
//           description: data.description || '',
//           permissions: data.permissions || {},
//           created_at: data.created_at || new Date().toISOString(),
//           updated_at: data.updated_at || new Date().toISOString()
//         }];
//       }
      
//       return [];
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       throw new Error('Failed to fetch roles. Please try again later.');
//     }
//   },

//   // Get user roles
//   getUserRoles: async (): Promise<UserRole[]> => {
//     try {
//       const response = await api.get(ENDPOINTS.USER_ROLES);
//       const data = response.data;
      
//       // Ensure we have an array of valid user role objects
//       if (Array.isArray(data)) {
//         return data.map(userRole => ({
//           id: userRole.id || 0,
//           user: {
//             id: userRole.user?.id || 0,
//             username: userRole.user?.username || '',
//             email: userRole.user?.email || ''
//           },
//           role: userRole.role || {
//             id: 0,
//             name: '',
//             description: '',
//             permissions: {},
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString()
//           },
//           is_active: userRole.is_active || false,
//           created_at: userRole.created_at || new Date().toISOString(),
//           updated_at: userRole.updated_at || new Date().toISOString()
//         }));
//       }
      
//       return [];
//     } catch (error) {
//       console.error('Error fetching user roles:', error);
//       throw new Error('Failed to fetch user roles. Please try again later.');
//     }
//   },

//   // Invite new user
//   inviteUser: async (userData: InviteUserForm): Promise<User | null> => {
//     try {
//       const response = await api.post(ENDPOINTS.USERS, {
//         ...userData,
//         status: 'ACTIVE' // Set initial status
//       });
//       const data = response.data;
      
//       if (data && typeof data === 'object') {
//         return {
//           id: data.id || 0,
//           name: data.name || userData.name,
//           email: data.email || userData.email,
//           role: data.role || userData.role,
//           status: data.status || 'ACTIVE',
//           googleProfilePic: data.googleProfilePic
//         };
//       }
      
//       return null;
//     } catch (error) {
//       console.error('Error inviting user:', error);
//       throw new Error('Failed to invite user. Please try again later.');
//     }
//   },

//   // Delete user
//   deleteUser: async (userId: number): Promise<boolean> => {
//     try {
//       await api.delete(`${ENDPOINTS.USERS}${userId}/`);
//       return true;
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       throw new Error('Failed to delete user. Please try again later.');
//     }
//   },

//   // Toggle user status
//   toggleUserStatus: async (userId: number, isActive: boolean): Promise<User | null> => {
//     try {
//       const response = await api.patch(`${ENDPOINTS.USERS}${userId}/`, {
//         is_active: isActive,
//         status: isActive ? 'ACTIVE' : 'INACTIVE'
//       });
//       const data = response.data;
      
//       if (data && typeof data === 'object') {
//         return {
//           id: data.id || userId,
//           name: data.name || '',
//           email: data.email || '',
//           role: data.role || '',
//           status: isActive ? 'ACTIVE' : 'INACTIVE',
//           googleProfilePic: data.googleProfilePic
//         };
//       }
      
//       return null;
//     } catch (error) {
//       console.error('Error toggling user status:', error);
//       throw new Error('Failed to update user status. Please try again later.');
//     }
//   }
// };

// export default userRoleService; 