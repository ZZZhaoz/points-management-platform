import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../components/global/Input";
import Button from "../components/global/Button";


export default function ResetPasswordPage() {
  const { token } = useParams();              
  const navigate = useNavigate();

  const [utorid, setUtorid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/resets/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            utorid,
            password,
          }),
        }
      );

      const data = await res.json();
    console.log("token = ", token);
    console.log("backend url = ", process.env.REACT_APP_BACKEND_URL);
      if (!res.ok) {
        alert(data.error || "Reset failed.");
        return;
      }

      alert("Password reset successfully! Please log in.");
      navigate("/");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Reset Password</h1>

      <Input
        label="UTORid"
        placeholder="Enter your UTORid"
        value={utorid}
        onChange={setUtorid}
        required
      />

      <Input
        label="New Password"
        type="password"
        placeholder="Enter a new password"
        value={password}
        onChange={setPassword}
        required
      />

      <Button onClick={submit} disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </div>
  );
}
