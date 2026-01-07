import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://geo-vendor-backend.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => 
    apiClient.post('/api/auth/login', { email, password }),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const dashboardAPI = {
  getAdmin: () => apiClient.get('/api/admin/dashboard'),
  getAgent: () => apiClient.get('/api/agent/verify'),
};

export const profileAPI = {
  getProfile: () => apiClient.get('/api/profile'),
};

export default apiClient;
