import { useAuth } from "../../contexts/AuthContext";
import Dashboard from "../../pages/Dashboard";
import CashierDashboard from "../../pages/cashier/CashierDashboard";
import ManagerDashboard from "../../pages/manager/ManagerDashboard";
import SuperuserDashboard from "../../pages/superuser/SuperuserDashboard"

export default function DashboardWrapper() {
  const { viewRole } = useAuth();

  // Show CashierDashboard for cashier viewRole
  if (viewRole === "cashier") {
    return <CashierDashboard />;
  }
  
  if (viewRole === "manager"){
    return <ManagerDashboard/>;
  }

  
  if (viewRole === "superuser"){
    return <SuperuserDashboard/>;
  }
  // Show regular Dashboard for other viewRoles
  return <Dashboard />;
}

