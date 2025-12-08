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

  return (
    <nav className="nav-bar">
      {/* Home */}
      <Link to="/dashboard" className="nav-link">🏠 Home</Link>

      {/* ------------------------ Regular Nav ------------------------ */}
      {viewRole === "regular" && (
        <>
          <Link to="/promotions" className="nav-link">🎁 Promotions</Link>
          <Link to="/user/qr" className="nav-link">📱 My QR</Link>

          <Dropdown title="💸 Transactions">
            <Dropdown.Item to="/transactions/my">My Transactions</Dropdown.Item>
            <Dropdown.Item to="/transfer">Transfer Points</Dropdown.Item>
            <Dropdown.Item to="/redeem">Redeem Points</Dropdown.Item>
          </Dropdown>

          <Dropdown title="🎪 Events">
            <Dropdown.Item to="/events">Event List</Dropdown.Item>
            <Dropdown.Item to="/organizer/events">My Organized Events</Dropdown.Item>
          </Dropdown>
        </>
      )}

      {/* CASHIER MENU */}
      {realRole === "cashier" && (
        <>
          <Dropdown title="💸 Transactions">
            <Dropdown.Item to="/cashier/transactions">Create Transaction</Dropdown.Item>
          </Dropdown>

          <Dropdown title="🎫 Redemption">
            <Dropdown.Item to="/cashier/redemption">Process Redemption</Dropdown.Item>
          </Dropdown>

          <Dropdown title="🎪 Events">
            <Dropdown.Item to="/organizer/events">My Organized Events</Dropdown.Item>
          </Dropdown>
        </>
      )}

      {/* MANAGER MENU */}
      {realRole === "manager" && (
        <>
          <Link to="/manager/users" className="nav-link">👥 Users</Link>
          <Link to="/manager/transactions" className="nav-link">📊 All Transactions</Link>
          <Link to="/manager/promotions" className="nav-link">🎁 Promotions</Link>

          <Dropdown title="🎪 Events">
            <Dropdown.Item to="/organizer/events">My Organized Events</Dropdown.Item>
            <Dropdown.Item to="/events">All Events</Dropdown.Item>
          </Dropdown>
        </>
      )}

      {/* SUPERUSER MENU */}
      {realRole === "superuser" && (
        <>
          <Link to="/manager/users" className="nav-link">👥 Users</Link>
          <Link to="/manager/transactions" className="nav-link">📊 All Transactions</Link>

          <Dropdown title="⚡ Admin">
            <Dropdown.Item to="/superuser/user-promotion">User Promotion</Dropdown.Item>
          </Dropdown>

          <Dropdown title="🎪 Events">
            <Dropdown.Item to="/organizer/events">My Organized Events</Dropdown.Item>
            <Dropdown.Item to="/events">All Events</Dropdown.Item>
          </Dropdown>
        </>
      )}

      {/* Avatar */}
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
