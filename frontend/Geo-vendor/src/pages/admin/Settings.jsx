import React from "react";
import Sidebar from "../../components/Sidebar";

function Settings() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <h1>Settings</h1>
        <p>Admin configuration and system settings will appear here.</p>
      </div>
    </div>
  );
}

export default Settings;
