import React from "react";
import "./Dashboard.css";

const fakeSuppliers = [
  { id: 1, name: "M-Pesa Shop Westlands", phone: "0712345678", status: "Active" },
  { id: 2, name: "QuickPay Distributors", phone: "0798765432", status: "Active" },
  { id: 3, name: "Kasarani Vendor Hub", phone: "0744112233", status: "Inactive" },
  { id: 4, name: "CBD Express Merchant", phone: "0700112233", status: "Active" },
  { id: 5, name: "Pipeline Vendor Point", phone: "0722334455", status: "Active" },
];

const Suppliers = () => {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="brand"><h2>GeoVendor</h2></div>
        <div className="nav-links">
          <a href="/admin/dashboard">Dashboard</a>
          <a href="/admin/users">Users</a>
          <a href="/admin/suppliers" className="active">Suppliers</a>
          <a href="/admin/transactions">Transactions</a>
        </div>
      </div>

      <div className="main-content">
        <div className="top-navbar">
          <div>Admin Panel</div>
        </div>

        <div className="content">
          <h1>Suppliers</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fakeSuppliers.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.phone}</td>
                  <td style={{ color: s.status === "Active" ? "green" : "red" }}>
                    {s.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
