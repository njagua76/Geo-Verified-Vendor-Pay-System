import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://geo-verified-vendor-pay-system-2blk.onrender.com';
const MOCK_MODE = process.env.REACT_APP_MOCK_AUTH === 'true';

// Mock data from seed_data.py
const MOCK_SUPPLIERS = [
  {
    id: 1,
    name: 'Nairobi Central Hub',
    supplier_id: 'SUP001',
    latitude: -1.2921,
    longitude: 36.8219,
    mpesa_phone_number: '+254722123456',
    contact_person: 'John Kamau',
    contact_email: 'john@nairobi-hub.com',
    address: '123 Kenyatta Avenue, Nairobi',
    location: '123 Kenyatta Avenue, Nairobi'
  },
  {
    id: 2,
    name: 'Westlands Distribution Center',
    supplier_id: 'SUP002',
    latitude: -1.2611,
    longitude: 36.8028,
    mpesa_phone_number: '+254722234567',
    contact_person: 'Sarah Kipchoge',
    contact_email: 'sarah@westlands.com',
    address: '456 Westlands Road, Nairobi',
    location: '456 Westlands Road, Nairobi'
  },
  {
    id: 3,
    name: 'Karen Logistics Point',
    supplier_id: 'SUP003',
    latitude: -1.3089,
    longitude: 36.7623,
    mpesa_phone_number: '+254722345678',
    contact_person: 'Peter Mwangi',
    contact_email: 'peter@karen-logistics.com',
    address: '789 Karen Road, Nairobi',
    location: '789 Karen Road, Nairobi'
  },
  {
    id: 4,
    name: 'Upper Hill Operations',
    supplier_id: 'SUP004',
    latitude: -1.2856,
    longitude: 36.7738,
    mpesa_phone_number: '+254722456789',
    contact_person: 'Grace Omondi',
    contact_email: 'grace@upperhill.com',
    address: '321 Upper Hill Road, Nairobi',
    location: '321 Upper Hill Road, Nairobi'
  },
  {
    id: 5,
    name: 'Kilimani Trading Hub',
    supplier_id: 'SUP005',
    latitude: -1.2966,
    longitude: 36.8049,
    mpesa_phone_number: '+254722567890',
    contact_person: 'Michael Kiplagat',
    contact_email: 'michael@kilimani.com',
    address: '654 Kilimani Avenue, Nairobi',
    location: '654 Kilimani Avenue, Nairobi'
  },
  {
    id: 6,
    name: 'Ruiru Mugutha Distribution',
    supplier_id: 'SUP006',
    latitude: -1.0850,
    longitude: 36.9250,
    mpesa_phone_number: '+254722678901',
    contact_person: 'David Mwangi',
    contact_email: 'david@ruiru-mugutha.com',
    address: 'Near Tumaini Spire Academy, Mugutha, Ruiru',
    location: 'Near Tumaini Spire Academy, Mugutha, Ruiru'
  },
  {
    id: 7,
    name: 'Executive Building Mugutha',
    supplier_id: 'SUP007',
    latitude: -1.1231552725673162,
    longitude: 36.963508053527995,
    mpesa_phone_number: '+254722789012',
    contact_person: 'Henry Kipchoge',
    contact_email: 'henry@executive-mugutha.com',
    address: 'Executive Building, Mugutha, Ruiru',
    location: 'Executive Building, Mugutha, Ruiru'
  }
];

const MOCK_DASHBOARD_STATS = {
  total_users: 2,
  total_suppliers: 7,
  total_transactions: 15,
  success_count: 12,
  pending_count: 2,
  failed_count: 1,
  recent_transactions: 5
};

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
  getAll: () => {
    if (MOCK_MODE) {
      return Promise.resolve({ data: { suppliers: MOCK_SUPPLIERS } });
    }
    return apiClient.get('/api/suppliers');
  },
  getById: (id) => {
    if (MOCK_MODE) {
      const supplier = MOCK_SUPPLIERS.find(s => s.id === parseInt(id));
      return Promise.resolve({ data: { supplier: supplier || MOCK_SUPPLIERS[0] } });
    }
    return apiClient.get(`/api/suppliers/${id}`);
  },
  create: (data) => apiClient.post('/api/suppliers', data),
  update: (id, data) => apiClient.put(`/api/suppliers/${id}`, data),
  delete: (id) => apiClient.delete(`/api/suppliers/${id}`),
  initiatePayment: (data) => {
    if (MOCK_MODE) {
      return Promise.resolve({ 
        data: { 
          success: true,
          message: 'Mock payment initiated (no M-Pesa in mock mode)',
          checkout_request_id: `MOCK-${Date.now()}`
        } 
      });
    }
    return apiClient.post('/api/suppliers/payment', data);
  },
  getPaymentStatus: (checkoutRequestId) => {
    if (MOCK_MODE) {
      return Promise.resolve({ 
        data: { 
          status: 'success',
          message: 'Mock payment successful'
        } 
      });
    }
    return apiClient.get(`/api/suppliers/payment/status/${checkoutRequestId}`);
  },
  getTransactions: (params = {}) => {
    if (MOCK_MODE) {
      return Promise.resolve({ data: { transactions: [] } });
    }
    return apiClient.get('/api/suppliers/transactions', { params });
  },
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

export const adminAPI = {
  getDashboard: () => {
    if (MOCK_MODE) {
      return Promise.resolve({ data: { stats: MOCK_DASHBOARD_STATS } });
    }
    return apiClient.get('/api/admin/dashboard');
  },
  getTransactions: (params = {}) => {
    if (MOCK_MODE) {
      return Promise.resolve({ data: { transactions: [] } });
    }
    return apiClient.get('/api/admin/transactions', { params });
  },
  getTransactionDetail: (transactionId) => {
    if (MOCK_MODE) {
      return Promise.resolve({ data: { transaction: {} } });
    }
    return apiClient.get(`/api/admin/transactions/${transactionId}`);
  },
  getSuppliers: () => {
    if (MOCK_MODE) {
      return Promise.resolve({ data: { suppliers: MOCK_SUPPLIERS } });
    }
    return apiClient.get('/api/admin/suppliers');
  },
  getUsers: () => {
    if (MOCK_MODE) {
      return Promise.resolve({ 
        data: { 
          users: [
            { id: 1, email: 'admin@example.com', role_name: 'Admin' },
            { id: 2, email: 'agent@example.com', role_name: 'Field Agent' }
          ] 
        } 
      });
    }
    return apiClient.get('/api/admin/users');
  },
};

export default apiClient;
