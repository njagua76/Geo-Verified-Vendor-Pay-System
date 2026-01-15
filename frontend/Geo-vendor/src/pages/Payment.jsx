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
  }, [supplierId]);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      const response = await suppliersAPI.initiatePayment({
        supplier_id: supplierId,
        amount: parseFloat(amount),
        description: `Payment to ${supplier.name}`,
      });

      if (response.status === 200 || response.status === 201) {
        setPaymentStatus("success");
        setTimeout(() => {
          navigate("/verify");
        }, 2000);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage(err.response?.data?.message || "Payment failed. Please try again.");
      setPaymentStatus("error");
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to verification page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8" />
              <h1 className="text-3xl font-bold">M-Pesa Payment</h1>
            </div>
            <p className="text-green-50">Complete your secure payment</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Supplier Information */}
            {supplier && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                    <Building2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Supplier Name</p>
                      <p className="text-sm font-semibold text-gray-900">{supplier.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                    <User className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Contact Person</p>
                      <p className="text-sm font-semibold text-gray-900">{supplier.contact_person || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                      <p className="text-sm font-semibold text-gray-900">{supplier.mpesa_phone_number || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Location</p>
                      <p className="text-sm font-semibold text-gray-900">{supplier.address || supplier.location || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Amount */}
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-3">
                Payment Amount (KES)
              </label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-600" />
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Enter amount"
                  disabled={paymentStatus === "processing"}
                  min="1"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 focus:bg-white"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Enter the payment amount in Kenyan Shillings</p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-900">{errorMessage}</p>
              </div>
            )}

            {/* Info Message */}
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">M-Pesa Payment</p>
                <p className="text-xs text-green-700 mt-1">You will receive an STK push on your registered phone number to complete the payment.</p>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={paymentStatus === "processing" || !amount}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg hover:from-green-700 hover:to-green-600 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {paymentStatus === "processing" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Pay with M-Pesa
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
