import './index.css';
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import Payment from './pages/Payment';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes - Login is the landing page */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Field Agent Routes */}
        <Route
          path="/verify"
          element={
            <ProtectedRoute allowedRoles={['Field Agent']}>
              <Verify />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute allowedRoles={['Field Agent']}>
              <Payment />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
