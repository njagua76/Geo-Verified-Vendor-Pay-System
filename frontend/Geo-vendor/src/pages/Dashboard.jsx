import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, CheckCircle2, XCircle, AlertCircle, Building2, MapPin, Zap, Clock, Users } from 'lucide-react';
import { dashboardAPI, suppliersAPI, adminAPI } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFieldAgents: 0,
    totalAdmins: 0,
    totalSuppliers: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard stats from backend
      try {
        const dashResponse = await dashboardAPI.getAdmin();
        const dashStats = dashResponse.data.stats || {};
        setStats((prevStats) => ({
          ...prevStats,
          totalUsers: dashStats.total_users || 0,
          totalFieldAgents: dashStats.total_field_agents || 0,
          totalAdmins: dashStats.total_admins || 0,
          totalSuppliers: dashStats.total_suppliers || 0,
        }));
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }

      // Fetch suppliers
      try {
        const supResponse = await suppliersAPI.getAll();
        const supplierData = supResponse.data.suppliers || supResponse.data || [];
        setSuppliers(supplierData);
      } catch (err) {
        console.log('Suppliers fetch error:', err);
        setSuppliers([]);
      }

      // Fetch transactions
      try {
        const txnResponse = await adminAPI.getTransactionLogs();
        const txns = txnResponse.data;
          const txnArray = Array.isArray(txns) ? txns : txns.transactions || [];
          setTransactions(txnArray.slice(0, 10));

          // Update transaction stats
          const successCount = txnArray.filter((t) => t.status === 'PAYMENT_SENT').length;
          const failedCount = txnArray.filter((t) => t.status === 'VERIFICATION_FAIL' || t.status === 'PAYMENT_FAILED').length;

          setStats((prevStats) => ({
            ...prevStats,
            totalTransactions: txnArray.length,
            successfulTransactions: successCount,
            failedTransactions: failedCount,
          }));
        }
      } catch (err) {
        console.log('Transactions fetch error:', err);
      }
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAYMENT_SENT':
      case 'VERIFICATION_OK':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'PAYMENT_FAILED':
      case 'VERIFICATION_FAIL':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAYMENT_SENT':
      case 'VERIFICATION_OK':
        return 'bg-emerald-100 text-emerald-800';
      case 'PAYMENT_FAILED':
      case 'VERIFICATION_FAIL':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, <span className="font-semibold text-gray-900">{user?.email}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3 animate-slide-down">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold tracking-wide">Total Users</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.totalFieldAgents} agents • {stats.totalAdmins} admins
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Field Agents */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold tracking-wide">Field Agents</p>
                <p className="text-4xl font-bold text-blue-600 mt-3">{stats.totalFieldAgents}</p>
                <p className="text-xs text-gray-500 mt-2">Active verifiers</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Suppliers */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold tracking-wide">Suppliers</p>
                <p className="text-4xl font-bold text-orange-600 mt-3">{stats.totalSuppliers}</p>
                <p className="text-xs text-gray-500 mt-2">Active hubs</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold tracking-wide">Transactions</p>
                <p className="text-4xl font-bold text-emerald-600 mt-3">{stats.totalTransactions}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.totalTransactions > 0 ? ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% success
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-600" />
              Recent Transactions
            </h2>
            <p className="text-sm text-gray-600 mt-1">Last 10 payment verification attempts</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 tracking-wide">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 tracking-wide">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 tracking-wide">Distance</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 tracking-wide">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <tr 
                      key={transaction.id || index} 
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{transaction.id || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {transaction.supplier_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          {transaction.distance_meters ? `${transaction.distance_meters.toFixed(1)}m` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(transaction.status)}`}>
                            {transaction.status?.replace(/_/g, ' ').charAt(0).toUpperCase() + transaction.status?.replace(/_/g, ' ').slice(1).toLowerCase() || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatDate(transaction.created_at || transaction.timestamp)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Activity className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suppliers Card */}
        {suppliers.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-orange-600" />
              Active Supplier Hubs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.slice(0, 6).map((supplier) => (
                <div key={supplier.id} className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-orange-900">{supplier.name || `Supplier ${supplier.id}`}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-2">
                        <MapPin className="w-3 h-3" />
                        {supplier.latitude?.toFixed(4)}, {supplier.longitude?.toFixed(4)}
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold group-hover:bg-emerald-200">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
