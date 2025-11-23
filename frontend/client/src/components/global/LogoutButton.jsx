import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; 

export default function LogoutButton() {
  const { logout } = useAuth(); 
  const nav = useNavigate();

  const handleLogout = () => {
    logout();      
    nav("/");      
  };

  return (
    <Button variant="secondary" onClick={handleLogout}>
      Logout
    </Button>
  );
}
