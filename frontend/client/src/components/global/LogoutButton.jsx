import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();        
    navigate("/");    
  };

  return (
    <Button onClick={handleLogout} variant="danger">
      Logout
    </Button>
  );
}
