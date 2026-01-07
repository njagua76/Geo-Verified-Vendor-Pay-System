import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./Dashboard.css"; // reuse Dashboard styles

const FieldAgentProfile = () => {
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.profile);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [token]);

  if (!profile) return <div className="content">Loading Profile...</div>;

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="main-content">
        <div className="top-navbar">
          <h2>Field Agent Profile</h2>
        </div>

        <div className="content">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>User ID:</strong> {profile.user_id}</p>
        </div>
      </div>
    </div>
  );
};

export default FieldAgentProfile;
