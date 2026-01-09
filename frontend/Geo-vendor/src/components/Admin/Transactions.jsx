import React from "react";
import "./Dashboard.css";

const fakeTransactions = [
  { id: 101, supplier: "M-Pesa Shop Westlands", amount: 1200, date: "2026-01-01", status: "Completed" },
  { id: 102, supplier: "QuickPay Distributors", amount: 450, date: "2026-01-02", status: "Pending" },
  { id: 103, supplier: "CBD Express Merchant", amount: 3200, date: "2026-01-03", status: "Completed" },
  { id: 104, supplier: "Pipeline Vendor Point", amount: 1400, date: "2026-01-05", status: "Failed" },
];

const Transactions = () => {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="brand"><h2>GeoVendor</h2></div>
        <div className="nav-links">
          <a href="/admin/dashboard">Dashboard</a>
          <a href="/admin/users">Users</a>
          <a href="/admin/suppliers">Suppliers</a>
          <a href="/admin/transactions" className="active">Transactions</a>
        </div>
      </div>

      <div className="main-content">
        <div className="top-navbar">
          <div>Admin Panel</div>
        </div>

        <div className="content">
          <h1>Transactions</h1>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier</th>
                <th>Amount (KES)</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {fakeTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.supplier}</td>
                  <td>{t.amount}</td>
                  <td>{t.date}</td>
                  <td style={{
                    color:
                      t.status === "Completed"
                        ? "green"
                        : t.status === "Pending"
                        ? "orange"
                        : "red"
                  }}>
                    {t.status}
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

export default Transactions;
