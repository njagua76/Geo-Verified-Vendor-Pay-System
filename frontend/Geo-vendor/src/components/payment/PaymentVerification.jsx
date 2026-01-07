import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import axios from 'axios';

export const PaymentVerification = () => {
  const [location, setLocation] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const [message, setMessage] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  useEffect(() => {
    fetchSuppliers();
    fetchRecentTransactions();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/api/suppliers');
      setSuppliers(response.data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      const txns = response.data || [];
      setRecentTransactions(txns.slice(0, 3));
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const getLocation = () => {
    setStatus('verifying');
    setMessage('Getting your location...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          checkProximity(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setStatus('error');
          setMessage('Unable to access your location. Please enable location services.');
        }
      );
    } else {
      setStatus('error');
      setMessage('Geolocation is not supported by your browser.');
    }
  };

  const checkProximity = (userLat, userLng) => {
    if (!selectedSupplier) {
      setStatus('error');
      setMessage('Please select a supplier first');
      return;
    }

    const supplier = suppliers.find((s) => s.id === parseInt(selectedSupplier));
    if (!supplier) {
      setStatus('error');
      setMessage('Supplier not found');
      return;
    }

    // Calculate distance using Haversine formula (simplified)
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(supplier.latitude - userLat);
    const dLng = toRad(supplier.longitude - userLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLat)) *
        Math.cos(toRad(supplier.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Convert to meters

    if (distance <= 100) {
      setStatus('success');
      setMessage(`✓ Location verified! You are ${Math.round(distance)}m from the supplier.`);
    } else {
      setStatus('error');
      setMessage(`✗ You are ${Math.round(distance)}m away. You must be within 100m of the supplier.`);
    }
  };

  const handlePayment = async () => {
    if (!amount || !selectedSupplier || status !== 'success') {
      setMessage('Please complete all steps first');
      return;
    }

    // Simulate payment processing
    setStatus('verifying');
    setMessage('Processing payment...');

    try {
      await axios.post('/api/verify', {
        supplier_id: selectedSupplier,
        amount: parseFloat(amount),
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setStatus('success');
      setMessage(`✓ Payment of KES ${amount} sent successfully!`);
      setAmount('');
      setSelectedSupplier('');
      setLocation(null);
      
      // Refresh transactions
      fetchRecentTransactions();
      
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white pt-8 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-slide-in">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            Payment Verification
          </h1>
          <p className="text-gray-600 mt-2">
            Verify your location and process payments with GPS confirmation
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-slide-in space-y-6">
          {/* Step 1: Select Supplier */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                1
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Select Supplier</h2>
            </div>

            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              disabled={loadingSuppliers}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">
                {loadingSuppliers ? 'Loading suppliers...' : 'Choose a supplier...'}
              </option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            {selectedSupplier && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-sm text-blue-900">
                  {suppliers.find((s) => s.id === parseInt(selectedSupplier))?.name}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Verify Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                2
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Verify Your Location</h2>
            </div>

            <button
              onClick={getLocation}
              disabled={!selectedSupplier || status === 'verifying'}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'verifying' ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Get My Location
                </>
              )}
            </button>

            {location && (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                <p>Latitude: {location.latitude.toFixed(4)}</p>
                <p>Longitude: {location.longitude.toFixed(4)}</p>
              </div>
            )}
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : status === 'verifying'
                  ? 'bg-blue-50 border-blue-200'
                  : ''
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : status === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : status === 'verifying' ? (
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
              ) : null}
              <p
                className={
                  status === 'success'
                    ? 'text-green-800'
                    : status === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }
              >
                {message}
              </p>
            </div>
          )}

          {/* Step 3: Enter Amount */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                  3
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Enter Amount</h2>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  KES
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handlePayment}
                disabled={!amount || status === 'verifying'}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'verifying' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Send Payment'
                )}
              </button>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.supplier_name || 'N/A'}</p>
                      <p className="text-xs text-gray-600">{new Date(transaction.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">KES {transaction.amount.toLocaleString()}</p>
                      <span
                        className={`text-xs font-medium ${
                          transaction.status === 'success'
                            ? 'text-green-600'
                            : transaction.status === 'pending'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No recent transactions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification;
