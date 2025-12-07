import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import Dropdown from "./Dropdown";
import "./NavBar.css";
import { useAuth } from "../../contexts/AuthContext"; 

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { viewRole, changeViewRole } = useAuth();

  const realRole = localStorage.getItem("role");    
  const isOrganizer = localStorage.getItem("isOrganizer") === "true";

  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset/");
  if (isAuthPage) return null;

  const utorid = localStorage.getItem("utorid") || "U";
  const avatarUrl = localStorage.getItem("avatarUrl");
  const displayLetter = utorid[0].toUpperCase();

  const roleRank = {
    regular: 1,
    cashier: 2,
    organizer: 3,
    manager: 4,
    superuser: 5,
  };

  const canSwitchTo = (targetRole) => {
    return roleRank[realRole] >= roleRank[targetRole];
  };

  // Get available interfaces user can switch to
  const getAvailableInterfaces = () => {
    const interfaces = [];
    
    // Regular interface - always available if user has any role
    interfaces.push({ role: "regular", label: "👤 Regular User", route: "/dashboard" });
    
    // Cashier interface - available if user is cashier or higher
    if (canSwitchTo("cashier")) {
      interfaces.push({ role: "cashier", label: "💰 Cashier", route: "/dashboard" });
    }
    
    // Manager interface - available if user is manager or superuser
    if (canSwitchTo("manager")) {
      interfaces.push({ role: "manager", label: "👔 Manager", route: "/dashboard" });
    }
    
    // Superuser interface - available if user is superuser
    if (canSwitchTo("superuser")) {
      interfaces.push({ role: "superuser", label: "⚡ Superuser", route: "/dashboard" });
    }
    
    // Organizer interface - available if user is an organizer
    if (isOrganizer) {
      interfaces.push({ role: "organizer", label: "🎪 Event Organizer", route: "/organizer/events" });
    }
    
    return interfaces;
  };

  const availableInterfaces = getAvailableInterfaces();
  const canSwitch = availableInterfaces.length > 1; // Show dropdown only if more than one interface available

  const handleInterfaceSwitch = (targetRole, targetRoute) => {
    if (targetRole === "organizer") {
      // For organizer, navigate directly to organizer events
      changeViewRole("regular"); // Keep viewRole as regular since organizer isn't a viewRole
      navigate(targetRoute);
    } else {
      changeViewRole(targetRole);
      navigate(targetRoute);
    }
  };

  const getCurrentInterfaceLabel = () => {
    if (viewRole === "regular" && isOrganizer && location.pathname.startsWith("/organizer")) {
      return "🎪 Event Organizer";
    }
    const current = availableInterfaces.find(int => int.role === viewRole);
    return current ? current.label : "👤 Regular User";
  };

  return (
    <nav className="nav-bar">
      {/* Home */}
      <Link to="/dashboard" className="nav-link">🏠 Home</Link>

      {/* Interface Switching Dropdown */}
      {canSwitch && (
        <Dropdown title={getCurrentInterfaceLabel()}>
          {availableInterfaces.map((interfaceOption) => {
            const isActive = 
              (interfaceOption.role === "organizer" && location.pathname.startsWith("/organizer")) ||
              (interfaceOption.role !== "organizer" && viewRole === interfaceOption.role);
            
            return (
              <Dropdown.Item
                key={interfaceOption.role}
                onClick={() => handleInterfaceSwitch(interfaceOption.role, interfaceOption.route)}
              >
                {isActive ? "✓ " : ""}{interfaceOption.label}
              </Dropdown.Item>
            );
          })}
        </Dropdown>
      )}

      {/* ------------------------ Regular Nav ------------------------ */}
      {viewRole === "regular" && (
        <>
          <Link to="/promotions" className="nav-link">🎁 Promotions</Link>
          <Link to="/user/qr" className="nav-link">📱 My QR</Link>
          <Link to="/statistics" className="nav-link">📊 Statistics</Link>
          
          <Dropdown title="💸 Transactions">
            <Dropdown.Item to="/transactions/my">My Transactions</Dropdown.Item>
            <Dropdown.Item to="/transfer">Transfer Points</Dropdown.Item>
            <Dropdown.Item to="/redeem">Redeem Points</Dropdown.Item>
          </Dropdown>

          <Link to="/events" className="nav-link">🎪 Events</Link>
        </>
      )}

      {/* CASHIER MENU */}
      {viewRole === "cashier" && (
        <>
          <Link to="/statistics" className="nav-link">📊 Statistics</Link>
          
          <Dropdown title="👥 Users">
            <Dropdown.Item to="/register">➕ Register User</Dropdown.Item>
          </Dropdown>
          
          <Dropdown title="💸 Transactions">
            <Dropdown.Item to="/cashier/transactions">Create Transaction</Dropdown.Item>
          </Dropdown>

          <Dropdown title="🎫 Redemption">
            <Dropdown.Item to="/cashier/redemption">Process Redemption</Dropdown.Item>
          </Dropdown>

          <Link to="/events" className="nav-link">🎪 Events</Link>
        </>
      )}

      {/* MANAGER MENU */}
      {viewRole === "manager" && (
        <>
          <Dropdown title="👥 Users">
            <Dropdown.Item to="/manager/users">All Users</Dropdown.Item>
            <Dropdown.Item to="/register">➕ Register User</Dropdown.Item>
          </Dropdown>
          <Link to="/manager/transactions" className="nav-link">📊 Transactions</Link>
          <Link to="/manager/promotions" className="nav-link">🎁 Promotions</Link>
          <Link to="/manager/statistics" className="nav-link">📊 Statistics</Link>
          
          <Dropdown title="🎪 Events">
            <Dropdown.Item to="/organizer/events">My Organized Events</Dropdown.Item>
            <Dropdown.Item to="/events">All Events</Dropdown.Item>
          </Dropdown>
        </>
      )}

      {/* SUPERUSER MENU */}
      {viewRole === "superuser" && (
        <>
          <Dropdown title="👥 Users">
            <Dropdown.Item to="/manager/users">All Users</Dropdown.Item>
            <Dropdown.Item to="/superuser/user-promotion">User Promotion</Dropdown.Item>
            <Dropdown.Item to="/register">➕ Register User</Dropdown.Item>
          </Dropdown>
          <Link to="/manager/transactions" className="nav-link">📊 Transactions</Link>
          <Link to="/superuser/statistics" className="nav-link">📊 Statistics</Link>
          
          <Dropdown title="🎪 Events">
            <Dropdown.Item to="/organizer/events">My Organized Events</Dropdown.Item>
            <Dropdown.Item to="/events">All Events</Dropdown.Item>
          </Dropdown>
        </>
      )}

      {/* Avatar = Profile Page */}
      <div
        className="nav-avatar"
        onClick={() => navigate("/profile")}
        title="View Profile"
      >
        {avatarUrl ? (
          <img
            src={`${process.env.REACT_APP_BACKEND_URL}${avatarUrl}`}
            alt="avatar"
          />
        ) : (
          displayLetter
        )}
      </div>

      <LogoutButton />
    </nav>
  );
}
