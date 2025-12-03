import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { viewRole } = useAuth();   
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" replace />;

  if (roles && !roles.includes(viewRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
