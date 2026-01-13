import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers, FaStore, FaExchangeAlt, FaSignOutAlt, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../api/apiClient";

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [data, setData] = useState({ 
    total_users: 0, 
    total_suppliers: 0, 
    total_transactions: 0,
    success_count: 0,
    pending_count: 0,
    failed_count: 0,
    recent_transactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminAPI.getDashboard();
        setData(response.data.stats || {
          total_users: response.data.data?.total_users || 0,
          total_suppliers: response.data.data?.total_suppliers || 0,
          total_transactions: response.data.data?.total_transactions || 0,
          success_count: response.data.data?.success_count || 0,
          pending_count: response.data.data?.pending_count || 0,
          failed_count: response.data.data?.failed_count || 0,
          recent_transactions: response.data.data?.recent_transactions || 0
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        // Fallback to direct axios call if API wrapper fails
        try {
          const res = await axios.get("/api/admin/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setData(res.data.stats || {
            total_users: res.data.data?.total_users || 0,
            total_suppliers: res.data.data?.total_suppliers || 0,
            total_transactions: res.data.data?.total_transactions || 0
          });
        } catch (fallbackErr) {
          console.error("Fallback also failed:", fallbackErr);
          setData({ 
            total_users: 0, 
            total_suppliers: 0, 
            total_transactions: 0,
            success_count: 0,
            pending_count: 0,
            failed_count: 0,
            recent_transactions: 0
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="p-6 border-b border-blue-700">
          <h2 className="text-2xl font-bold tracking-tight">GeoVendor</h2>
          <p className="text-sm text-blue-200 mt-1">Admin Panel</p>
        </div>
        
        <nav className="mt-8 space-y-2 px-4">
          <a 
            href="/admin/dashboard" 
            className="flex items-center px-4 py-3 text-sm font-medium text-white bg-blue-700 rounded-lg transition-all duration-200 hover:bg-blue-600 shadow-md"
          >
            <span className="w-5 h-5 mr-3">📊</span>
            Dashboard
          </a>
          <a 
            href="/admin/users" 
            className="flex items-center px-4 py-3 text-sm font-medium text-blue-100 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:text-white"
          >
            <span className="w-5 h-5 mr-3">👥</span>
            Users
          </a>
          <a 
            href="/admin/suppliers" 
            className="flex items-center px-4 py-3 text-sm font-medium text-blue-100 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:text-white"
          >
            <span className="w-5 h-5 mr-3">🏪</span>
            Suppliers
          </a>
          <a 
            href="/admin/transactions" 
            className="flex items-center px-4 py-3 text-sm font-medium text-blue-100 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:text-white"
          >
            <span className="w-5 h-5 mr-3">💳</span>
            Transactions
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md"
            >
              <FaSignOutAlt className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Users Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "-" : data.total_users}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-full">
                  <FaUsers className="text-blue-600 text-2xl" />
                </div>
              </div>
            </div>

            {/* Suppliers Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Suppliers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "-" : data.total_suppliers}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <FaStore className="text-green-600 text-2xl" />
                </div>
              </div>
            </div>

            {/* Transactions Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Transactions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "-" : data.total_transactions}</p>
                </div>
                <div className="bg-amber-100 p-4 rounded-full">
                  <FaExchangeAlt className="text-amber-600 text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Success Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Successful</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{loading ? "-" : data.success_count}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <FaCheckCircle className="text-green-600 text-2xl" />
                </div>
              </div>
            </div>

            {/* Pending Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{loading ? "-" : data.pending_count}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-full">
                  <FaClock className="text-yellow-600 text-2xl" />
                </div>
              </div>
            </div>

            {/* Failed Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Failed</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{loading ? "-" : data.failed_count}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-full">
                  <FaTimesCircle className="text-red-600 text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-gray-600 text-sm">Transactions in Last 7 Days</p>
                <p className="text-2xl font-bold text-blue-600">{loading ? "-" : data.recent_transactions}</p>
              </div>
              <FaExchangeAlt className="text-blue-400 text-3xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

