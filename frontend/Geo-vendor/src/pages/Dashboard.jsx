import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, DollarSign, Building2, MapPin, RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    totalValue: 0,
    activeSuppliers: 0,
    activeAgents: 0,
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

      // Fetch transactions
      const txnResponse = await axios.get('/api/transactions');
      const txns = txnResponse.data || [];
      setTransactions(txns.slice(0, 10));

      // Calculate stats from transactions
      const successCount = txns.filter((t) => t.status === 'success').length;
      const failedCount = txns.filter((t) => t.status === 'failed').length;
      const totalValue = txns.reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        totalTransactions: txns.length,
        successfulTransactions: successCount,
        failedTransactions: failedCount,
        totalValue: totalValue,
        activeSuppliers: txns.length > 0 ? Math.ceil(txns.length / 2) : 0,
        activeAgents: txns.length > 0 ? Math.ceil(txns.length / 3) : 0,
      });

      // Fetch suppliers
      const supResponse = await axios.get('/api/suppliers');
      setSuppliers(supResponse.data || []);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (isoString) => {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slide-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              Transaction Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Monitor payment activity and verification logs</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Transactions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all animate-slide-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTransactions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Successful Transactions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all animate-slide-in" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Successful</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.successfulTransactions}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.totalTransactions > 0 ? ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% success rate
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  KES {(stats.totalValue / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Active Suppliers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all animate-slide-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Suppliers</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{suppliers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Transactions
            </h2>
            <p className="text-sm text-gray-600 mt-1">Last 10 payment verification attempts</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <tr key={transaction.id || index} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{transaction.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.supplier_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        KES {(transaction.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(transaction.timestamp)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-600">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suppliers Card */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all animate-slide-in" style={{ animationDelay: '0.25s' }}>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-orange-600" />
            Active Suppliers
          </h3>
          <div className="space-y-3">
            {suppliers.length > 0 ? (
              suppliers.slice(0, 5).map((supplier) => (
                <div key={supplier.id} className="flex items-start justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{supplier.name}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {supplier.latitude.toFixed(4)}, {supplier.longitude.toFixed(4)}
                    </p>
                  </div>
                  <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No suppliers available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
