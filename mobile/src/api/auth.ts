import { fetchApi } from './client';

export const authApi = {
  // Signup creates a CUSTOMER only
  signup: async (data: any) => {
    return fetchApi('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Login
  login: async (credentials: any) => {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Get current user profile using JWT token (which fetchApi automatically adds)
  getMe: async () => {
    return fetchApi('/api/auth/me');
  }
};
