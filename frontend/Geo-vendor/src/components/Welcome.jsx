import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

const Welcome = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await auth.login(email, password);

      if (!res.success) {
        setError(res.message);
        return;
      }

      // Safely parse user from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const role = user?.role_name?.toLowerCase();

      if (!role) {
        setError("Access denied: Unknown user role.");
        return;
      }

      // Redirect based on role
      if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (role === "field agent") navigate("/agent-dashboard", { replace: true });
      else setError("Access denied: Unknown user role.");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`welcome-wrapper ${fadeIn ? "fade-in" : ""}`}>
      <div className="welcome-message">
        <h3>Welcome to GeoVendor! 🔐</h3>
        <p>Please login to continue.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        {error && <div className="error">{error}</div>}

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="•••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Welcome;
