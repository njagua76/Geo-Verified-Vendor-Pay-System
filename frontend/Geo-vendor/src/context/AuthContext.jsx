import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          // Validate token is still good by trying to parse it
          try {
            const userData = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(userData);
            setIsLoggedIn(true);
            
            // Set the token in axios headers
            axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          } catch (parseError) {
            // If parsing fails, clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
            setIsLoggedIn(false);
          }
        } else {
          // No stored data, ensure clean state
          setToken(null);
          setUser(null);
          setIsLoggedIn(false);
          delete axios.defaults.headers.common["Authorization"];
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Clear any previous auth state before login
      setIsLoggedIn(false);
      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common["Authorization"];

      const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.post(
        `${baseURL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token: newToken, user: userData } = response.data;

      if (!newToken || !userData) {
        return { success: false, message: "Invalid response from server" };
      }

      // Store token and user in state and localStorage
      setToken(newToken);
      setUser(userData);
      setIsLoggedIn(true);

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Set token in axios headers for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return { success: true, user: userData };
    } catch (error) {
      // Ensure clean state on error
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Invalid credentials";
      return { success: false, message };
    }
  };

  const logout = () => {
    // Clear all auth state
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    
    // Clear axios headers
    delete axios.defaults.headers.common["Authorization"];
    
    // Reset axios instance
    axios.defaults.headers.common = {};
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
