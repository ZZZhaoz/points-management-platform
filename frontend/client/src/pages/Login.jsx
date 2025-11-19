import { useState } from "react";
import { login, getMe } from "../api/auth";
import { useNavigate } from "react-router-dom";
import Input from "../components/global/Input";  
import Button from "../components/global/Button";  

export default function Login() {
  const nav = useNavigate();
  const [utorid, setUtorid] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const res = await login(utorid, password);
      localStorage.setItem("token", res.data.token);

      const me = await getMe();
      localStorage.setItem("role", me.data.role);

      nav("/dashboard");
    } catch (e) {
      console.log(e);
      alert("Login failed!");
    }
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
