import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getApiUrl } from "../utils/authUtils";

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Handle Unauthorized (401)
    if (error.response?.status === 401) {
      // Dispatch global event for AuthContext to handle logout
      window.dispatchEvent(new Event('auth-unauthorized'));
    }

    // Production-ready: Suppress noisy logs, but toast critical errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Our team has been notified.');
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
