import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">GeoVend Pay</h1>
            <p className="text-xs text-gray-600">Geo-Verified Payments</p>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {user && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                  <p className="text-xs text-gray-600 capitalize">
                    {user.role === 'administrator' ? 'Admin' : user.role === 'field_agent' ? 'Field Agent' : user.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
