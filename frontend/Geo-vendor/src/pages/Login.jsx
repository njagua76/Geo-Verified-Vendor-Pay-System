import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MOCK_MODE = process.env.REACT_APP_MOCK_AUTH === 'true' || !process.env.REACT_APP_API_URL;

export const Login = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Redirect if already logged in - based on user role
  useEffect(() => {
    if (isLoggedIn && user) {
      const userRole = user?.role || user?.role_name;
      if (userRole === 'Admin') {
        navigate('/dashboard', { replace: true });
      } else if (userRole === 'Field Agent') {
        navigate('/verify', { replace: true });
      }
    }
  }, [isLoggedIn, user, navigate]);

  // Clear form on mount (in case coming from logout)
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 1) {
      setError('Please enter your password');
      return;
    }
    
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setEmail('');
        setPassword('');
        
        // Redirect based on user role
        const role = result.user?.role_name;
        setTimeout(() => {
          if (role === 'Admin') {
            navigate('/dashboard');
          } else if (role === 'Field Agent') {
            navigate('/verify');
          } else {
            navigate('/');
          }
        }, 500);
      } else {
        setError(typeof result.message === 'string' ? result.message : 'Login failed. Please try again.');
        setPassword(''); // Clear password on error
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-xl mb-4">
            <MapPin className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">GeoVend</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Geo-Verified Field Payments</p>
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-blue-600">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Secure Location-Based Transactions</span>
          </div>
          
          {/* Mock Mode Indicator */}
          {MOCK_MODE && (
            <div className="mt-4 mx-auto max-w-sm px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 text-left">
                <p className="font-semibold mb-1">Demo Mode (No Backend)</p>
                <p className="text-amber-700">
                  <strong>Admin:</strong> admin@example.com / admin123<br />
                  <strong>Agent:</strong> agent@example.com / agent123
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-green-900">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                disabled={loading}
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-12 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
