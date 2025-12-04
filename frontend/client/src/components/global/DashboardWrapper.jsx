import { useAuth } from "../../contexts/AuthContext";
import Dashboard from "../../pages/Dashboard";
import CashierDashboard from "../../pages/cashier/CashierDashboard";

export default function DashboardWrapper() {
  const { viewRole } = useAuth();

  // Show CashierDashboard for cashier viewRole
  if (viewRole === "cashier") {
    return <CashierDashboard />;
  }

  // Show regular Dashboard for other viewRoles
  return <Dashboard />;
}

