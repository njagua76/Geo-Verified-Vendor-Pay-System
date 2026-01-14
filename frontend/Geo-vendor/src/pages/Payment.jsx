import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DollarSign, ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import { suppliersAPI } from "../api/apiClient";
import "../styles/Payment.css";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");

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

  const validatePhoneNumber = (phone) => {
    // Kenyan phone number validation
    const phonePattern = /^(\+254|0)[17]\d{8}$/;
    return phonePattern.test(phone);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError("");
    }
  };

  const handlePayment = async () => {
    // Validate phone number
    if (!phoneNumber) {
      setPhoneError("Please enter your phone number");
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError("Invalid Kenyan phone number. Use format: +254XXXXXXXXX or 0XXXXXXXXX");
      return;
    }

    if (!amount || amount <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    setPaymentStatus("processing");
    try {
      // Call M-Pesa payment API with field agent's phone number
      // STK push will be sent to the field agent's phone
      const response = await suppliersAPI.initiatePayment({
        supplier_id: supplierId,
        amount: parseFloat(amount),
        phone_number: phoneNumber,
        description: `Payment to ${supplier.name}`,
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
            <div className="phone-input">
              <label htmlFor="phone">
                <Phone size={18} />
                Your Phone Number (for STK Push)
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="+254XXXXXXXXX or 0XXXXXXXXX"
                disabled={paymentStatus === "processing"}
              />
              <small>Enter your phone number to receive M-Pesa STK push</small>
            </div>

            {phoneError && (
              <div className="error-message">
                <p>{phoneError}</p>
              </div>
            )}

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
