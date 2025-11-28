import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import Dropdown from "./Dropdown";

export default function NavBar() {
  const role = localStorage.getItem("role");

  return (
    <nav className="nav-bar">
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


      {(role === "superuser") && (
        <>
           <br></br>
          <Link to="/manager/users">Users</Link>

          <br></br>

        <Dropdown title="Promotions">
          <Dropdown.Item to="/manager/promotions/create">Create Promotion</Dropdown.Item>
          <Dropdown.Item to="/manager/promotions">View Promotions</Dropdown.Item>
        </Dropdown>

        <br></br>

        <Dropdown title="Events">
          <Dropdown.Item to="/manager/events/create">Create Event</Dropdown.Item>
          <Dropdown.Item to="/manager/events">View Events</Dropdown.Item>
        </Dropdown>

        <br></br>
             
          <Link to="/manager/transactions">Transactions</Link>
          <br></br>
        </>
      )}




      <LogoutButton />
    </nav>
  );
}
