import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Admin/Dashboard";
import Users from "./components/Admin/Users";
import Suppliers from "./components/Admin/Suppliers";
import Transactions from "./components/Admin/Transactions";
import Welcome from "./components/Welcome";   // << Correct import
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* PUBLIC ROUTE */}
      <Route path="/" element={<Welcome />} />

      {/* PROTECTED ADMIN ROUTES */}
      {user ? (
        <>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/suppliers" element={<Suppliers />} />
          <Route path="/admin/transactions" element={<Transactions />} />
        </>
      ) : (
        <>
          {/* Redirect all admin routes to login if not logged in */}
          <Route path="/admin/*" element={<Navigate to="/" replace />} />
        </>
      )}

      {/* CATCH ALL → send to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
