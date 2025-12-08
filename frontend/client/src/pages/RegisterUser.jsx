import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/global/Input";
import Button from "../components/global/Button";
import "./RegisterUser.css";

export default function RegisterUser() {
  const { token } = useAuth();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  const [utorid, setUtorid] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const autoActivate = async (utorid, resetToken) => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/resets/${resetToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utorid,
          password: "Temp123!",
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return { ok: false, msg: json.error || "Activation failed." };
      }

      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "Network error during activation." };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${BACKEND_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ utorid, name, email }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setError(json.error || "A user with this UTORid already exists.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(json.error || "Failed to create user.");
        setLoading(false);
        return;
      }

      const activated = await autoActivate(utorid, json.resetToken);

      if (activated.ok) {
        setSuccess(
          "User created & activated! Temporary password: Temp123!"
        );
      } else {
        setError(
          `User created, but activation failed: ${activated.msg}`
        );
      }

      setUtorid("");
      setName("");
      setEmail("");

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const message = error || success;
  const isSuccess = !!success && !error;

  return (
    <div className="register-user-page">
      <div className="register-user-header">
        <h1 className="register-user-title">Register New User 👤</h1>
        <p className="register-user-subtitle">Create a new user account for the loyalty program</p>
      </div>

      <div className="register-user-card">
        <div className="register-user-icon">🎯</div>

        <form onSubmit={handleSubmit}>
          <Input
            label="UTORid"
            value={utorid}
            onChange={setUtorid}
            placeholder="e.g., johndoe1"
            required
          />

          <Input
            label="Full Name"
            value={name}
            onChange={setName}
            placeholder="John Doe"
            required
          />

          <Input
            label="UofT Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="example@mail.utoronto.ca"
            required
          />

          {message && (
            <div className={`alert ${isSuccess ? "alert-success" : "alert-error"}`} style={{ marginTop: "1rem" }}>
              {message}
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "1.5rem" }}
          >
            {loading ? "Creating..." : "Create User"}
          </Button>
        </form>
      </div>
    </div>
  );
}
