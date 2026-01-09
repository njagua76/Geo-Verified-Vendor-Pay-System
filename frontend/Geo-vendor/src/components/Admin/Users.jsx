import React from "react";
import "./Dashboard.css";

const fakeUsers = [
  { id: 1, email: "admin@example.com", role: "Admin" },
  { id: 2, email: "agent@example.com", role: "Field Agent" },
];

const Users = () => {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="brand"><h2>GeoVendor</h2></div>
        <div className="nav-links">
          <a href="/admin/dashboard">Dashboard</a>
          <a href="/admin/users" className="active">Users</a>
          <a href="/admin/suppliers">Suppliers</a>
          <a href="/admin/transactions">Transactions</a>
        </div>
      </div>

      <div className="main-content">
        <div className="top-navbar">
          <div>Admin Panel</div>
          <div className="user-info"></div>
        </div>

        <div className="content">
          <h1>Users</h1>
          {fakeUsers.length === 0 ? <p>No users found</p> : (
            <table>
              <thead>
                <tr><th>ID</th><th>Email</th><th>Role</th></tr>
              </thead>
              <tbody>
                {fakeUsers.map(u => <tr key={u.id}><td>{u.id}</td><td>{u.email}</td><td>{u.role}</td></tr>)}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
