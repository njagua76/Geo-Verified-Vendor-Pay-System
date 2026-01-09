import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Auth
export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data;
};

// Get all users
export const fetchUsers = async (token) => {
  const res = await axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get all suppliers
export const fetchSuppliers = async (token) => {
  const res = await axios.get(`${API_URL}/suppliers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get all transactions
export const fetchTransactions = async (token) => {
  const res = await axios.get(`${API_URL}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addUser = async (token, data) => axios.post(`${API_URL}/users`, data, { headers: { Authorization: `Bearer ${token}` } });
export const updateUser = async (token, id, data) => axios.put(`${API_URL}/users/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
export const deleteUser = async (token, id) => axios.delete(`${API_URL}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export const addSupplier = async (token, data) => axios.post(`${API_URL}/suppliers`, data, { headers: { Authorization: `Bearer ${token}` } });
export const updateSupplier = async (token, id, data) => axios.put(`${API_URL}/suppliers/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
export const deleteSupplier = async (token, id) => axios.delete(`${API_URL}/suppliers/${id}`, { headers: { Authorization: `Bearer ${token}` } });

