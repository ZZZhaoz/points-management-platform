import { useState } from "react";
import { login, getMe } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [utorid, setUtorid] = useState("");
  const [password, setPassword] = useState("");

const submit = async () => {
  try {
    // 1. Login → only token returned
    const res = await login(utorid, password);
    localStorage.setItem("token", res.data.token);

    // 2. Fetch user info (role)
    const me = await getMe();
    localStorage.setItem("role", me.data.role);

    // 3. Now login success → jump
    nav("/dashboard");
  } catch (e) {
    console.log(e);
    alert("Login failed!");
  }
};

  return (
    <div>
  <h1>Login</h1>

  <label htmlFor="utorid">Utorid</label>
  <input
    id="utorid"
    name="utorid"
    placeholder="utorid"
    value={utorid}
    onChange={e => setUtorid(e.target.value)}
  />

  <label htmlFor="password">Password</label>
  <input
    id="password"
    name="password"
    placeholder="password"
    type="password"
    value={password}
    onChange={e => setPassword(e.target.value)}
  />

  <button onClick={submit}>Login</button>
</div>

  );
}
