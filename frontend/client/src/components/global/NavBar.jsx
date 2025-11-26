import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import Dropdown from "./Dropdown";

export default function NavBar() {
  const role = localStorage.getItem("role");

  return (
    <nav className="nav-bar">
      <Link to="/dashboard">Home</Link>

      {/* Regular User Menu */}
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
      <LogoutButton />
    </nav>
  );
}
