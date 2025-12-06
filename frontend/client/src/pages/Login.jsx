import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/global/Input";
import Button from "../components/global/Button";
import { useAuth } from "../contexts/AuthContext";  

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();   
  
  const [utorid, setUtorid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const submit = async () => {
    const err = await login(utorid, password); 

    if (err) {
      setError(err || "Invalid UTORid or password");
      return;
    }

    nav("/dashboard"); 
  };

  return (
    <div>
      <h1>Login</h1>

        <Input
          label="UTORid"
          placeholder="Enter your UTORid"
          value={utorid}
          onChange={setUtorid}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          required
        />

        {error && (
          <p style={{ color: "red", marginTop: "8px" }}>
            {error}
          </p>
        )}

      <Button onClick={submit}>Login</Button>
      
      <div style={{ marginTop: "16px" }}>
        <a
          onClick={() => nav("/forgot-password")}
          style={{
            cursor: "pointer",
            color: "#007bff",
            textDecoration: "underline",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#0056b3")}
          onMouseLeave={(e) => (e.target.style.color = "#007bff")}
        >
          Forgot password?
        </a>
      </div>

    </div>
  );
}
