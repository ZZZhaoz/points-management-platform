import Button from "./Button";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav("/");
  };

  return (
    <Button variant="secondary" onClick={logout}>
      Logout
    </Button>
  );
}
