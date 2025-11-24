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

  const submit = async () => {
    const err = await login(utorid, password); 

    if (err) {
      alert(err);
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

      <Button onClick={submit}>Login</Button>
    </div>
  );
}
