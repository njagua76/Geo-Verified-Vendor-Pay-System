import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../Login.css";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState(""); // Role state
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
        <h2>Welcome Back</h2>
        <p className="sub-title">Sign in to access your account</p>

        {error && <p className="error">{error}</p>}

        {/* Role selection buttons */}
        <div className="role-selection">
          <button
            type="button"
            className={`role-btn ${role === "Field Agent" ? "active" : ""}`}
            onClick={() => setRole("Field Agent")}
          >
            Field Agent
          </button>
          <button
            type="button"
            className={`role-btn ${role === "Administrator" ? "active" : ""}`}
            onClick={() => setRole("Administrator")}
          >
            Administrator
          </button>
        </div>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default Login;
