import React from 'react';
import { Header } from '../components/layout/Header';
import { PaymentVerification } from '../components/payment/PaymentVerification';

export default function Verify() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
      <Header />
      <PaymentVerification />
    </div>
  );
}
