import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DollarSign, ArrowLeft, CheckCircle2 } from "lucide-react";
import { suppliersAPI } from "../api/apiClient";
import "../styles/Payment.css";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const supplierId = searchParams.get("supplier");

  useEffect(() => {
    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      const response = await suppliersAPI.getById(supplierId);
      setSupplier(response.data.supplier || response.data);
    } catch (err) {
      console.error("Error fetching supplier:", err);
      setErrorMessage("Failed to load supplier information");
    }
  };

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    setPaymentStatus("processing");
    try {
      // Call M-Pesa payment API
      const response = await suppliersAPI.initiatePayment({
        supplier_id: supplierId,
        amount: parseFloat(amount),
        phone_number: supplier.mpesa_phone_number,
      });

      if (response.status === 200 || response.status === 201) {
        setPaymentStatus("success");
        setTimeout(() => {
          navigate("/field-agent/dashboard");
        }, 2000);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage(err.response?.data?.message || "Payment failed. Please try again.");
      setPaymentStatus("error");
    }
  };

  return (
    <div className="payment-container">
      <button
        onClick={() => navigate(-1)}
        className="btn-back"
      >
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
            <p>
              <strong>Name:</strong> {supplier.name}
            </p>
            <p>
              <strong>Location:</strong> {supplier.address || supplier.location || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {supplier.contact_person || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {supplier.mpesa_phone_number}
            </p>
          </div>
        )}

        {paymentStatus === "success" ? (
          <div className="success-container">
            <CheckCircle2 size={48} className="success-icon" />
            <h2>Payment Successful!</h2>
            <p>Your payment has been processed successfully.</p>
            <p className="redirect-text">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
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
              {paymentStatus === "processing"
                ? "Processing..."
                : "Pay with M-Pesa"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Payment;
