import { useState } from "react";
import Input from "../components/global/Input";
import Button from "../components/global/Button";

export default function ForgotPasswordPage() {
  const [utorid, setUtorid] = useState("");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setToken(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/resets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utorid }),  
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      setToken(data.resetToken);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Forgot Password</h1>

      <Input
        label="UTORid"
        placeholder="Enter your UTORid"
        value={utorid}
        onChange={setUtorid}
        required
      />

      <Button onClick={submit} disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>

      {token && (
        <div style={{ marginTop: 20 }}>
          <p>Click the link below to reset your password:</p>

          <a
            href={`/reset/${token}`}
            style={{
              color: "#007bff",
              textDecoration: "underline",
              cursor: "pointer"
            }}
          >
            {`${window.location.origin}/reset/${token}`}
          </a>
        </div>
      )}
    </div>
  );
}
