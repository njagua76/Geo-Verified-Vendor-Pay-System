import React, { useState, useEffect } from "react";
import { FaEye, FaDownload, FaFilter, FaSearch, FaExchangeAlt } from "react-icons/fa";
import { adminAPI } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

const Transactions = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  });
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, [token, pagination.page, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.per_page
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await adminAPI.getTransactions(params);
      
      // Handle different response formats
      const responseData = response.data;
      
      if (responseData.transactions) {
        setTransactions(responseData.transactions);
        setPagination(prev => ({
          ...prev,
          total: responseData.total,
          total_pages: responseData.total_pages
        }));
      } else if (Array.isArray(responseData)) {
        // Fallback for direct array response
        setTransactions(responseData);
        setPagination(prev => ({
          ...prev,
          total: responseData.length,
          total_pages: Math.ceil(responseData.length / prev.per_page)
        }));
      } else {
        setTransactions([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "verified":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case "success":
        return "✓";
      case "pending":
        return "⏳";
      case "failed":
        return "✕";
      case "verified":
        return "✓";
      default:
        return "•";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    return `KES ${parseFloat(amount).toLocaleString()}`;
  };

  const filteredTransactions = transactions.filter(tx => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      tx.supplier_name?.toLowerCase().includes(searchLower) ||
      tx.agent_email?.toLowerCase().includes(searchLower) ||
      tx.id?.toString().includes(searchLower) ||
      tx.status?.toLowerCase().includes(searchLower) ||
      tx.mpesa_receipt_number?.toLowerCase().includes(searchLower)
    );
  });

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleExport = () => {
    // Simple CSV export
    const headers = ['ID', 'Supplier', 'Agent', 'Amount', 'Distance', 'Status', 'Date'];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.supplier_name || 'N/A',
      tx.agent_email || 'N/A',
      tx.amount || '0',
      tx.distance_meters || '0',
      tx.status || 'Unknown',
      tx.created_at || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
            className="flex items-center px-4 py-3 text-sm font-medium text-blue-100 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:text-white"
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
            className="flex items-center px-4 py-3 text-sm font-medium text-white bg-blue-700 rounded-lg transition-all duration-200 hover:bg-blue-600 shadow-md"
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
              <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="verified">Verified</option>
              </select>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
              >
                <FaDownload className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Search Bar */}
          <div className="mb-6 relative">
            <FaSearch className="absolute left-4 top-3 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search by supplier, agent, ID, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-gray-600 text-sm">Successful</p>
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.status === 'success').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {transactions.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-gray-600 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.status === 'failed').length}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading transactions...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={fetchTransactions}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <FaExchangeAlt className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-600">No transactions found</p>
                {searchTerm && (
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Agent</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount (KES)</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Distance</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">M-Pesa Ref</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr 
                        key={transaction.id} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{transaction.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{transaction.supplier_name || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{transaction.agent_email || "N/A"}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatAmount(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className={`${(transaction.distance_meters || 0) <= 200 ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}`}>
                            {transaction.distance_meters ? parseFloat(transaction.distance_meters).toFixed(1) + 'm' : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {transaction.mpesa_receipt_number || transaction.mpesa_checkout_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(transaction.created_at)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                            <span className="mr-1">{getStatusIcon(transaction.status)}</span>
                            {transaction.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50" 
                              title="View Details"
                              onClick={() => alert(`Transaction #${transaction.id}\n\nSupplier: ${transaction.supplier_name}\nAgent: ${transaction.agent_email}\nAmount: ${formatAmount(transaction.amount)}\nStatus: ${transaction.status}\nDate: ${formatDate(transaction.created_at)}\n\nM-Pesa Ref: ${transaction.mpesa_receipt_number || 'N/A'}\nDistance: ${transaction.distance_meters ? transaction.distance_meters.toFixed(1) + 'm' : 'N/A'}`)}
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredTransactions.length} of {pagination.total} transactions
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.total_pages}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Transactions;

