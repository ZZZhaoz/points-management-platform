import { Navigate, Outlet } from "react-router-dom";

export default function OrganizerProtectedRoute() {
  const token = localStorage.getItem("token");
  const isOrganizer = localStorage.getItem("isOrganizer") === "true";

  if (!token) return <Navigate to="/" replace />;

  if (!isOrganizer) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

