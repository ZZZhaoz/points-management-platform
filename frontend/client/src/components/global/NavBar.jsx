import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import Dropdown from "./Dropdown";

export default function NavBar() {
  const role = localStorage.getItem("role");

  return (
    <nav className="nav-bar"   style={{
        display: "flex",          
        alignItems: "center",     
        gap: "20px",             
        padding: "10px 20px",
        background: "#f7f7f7",
        borderBottom: "1px solid #ddd"
      }}
      >
      <Link to="/dashboard">Home</Link>

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

      <LogoutButton />
    </nav>
  );
}
