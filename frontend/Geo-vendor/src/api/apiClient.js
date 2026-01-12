import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

export const suppliersAPI = {
  getAll: () => apiClient.get('/api/suppliers'),
  getById: (id) => apiClient.get(`/api/suppliers/${id}`),
  create: (data) => apiClient.post('/api/suppliers', data),
  update: (id, data) => apiClient.put(`/api/suppliers/${id}`, data),
  delete: (id) => apiClient.delete(`/api/suppliers/${id}`),
};

export const verificationAPI = {
  verifyLocation: (userLat, userLon, supplierId) =>
    apiClient.post('/api/verify-location', {
      user_lat: userLat,
      user_lon: userLon,
      supplier_id: supplierId,
    }),
  
  getTransactionLogs: () => apiClient.get('/api/transactions-log'),
};

export const usersAPI = {
  getAll: () => apiClient.get('/api/users'),
  getByRole: (roleName) => apiClient.get(`/api/users/${roleName}`),
};

export default apiClient;
