import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaPlus, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { suppliersAPI } from "../../api/apiClient";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      const supplierData = response.data.suppliers || response.data || [];
      setSuppliers(supplierData);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm) ||
    supplier.supplier_id?.toLowerCase().includes(searchTerm) ||
    supplier.address?.toLowerCase().includes(searchTerm)
  );

  const viewOnMap = (supplier) => {
    setSelectedSupplier(supplier);
    setShowMap(true);
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
            className="flex items-center px-4 py-3 text-sm font-medium text-white bg-blue-700 rounded-lg transition-all duration-200 hover:bg-blue-600 shadow-md"
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
              <h1 className="text-xl font-semibold text-gray-900">Suppliers</h1>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md">
              <FaPlus className="w-4 h-4" />
              Add Supplier
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers by name, ID, or address..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Map Modal */}
          {showMap && selectedSupplier && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedSupplier.name} Location
                  </h3>
                  <button
                    onClick={() => setShowMap(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    title="Supplier Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedSupplier.longitude - 0.01},${selectedSupplier.latitude - 0.01},${selectedSupplier.longitude + 0.01},${selectedSupplier.latitude + 0.01}&layer=mapnik&marker=${selectedSupplier.latitude},${selectedSupplier.longitude}`}
                    style={{ border: 0 }}
                  ></iframe>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p><strong>Address:</strong> {selectedSupplier.address}</p>
                  <p><strong>Coordinates:</strong> {selectedSupplier.latitude.toFixed(6)}, {selectedSupplier.longitude.toFixed(6)}</p>
                  <p><strong>Contact:</strong> {selectedSupplier.contact_person} - {selectedSupplier.mpesa_phone_number}</p>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Supplier Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        Loading suppliers...
                      </td>
                    </tr>
                  ) : filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No suppliers found
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((supplier, index) => (
                      <tr 
                        key={supplier.id || index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.supplier_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.address || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.mpesa_phone_number}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => viewOnMap(supplier)}
                              className="text-green-600 hover:text-green-900 transition-colors" 
                              title="View on Map"
                            >
                              <FaMapMarkerAlt className="w-4 h-4" />
                            </button>
                            <button className="text-blue-600 hover:text-blue-900 transition-colors" title="View">
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button className="text-amber-600 hover:text-amber-900 transition-colors" title="Edit">
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 transition-colors" title="Delete">
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">Showing {filteredSuppliers.length} of {suppliers.length} suppliers</p>
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

export default Suppliers;
