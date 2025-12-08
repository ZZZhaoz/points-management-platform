import { useState } from "react";
import Button from "../components/global/Button";
import Input from "../components/global/Input";
import "./ChangePassword.css";

export default function ChangePasswordPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showRules, setShowRules] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setShowRules(false);

    if (newPassword !== confirmNew) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/users/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old: oldPassword,
          new: newPassword,
        }),
      });

      if (res.status === 200) {
        setSuccessMessage("Password updated successfully.");
        setOldPassword("");
        setNewPassword("");
        setConfirmNew("");
      } else if (res.status === 403) {
        setErrorMessage("Incorrect current password.");
      } else if (res.status === 400) {
        setErrorMessage("Invalid password format.");
        setShowRules(true); 
      } else {
        setErrorMessage("Something went wrong.");
      }
    } catch (err) {
      setErrorMessage("Network error.");
    }

    setLoading(false);
  };

  return (
    <div className="change-password-page">
      <div className="change-password-header">
        <h1 className="change-password-title">Change Password 🔑</h1>
        <p className="change-password-subtitle">Update your account password</p>
      </div>

      <div className="change-password-card">
        <form onSubmit={handleSubmit} className="change-password-form">
          <Input
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={setOldPassword}
            placeholder="Enter your current password"
            required
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Enter your new password"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmNew}
            onChange={setConfirmNew}
            placeholder="Confirm your new password"
            required
          />

          {/* Error message */}
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          {/* Password rules */}
          {showRules && (
            <div className="password-rules">
              <div className="password-rules-title">Password requirements:</div>
              <ul className="password-rules-list">
                <li>8-20 characters</li>
                <li>At least 1 uppercase letter</li>
                <li>At least 1 lowercase letter</li>
                <li>At least 1 number</li>
                <li>At least 1 special character (@$!%*?&)</li>
              </ul>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <div className="change-password-actions">
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
            >
              {loading ? "Updating..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
