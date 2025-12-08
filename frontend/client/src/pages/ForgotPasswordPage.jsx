import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../components/global/Input";
import Button from "../components/global/Button";
import "./auth/AuthPage.css";

export default function ForgotPasswordPage() {
  const [utorid, setUtorid] = useState("");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setToken(null);
    setError("");

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/resets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utorid }),  
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setToken(data.resetToken);

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-icon">🔑</span>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">Enter your UTORid to receive a reset link</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <Input
            label="UTORid"
            placeholder="Enter your UTORid"
            value={utorid}
            onChange={setUtorid}
            required
          />

          {error && (
            <div className="alert alert-error" style={{ marginTop: "1rem" }}>
              {error}
            </div>
          )}

          {token && (
            <div className="alert alert-success" style={{ marginTop: "1rem" }}>
              <p><strong>Reset link generated!</strong></p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                Click the link below or copy it:
              </p>
              <a
                href={`/reset/${token}`}
                style={{
                  color: "inherit",
                  textDecoration: "underline",
                  wordBreak: "break-all",
                  display: "block",
                  marginTop: "0.5rem"
                }}
              >
                {`${window.location.origin}/reset/${token}`}
              </a>
            </div>
          )}

          <Button 
            onClick={submit} 
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: "1rem" }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="auth-link">
          <Link to="/">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
