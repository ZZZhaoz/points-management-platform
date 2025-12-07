import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";
import "./UserPromotion.css";

export default function UserPromotion() {
  const { getUserById, updateUserRole } = useAuth();
  const [userId, setUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("manager");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [promoting, setPromoting] = useState(false);

  const handleLoadUser = async () => {
    if (!userId || userId.trim() === "") {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setUser(null);

    const result = await getUserById(parseInt(userId, 10));

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setUser(result.data);
    }
  };

  const handlePromote = async () => {
    if (!user) {
      setError("Please load a user first");
      return;
    }

    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setPromoting(true);
    setError(null);
    setSuccess(null);

    const result = await updateUserRole(user.id, selectedRole);

    setPromoting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Successfully promoted user to ${selectedRole}`);
      // Reload user to get updated role
      const userResult = await getUserById(user.id);
      if (!userResult.error) {
        setUser(userResult.data);
      }
    }
  };

  return (
    <div className="user-promotion-page">
      <div className="user-promotion-header">
        <h1 className="user-promotion-title">👑 User Promotion</h1>
        <p className="user-promotion-subtitle">Promote any user to manager or superuser</p>
      </div>

      <Card className="promotion-card">
        <h2 className="promotion-card-title">Find User</h2>
        <div className="promotion-form-group">
          <Input
            label="User ID"
            type="number"
            value={userId}
            onChange={setUserId}
            placeholder="Enter user ID"
            required
          />
        </div>
        <Button onClick={handleLoadUser} disabled={loading}>
          {loading ? "Loading..." : "Load User"}
        </Button>
      </Card>

      {error && (
        <Card className="alert-card alert-error">
          <div>Error: {error}</div>
        </Card>
      )}

      {success && (
        <Card className="alert-card alert-success">
          <div>{success}</div>
        </Card>
      )}

      {user && (
        <Card className="user-info-card">
          <h2 className="promotion-card-title">User Information</h2>
          <div className="user-info-grid">
            <div className="user-info-item">
              <span className="user-info-label">ID</span>
              <span className="user-info-value">{user.id}</span>
            </div>
            <div className="user-info-item">
              <span className="user-info-label">UTORid</span>
              <span className="user-info-value">{user.utorid}</span>
            </div>
            <div className="user-info-item">
              <span className="user-info-label">Name</span>
              <span className="user-info-value">{user.name}</span>
            </div>
            <div className="user-info-item">
              <span className="user-info-label">Email</span>
              <span className="user-info-value">{user.email}</span>
            </div>
            <div className="user-info-item">
              <span className="user-info-label">Current Role</span>
              <span className="user-info-value">{user.role}</span>
            </div>
          </div>
        </Card>
      )}

      {user && (
        <Card className="promotion-card">
          <h2 className="promotion-card-title">Promote User</h2>
          <div className="promotion-form-group">
            <label className="promotion-label">Select Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="promotion-select"
            >
              <option value="regular">Regular</option>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="superuser">Superuser</option>
            </select>
          </div>
          <Button onClick={handlePromote} disabled={promoting}>
            {promoting ? "Promoting..." : `Promote to ${selectedRole}`}
          </Button>
        </Card>
      )}
    </div>
  );
}
