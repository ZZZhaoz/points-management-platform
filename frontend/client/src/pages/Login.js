import { useState } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [utorid, setUtorid] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const res = await login(utorid, password);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role); 
      nav("/dashboard");
    } catch (e) {
      alert("Login failed!");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input placeholder="utorid" value={utorid} onChange={e=>setUtorid(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={submit}>Login</button>
    </div>
  );
}
