import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";

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
    <div style={{ padding: "2rem" }}>
      <h1>User Promotion</h1>
      <p>Promote any user to manager or superuser</p>

      <Card style={{ marginBottom: "2rem" }}>
        <h2>Find User</h2>
        <div style={{ marginBottom: "1rem" }}>
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
        <Card style={{ marginBottom: "2rem", backgroundColor: "#fee", borderColor: "#fcc" }}>
          <div style={{ color: "red" }}>Error: {error}</div>
        </Card>
      )}

      {success && (
        <Card style={{ marginBottom: "2rem", backgroundColor: "#efe", borderColor: "#cfc" }}>
          <div style={{ color: "green" }}>{success}</div>
        </Card>
      )}

      {user && (
        <Card style={{ marginBottom: "2rem" }}>
          <h2>User Information</h2>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>UTORid:</strong> {user.utorid}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Current Role:</strong> {user.role}</p>
        </Card>
      )}

      {user && (
        <Card>
          <h2>Promote User</h2>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              <strong>Select Role:</strong>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                padding: "0.5rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                width: "100%",
                maxWidth: "300px",
              }}
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
