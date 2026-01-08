import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Auth
export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/api/auth/login`, {
    email,
    password,
  });
  return res.data;
};

// Users
export const fetchUsers = async (token) => {
  const res = await axios.get(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Suppliers
export const fetchSuppliers = async (token) => {
  const res = await axios.get(`${API_URL}/api/suppliers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Transactions
export const fetchTransactions = async (token) => {
  const res = await axios.get(`${API_URL}/api/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
