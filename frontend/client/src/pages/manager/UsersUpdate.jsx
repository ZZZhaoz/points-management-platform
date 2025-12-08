import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditPage.css";

export default function UsersUpdate() {
  const { userId } = useParams();    
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // For editable fields
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [verified, setVerified] = useState(false);
  const [suspicious, setSuspicious] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("User not found");
          return;
        }
        const data = await res.json();

        setUser(data);
        setEmail(data.email ?? "");
        setRole(data.role ?? "");
        setVerified(data.verified ?? false);
        setSuspicious(data.suspicious ?? false);

      })
      .finally(() => setLoading(false));
  }, [userId, BACKEND_URL, token]);

  if (loading) {
    return (
      <div className="edit-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="edit-page">
        <div className="alert alert-error">User not found.</div>
      </div>
    );
  }

  // Handle submit
  const handleUpdate = (e) => {
    e.preventDefault();

    fetch(`${BACKEND_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        email,
        role,
        verified,
        suspicious
      })
    })

    
    .then(async (res) => {
    if (!res.ok) {
        alert("Can't update user info!");
        return;
    }
    alert("User updated!");
    navigate("/manager/users");
    });
  };

  return (
    <div className="edit-page">
      <div className="edit-page-header">
        <h1 className="edit-page-title">Update User Info</h1>
        <p className="edit-page-subtitle">Edit user details and permissions</p>
      </div>

      <form onSubmit={handleUpdate}>
        <div className="read-only-section">
          <div className="read-only-field">
            <span className="read-only-label">UtorID:</span>
            <span className="read-only-value">{user.utorid}</span>
          </div>
          <div className="read-only-field">
            <span className="read-only-label">Email:</span>
            <span className="read-only-value">{user.email || "Not provided"}</span>
          </div>
          <div className="read-only-field">
            <span className="read-only-label">Points:</span>
            <span className="read-only-value">{user.points || 0}</span>
          </div>
        </div>

        <div className="edit-form-card">
          {/* Name */}
          <div className="field-group">
            <label className="field-label" htmlFor="name">Email</label>
            <input
              id="name"
              className="field-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter user email"
              required
            />
          </div>

          {/* Role */}
          <div className="field-group">
            <label className="field-label" htmlFor="role">Role</label>
            <select
              id="role"
              className="field-select"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="regular">Regular</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          {/* Verified */}
          <div className="field-group">
            <label className="field-label">Verified Status</label>
            <div className="checkbox-group">
              <input
                type="checkbox"
                className="field-checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                id="verified"
              />
              <label htmlFor="verified" className="checkbox-label">
                User is verified
              </label>
            </div>
          </div>

          {/* Suspicious */}
          <div className="field-group">
            <label className="field-label">Suspicious Status</label>
            <div className="checkbox-group">
              <input
                type="checkbox"
                className="field-checkbox"
                checked={suspicious}
                onChange={(e) => setSuspicious(e.target.checked)}
                id="suspicious"
              />
              <label htmlFor="suspicious" className="checkbox-label">
                Mark user as suspicious
              </label>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button type="submit" className="action-button primary">
            Update User
          </button>
          <button
            type="button"
            className="action-button secondary"
            onClick={() => navigate("/manager/users")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}