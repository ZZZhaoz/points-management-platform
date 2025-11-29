import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../components/global/Input";
import Button from "../components/global/Button";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const submit = async () => {
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
    <div style={{ padding: 20 }}>
      <h1>Reset Password</h1>

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
      <p style={{ marginTop: 10, color: "#666", fontSize: "14px" }}>
        Password requirements:
        <br />• 8-20 characters
        <br />• At least 1 uppercase letter
        <br />• At least 1 lowercase letter
        <br />• At least 1 number
        <br />• At least 1 special character (@$!%*?&)
      </p>

      <Button onClick={submit} disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </Button>

      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            marginTop: 12,
            color: "red",
            whiteSpace: "pre-line",
            fontSize: "14px",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div
          style={{
            marginTop: 12,
            color: "green",
            whiteSpace: "pre-line",
            fontSize: "14px",
          }}
        >
          {successMessage}
        </div>
      )}
    </div>
  );
}
