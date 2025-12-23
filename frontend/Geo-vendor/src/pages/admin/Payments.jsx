import React from "react";
import Sidebar from "../../components/Sidebar";

function Payments() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <h1>Payments</h1>
        <p>Payment history and transactions will appear here.</p>
      </div>
    </div>
  );
}

export default Payments;
