import React from "react";
import Sidebar from "../../components/Sidebar";

function Vendors() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <h1>Vendors</h1>
        <p>List of all registered vendors will appear here.</p>
      </div>
    </div>
  );
}

export default Vendors;
