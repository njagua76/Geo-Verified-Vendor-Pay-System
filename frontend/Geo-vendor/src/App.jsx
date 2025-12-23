import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Agents from "./pages/admin/Agents";
import Vendors from "./pages/admin/Vendors";
import Payments from "./pages/admin/Payments";
import Settings from "./pages/admin/Settings";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/" element={<Login />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/agents" element={<Agents />} />
        <Route path="/admin/vendors" element={<Vendors />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/settings" element={<Settings />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
