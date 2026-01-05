import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Admin/Dashboard';
import Verify from './components/FieldAgent/Verify';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRole="Admin">
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Field Agent */}
          <Route path="/agent/verify" element={
            <ProtectedRoute allowedRole="Field Agent">
              <Verify />
            </ProtectedRoute>
          } />

          {/* Default redirect for "/" */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Optional: catch-all for 404 */}
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
