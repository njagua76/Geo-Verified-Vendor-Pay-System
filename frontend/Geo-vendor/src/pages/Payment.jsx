import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DollarSign, ArrowLeft, CheckCircle2, AlertCircle, MapPin, Phone, User, Building2, CreditCard } from "lucide-react";
import { suppliersAPI } from "../api/apiClient";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const supplierId = searchParams.get("supplier");
  const userLat = searchParams.get("lat");
  const userLon = searchParams.get("lon");

  const fetchSupplier = useCallback(async () => {
    try {
      const response = await suppliersAPI.getById(supplierId);
      setSupplier(response.data.supplier || response.data);
    } catch (err) {
      console.error("Error fetching supplier:", err);
      setErrorMessage("Failed to load supplier information");
    }
  }, [supplierId]);

  useEffect(() => {
    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId, fetchSupplier]);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    if (!userLat || !userLon) {
      setErrorMessage("Location coordinates missing. Please verify location first.");
      return;
    }

    setPaymentStatus("processing");
    setErrorMessage("");
    
    try {
      const response = await suppliersAPI.verifyLocationAndPay({
        user_lat: parseFloat(userLat),
        user_lon: parseFloat(userLon),
        supplier_id: parseInt(supplierId),
        amount: parseFloat(amount)
      });

      if (response.status === 200) {
        setPaymentStatus("success");
        setTimeout(() => {
          navigate("/field-agent/dashboard");
        }, 3000);
      }
    } catch (err) {
      console.error("Payment error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Payment failed. Please try again.";
      setErrorMessage(errorMsg);
      setPaymentStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        {/* Main Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Payment Processing</h1>
                <p className="text-blue-100 mt-1">Secure M-Pesa B2C Transaction</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {supplier && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" />
                  Supplier Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <User size={20} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Supplier Name</p>
                      <p className="font-semibold text-gray-900">{supplier.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Phone size={20} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">M-Pesa Number</p>
                      <p className="font-semibold text-gray-900">{supplier.mpesa_phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <MapPin size={20} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{supplier.address || supplier.location || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <User size={20} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-semibold text-gray-900">{supplier.contact_person || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === "success" ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <CheckCircle2 size={48} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
                <p className="text-gray-600 mb-2">
                  Payment has been sent to {supplier?.name} via M-Pesa B2C.
                </p>
                <p className="text-sm text-gray-500">Redirecting to dashboard in 3 seconds...</p>
              </div>
            ) : (
              <>
                {/* Payment Info Alert */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                  <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-900">
                      <strong>Direct Payment:</strong> Funds will be sent directly to the supplier's M-Pesa number{" "}
                      <span className="font-semibold">{supplier?.mpesa_phone_number}</span>
                    </p>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CreditCard size={20} className="text-gray-400" />
                    </div>
                    <input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount in KES"
                      disabled={paymentStatus === "processing"}
                      min="1"
                      step="0.01"
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Minimum amount: KES 1.00</p>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handlePayment}
                  disabled={paymentStatus === "processing" || !amount || parseFloat(amount) <= 0}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {paymentStatus === "processing" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <DollarSign size={20} />
                      Send Payment to Supplier
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
