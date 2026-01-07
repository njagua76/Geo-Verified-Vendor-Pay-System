import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  // Wait for auth loading
  if (loading) return null;

  // Check if user exists and has the correct role
  const role = user?.role_name?.toLowerCase();
  if (!user || !role || role !== allowedRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
