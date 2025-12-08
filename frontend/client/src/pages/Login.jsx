import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/global/Input";
import Button from "../components/global/Button";
import { useAuth } from "../contexts/AuthContext";
import "./auth/AuthPage.css";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  
  const [utorid, setUtorid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    try {
      const err = await login(utorid, password);

      if (err) {
        setError(err);
        return;
      }

      nav("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-icon">🎁</span>
          <h1 className="auth-title">Welcome to LoyaltyHub!</h1>
          <p className="auth-subtitle">Sign in to access your account</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <Input
            label="UTORid"
            placeholder="Enter your UTORid"
            value={utorid}
            onChange={setUtorid}
            required
            error={error && !utorid ? "UTORid is required" : ""}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            required
            error={error && !password ? "Password is required" : ""}
          />

          {error && (
            <div className="alert alert-error" style={{ marginTop: "1rem" }}>
              {error}
            </div>
          )}

          <Button
            onClick={submit}
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", marginTop: "1rem" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="auth-link">
          <Link to="/forgot-password">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
