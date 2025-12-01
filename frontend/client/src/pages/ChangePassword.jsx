import { useState } from "react";

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
    <div
      style={{
        maxWidth: 400,
        margin: "80px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 10,
      }}
    >
      <h2 style={{ textAlign: "center" }}>Change Password</h2>

      <form onSubmit={handleSubmit}>
        <label>Current Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 15 }}
        />

        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 15 }}
        />

        <label>Confirm New Password</label>
        <input
          type="password"
          value={confirmNew}
          onChange={(e) => setConfirmNew(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 15 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 0",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>

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

      {/* Password rules */}
      {showRules && (
        <p style={{ marginTop: 10, color: "#666", fontSize: "14px" }}>
          Password requirements:
          <br />• 8-20 characters
          <br />• At least 1 uppercase letter
          <br />• At least 1 lowercase letter
          <br />• At least 1 number
          <br />• At least 1 special character (@$!%*?&)
        </p>
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
