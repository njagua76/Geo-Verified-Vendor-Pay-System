// src/components/FieldAgent/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ userEmail }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="navbar">
      <div className="nav-links">
        <Link to="/agent/dashboard">Dashboard</Link>
        <Link to="/agent/verify">Verify</Link>
      </div>

      <div className="user-info">
        <span>{userEmail}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
