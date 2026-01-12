import React, { useState } from "react";
import { FaEye, FaDownload, FaFilter, FaSearch } from "react-icons/fa";

const fakeTransactions = [
  { id: 101, supplier: "M-Pesa Shop Westlands", agent: "John Doe", amount: 1200, distance: 15.3, date: "2026-01-01", status: "Completed" },
  { id: 102, supplier: "QuickPay Distributors", agent: "Jane Smith", amount: 450, distance: 8.5, date: "2026-01-02", status: "Pending" },
  { id: 103, supplier: "CBD Express Merchant", agent: "Mike Johnson", amount: 3200, distance: 12.1, date: "2026-01-03", status: "Completed" },
  { id: 104, supplier: "Pipeline Vendor Point", agent: "Sarah Williams", amount: 1400, distance: 25.8, date: "2026-01-05", status: "Failed" },
  { id: 105, supplier: "Kasarani Vendor Hub", agent: "Tom Brown", amount: 2100, distance: 5.2, date: "2026-01-06", status: "Completed" },
];

const Transactions = () => {
  const [transactions] = useState(fakeTransactions);
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status) => {
    switch(status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Completed":
        return "✓";
      case "Pending":
        return "⏳";
      case "Failed":
        return "✕";
      default:
        return "•";
    }
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
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <FaFilter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md">
                <FaDownload className="w-4 h-4" />
                Export
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
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount (KES)</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Distance (m)</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr 
                      key={transaction.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{transaction.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.supplier}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.agent}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">KES {transaction.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={`${transaction.distance <= 20 ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}`}>
                          {transaction.distance}m
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.date}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                          <span className="mr-1">{getStatusIcon(transaction.status)}</span>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center">
                          <button className="text-blue-600 hover:text-blue-900 transition-colors" title="View Details">
                            <FaEye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">Showing 1 to {transactions.length} of {transactions.length} transactions</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Previous
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Transactions;
