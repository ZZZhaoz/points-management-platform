import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../components/global/Input";
import Button from "../components/global/Button";
import "./auth/AuthPage.css";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // check passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/resets/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),  
        }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        setErrorMessage(text);
        return;
      }

      if (!res.ok) {
        if (res.status === 400) {
          setErrorMessage(
            "Invalid password format. Password must:\n" +
              "• Be 8-20 characters\n" +
              "• Include 1 uppercase letter\n" +
              "• Include 1 lowercase letter\n" +
              "• Include 1 number\n" +
              "• Include 1 special character (@$!%*?&)"
          );
          return;
        }
        if (res.status === 404) {
          setErrorMessage("Reset token not found.");
          return;
        }
        if (res.status === 410) {
          setErrorMessage("Reset token has expired.");
          return;
        }

        setErrorMessage("Reset failed.");
        return;
      }

      setSuccessMessage("Password reset successfully! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-icon">🔐</span>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your new password below</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <Input
            label="New Password"
            type="password"
            placeholder="Enter a new password"
            value={password}
            onChange={setPassword}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
          />

          {/* Password rules */}
          <div style={{ 
            marginTop: "0.5rem", 
            padding: "1rem",
            background: "var(--gray-100)",
            borderRadius: "var(--radius-lg)",
            fontSize: "0.875rem",
            color: "var(--text-secondary)"
          }}>
            <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
              Password requirements:
            </strong>
            <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: "1.8" }}>
              <li>8-20 characters</li>
              <li>At least 1 uppercase letter</li>
              <li>At least 1 lowercase letter</li>
              <li>At least 1 number</li>
              <li>At least 1 special character (@$!%*?&)</li>
            </ul>
          </div>

          {errorMessage && (
            <div className="alert alert-error" style={{ marginTop: "1rem", whiteSpace: "pre-line" }}>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" style={{ marginTop: "1rem" }}>
              {successMessage}
            </div>
          )}

          <Button 
            onClick={submit} 
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: "1rem" }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
