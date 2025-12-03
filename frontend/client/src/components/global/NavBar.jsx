import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import Dropdown from "./Dropdown";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset/");

  if (isAuthPage) return null;

  const utorid = localStorage.getItem("utorid") || "U";
  const avatarUrl = localStorage.getItem("avatarUrl");
  const displayLetter = utorid[0].toUpperCase();

  return (
    <nav
      className="nav-bar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "10px 20px",
        background: "#f7f7f7",
      }}
    >
      {/* Home */}
      <Link to="/dashboard">Home</Link>

      {/* REGULAR USER MENU */}
      {role === "regular" && (
        <>
          <Link to="/promotions">Promotions</Link>
          <Link to="/user/qr">My QR</Link>

          <Dropdown title="Transactions">
            <Dropdown.Item to="/transactions/my">My Transactions</Dropdown.Item>
            <Dropdown.Item to="/transfer">Transfer Points</Dropdown.Item>
            <Dropdown.Item to="/redeem">Redeem Points</Dropdown.Item>
          </Dropdown>

          <Dropdown title="Events">
            <Dropdown.Item to="/events">Event List</Dropdown.Item>
          </Dropdown>
        </>
      )}

      {/* CASHIER MENU */}
      {role === "cashier" && (
        <>
          <Dropdown title="Transactions">
            <Dropdown.Item to="/cashier/transactions">Create Transaction</Dropdown.Item>
          </Dropdown>

          <Dropdown title="Redemption">
            <Dropdown.Item to="/cashier/redemption">Request redemption points</Dropdown.Item>
          </Dropdown>
        </>
      )}

      {/* MANAGER MENU */}
      {role === "manager" && (
        <>
          <Link to="/manager/users">Users</Link>

          <Dropdown title="Transactions">
            <Dropdown.Item to="/manager/transactions">All Transactions</Dropdown.Item>
          </Dropdown>

          <Dropdown title="Promotions">
            <Dropdown.Item to="/manager/promotions/create">Create Promotion</Dropdown.Item>
            <Dropdown.Item to="/manager/promotions">View Promotions</Dropdown.Item>
          </Dropdown>

          <Dropdown title="Events">
            <Dropdown.Item to="/manager/events/create">Create Event</Dropdown.Item>
            <Dropdown.Item to="/manager/events">View Events</Dropdown.Item>
          </Dropdown>

          {/* Organizer tools (Managers are also organizers) */}
          <Dropdown title="Organizer Tools">
            <Dropdown.Item to="/organizer/events">My Organized Events</Dropdown.Item>
          </Dropdown>
        </>
      )}


      {/* SUPERUSER MENU */}
      {role === "superuser" && (
        <>
          {/* Manager-level links */}
          <Link to="/manager/users">Users</Link>

          <Dropdown title="Promotions">
            <Dropdown.Item to="/manager/promotions/create">Create Promotion</Dropdown.Item>
            <Dropdown.Item to="/manager/promotions">View Promotions</Dropdown.Item>
          </Dropdown>

          <Dropdown title="Events">
            <Dropdown.Item to="/manager/events/create">Create Event</Dropdown.Item>
            <Dropdown.Item to="/manager/events">View Events</Dropdown.Item>
          </Dropdown>

          <Link to="/manager/transactions">Transactions</Link>

          {/* Superuser-only tools */}
          <Dropdown title="Superuser Tools">
            <Dropdown.Item to="/organizer/events">My Organized Events</Dropdown.Item>
            <Dropdown.Item to="/superuser/user-promotion">User Promotion</Dropdown.Item>
          </Dropdown>
        </>
      )}

      {/* Avatar = Profile Page */}
      <div
        onClick={() => navigate("/profile")}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          overflow: "hidden",
          cursor: "pointer",
          backgroundColor: "#ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
      >
        {avatarUrl ? (
          <img
            src={`${process.env.REACT_APP_BACKEND_URL}${avatarUrl}`}
            alt="avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          displayLetter
        )}
      </div>

      <LogoutButton />
    </nav>
  );
}
