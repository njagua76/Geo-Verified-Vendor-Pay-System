import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">Admin</h2>

      <ul>
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/agents">Agents</Link></li>
        <li><Link to="/admin/vendors">Vendors</Link></li>
        <li><Link to="/admin/payments">Payments</Link></li>
        <li><Link to="/admin/settings">Settings</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
