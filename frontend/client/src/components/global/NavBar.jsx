import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset/");

  if (isAuthPage) return null;

  // Avatar info
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
        borderBottom: "none",
      }}
    >
      {/* Home */}
      <Link to="/dashboard">Home</Link>

      {/* Regular User Menu */}
      {role === "regular" && (
        <>
          <Link to="/promotions">Promotions</Link>
          <Link to="/user/qr">My QR</Link>
          <Link to="/transactions/my">My Transactions</Link>
          <Link to="/transfer">Transfer Points</Link>
          <Link to="/redeem">Redeem Points</Link>
          <Link to="/events">Events</Link>
        </>
      )}

      {/* Cashier Menu */}
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

      /* Avatar = Profile Page */
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
          userSelect: "none",
          fontWeight: 700,
        }}
      >
        {avatarUrl ? (
          <img
            src={`${process.env.REACT_APP_BACKEND_URL}${avatarUrl}`}
            alt="avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          displayLetter
        )}
      </div>

      <LogoutButton />

    </nav>
  );
}
