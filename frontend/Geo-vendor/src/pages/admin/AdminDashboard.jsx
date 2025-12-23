import React from "react";
import Sidebar from "../../components/Sidebar";

function AdminDashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <h1>Admin Dashboard</h1>

        <div className="cards">
          <div className="card">
            <h3>Total Agents</h3>
            <p>12</p>
          </div>

          <div className="card">
            <h3>Total Vendors</h3>
            <p>30</p>
          </div>

          <div className="card">
            <h3>Pending Verifications</h3>
            <p>7</p>
          </div>

          <div className="card">
            <h3>Successful Payments</h3>
            <p>24</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
