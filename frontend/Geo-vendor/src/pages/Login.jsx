import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../Login.css";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState(""); // new state for role
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!role) {
      setError("Please select a role");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/login", { email, password, role });
      localStorage.setItem("token", res.data.token);

      // redirect based on role returned from backend
      if (res.data.role === "Administrator") {
        navigate("/dashboard");
      } else {
        navigate("/verify");
      }
    } catch (err) {
      setError("Invalid email, password, or role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-card">
        <h2>Geo-Verified Vendor Pay</h2>

        {error && <p className="error">{error}</p>}

        {/* Role selection dropdown */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">Select Role</option>
          <option value="Administrator">Administrator</option>
          <option value="Field Agent">Field Agent</option>
        </select>

        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
