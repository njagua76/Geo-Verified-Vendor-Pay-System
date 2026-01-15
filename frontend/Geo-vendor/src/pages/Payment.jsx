import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DollarSign, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { suppliersAPI } from "../api/apiClient";
import "../styles/Payment.css";

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
    <div className="payment-container">
      <button onClick={() => navigate(-1)} className="btn-back">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="payment-card">
        <h1>
          <DollarSign size={32} />
          Payment for {supplier?.name}
        </h1>

        {supplier && (
          <div className="supplier-info">
            <h3>Supplier Details</h3>
            <p><strong>Name:</strong> {supplier.name}</p>
            <p><strong>Location:</strong> {supplier.address || supplier.location || "N/A"}</p>
            <p><strong>Contact:</strong> {supplier.contact_person || "N/A"}</p>
            <p><strong>Phone:</strong> {supplier.mpesa_phone_number}</p>
          </div>
        )}

        {paymentStatus === "success" ? (
          <div className="success-container">
            <CheckCircle2 size={48} className="success-icon" />
            <h2>Payment Successful!</h2>
            <p>Payment has been sent to {supplier?.name} via M-Pesa B2C.</p>
            <p className="redirect-text">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="payment-info">
              <AlertCircle size={18} />
              <p>Payment will be sent directly to the supplier's M-Pesa number: <strong>{supplier?.mpesa_phone_number}</strong></p>
            </div>

            <div className="amount-input">
              <label htmlFor="amount">Amount (KES):</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={paymentStatus === "processing"}
                min="1"
                step="0.01"
              />
            </div>

            {errorMessage && (
              <div className="error-message">
                <p>{errorMessage}</p>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={paymentStatus === "processing" || !amount}
              className="btn-payment"
            >
              {paymentStatus === "processing" ? "Processing Payment..." : "Send Payment to Supplier"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Payment;
