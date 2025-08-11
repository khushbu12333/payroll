import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // This is important for handling cookies
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Log the request
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });

    // Get the token from localStorage or cookies
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Log the response
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async (error) => {
    // Log the error
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data,
        headers: error.config?.headers
      }
    });

    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await api.post('/auth/refresh-token');
        const { token } = response.data;

        // Store the new token
        localStorage.setItem('token', token);

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 500 errors specifically
    if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
      // You might want to show a user-friendly error message here
      return Promise.reject(new Error('Server error occurred. Please try again later.'));
    }

    return Promise.reject(error);
  }
);

export default api;

export const API_BASE_URL = "http://localhost:8000/api";

export async function getAll() {
  const res = await fetch('/api/dashboard-stats');
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
} 