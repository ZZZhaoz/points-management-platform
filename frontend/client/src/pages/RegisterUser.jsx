import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/global/Input";
import Button from "../components/global/Button";
import { Card } from "../components/global/Card";

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

  return (
    <Card className="max-w-md mx-auto mt-8 p-6">
      <h2 className="text-xl font-semibold mb-4">Register New User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

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
          value={email}
          onChange={setEmail}
          placeholder="example@mail.utoronto.ca"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Card>
  );
}
