// src/components/FieldAgent/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./Dashboard.css";

const FieldAgentDashboard = () => {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/agent/verify`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAgentData(res.data);
      } catch (err) {
        console.error("Error fetching Field Agent data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, [token]);

  if (loading) return <div className="content">Loading Field Agent Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <Navbar userEmail={agentData?.user?.email} />

      <div className="main-content">
        <div className="top-navbar">
          <h2>Field Agent Dashboard</h2>
        </div>

        <div className="content">
          <h1>Verification Area</h1>
          <p>Pending verifications: {agentData?.pending_verifications}</p>

          <div className="map-placeholder">
            <h3>Map / GPS tracking will appear here</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldAgentDashboard;
