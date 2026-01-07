import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers, FaStore, FaExchangeAlt } from "react-icons/fa";
import "./Dashboard.css";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [data, setData] = useState({ total_users: 0, total_suppliers: 0, total_transactions: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data.data);
      } catch (err) {
        console.error(err);
        setData({ total_users: 0, total_suppliers: 0, total_transactions: 0 });
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="brand"><h2>GeoVendor</h2></div>
        <div className="nav-links">
          <a href="/admin/dashboard">Dashboard</a>
          <a href="/admin/users">Users</a>
          <a href="/admin/suppliers">Suppliers</a>
          <a href="/admin/transactions">Transactions</a>
        </div>
      </div>

      <div className="main-content">
        <div className="top-navbar">
          <div>Admin Panel</div>
          <div className="user-info">
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="content">
          <h1>Dashboard</h1>
          <div className="stats-cards">
            <div className="card" style={{ background: "#005eff" }}>
              <h3><FaUsers /></h3>
              <p>Total Users: {data.total_users}</p>
            </div>
            <div className="card" style={{ background: "#28a745" }}>
              <h3><FaStore /></h3>
              <p>Total Suppliers: {data.total_suppliers}</p>
            </div>
            <div className="card" style={{ background: "#ffc107" }}>
              <h3><FaExchangeAlt /></h3>
              <p>Total Transactions: {data.total_transactions}</p>
            </div>
          </div>

          <div className="chart-placeholder">
            <p>Charts coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
