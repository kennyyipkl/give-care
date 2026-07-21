import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

export default function LoginPage({ onSwitchToRegister, onSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
      onSuccess();
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.response?.data?.message || "Login failed. Please try again.";

      // Handle pending approval specifically
      if (status === 403 && detail?.toLowerCase().includes("pending approval")) {
        setError("⏳ Your account is pending approval. Please wait for an admin to approve your account.");
      } else if (status === 401) {
        setError("Invalid username or password.");
      } else {
        setError(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>❤️</div>
          <h1>Welcome Back</h1>
          <p style={{ color: "var(--color-text-light)" }}>
            Sign in to upload photos and support our cause
          </p>
        </div>

        {error && (
          <div className="auth-error" style={error.includes("pending") ? { background: "#fff8e1", color: "#f57f17", border: "1px solid rgba(245,127,23,0.2)" } : {}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <button className="btn-link" onClick={onSwitchToRegister}>
            Create one here
          </button>
        </div>
      </div>
    </div>
  );
}