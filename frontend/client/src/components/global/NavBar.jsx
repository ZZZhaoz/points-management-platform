import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import Dropdown from "./Dropdown";
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
      <Link to="/dashboard">Home</Link>

      {/* ------------------------ Regular Nav ------------------------ */}
      {viewRole === "regular" && (
        <>
          <Link to="/promotions">Promotions</Link>
          <Link to="/user/qr">My QR</Link>
          <Link to="/statistics">Statistics</Link>

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

      {/* ------------------------ Cashier Nav ------------------------ */}
      {viewRole === "cashier" && (
        <>
          <Dropdown title="Transactions">
            <Dropdown.Item to="/cashier/transactions">
              Create Transaction
            </Dropdown.Item>
          </Dropdown>

          <Dropdown title="Redemption">
            <Dropdown.Item to="/cashier/redemption">
              Process Redemption
            </Dropdown.Item>
          </Dropdown>
        </>
      )}

      {/* ------------------------ Manager Nav ------------------------ */}
      {viewRole === "manager" && (
        <>
          <Link to="/manager/users">Users</Link>

          <Dropdown title="Transactions">
            <Dropdown.Item to="/cashier/transactions">
              Create Transaction
            </Dropdown.Item>
            <Dropdown.Item to="/manager/transactions">
              All Transactions
            </Dropdown.Item>
          </Dropdown>


          <Dropdown title="Redemption">
            <Dropdown.Item to="/cashier/redemption">
              Process Redemption
            </Dropdown.Item>
          </Dropdown>

          <Dropdown title="Promotions">
            <Dropdown.Item to="/manager/promotions/create">
              Create Promotion
            </Dropdown.Item>
            <Dropdown.Item to="/manager/promotions">
              View Promotions
            </Dropdown.Item>
          </Dropdown>

          <Dropdown title="Events">
            <Dropdown.Item to="/manager/events/create">
              Create Event
            </Dropdown.Item>
            <Dropdown.Item to="/manager/events">View Events</Dropdown.Item>
          </Dropdown>


         <Link to="/manager/statistics">Statistics</Link>  


        </>
      )}

      {/* ------------------------ Superuser Nav ------------------------ */}
      {viewRole === "superuser" && (
        <>
          <Link to="/manager/users">Users</Link>

          <Dropdown title="Transactions">
            <Dropdown.Item to="/cashier/transactions">
              Create Transaction
            </Dropdown.Item>
            <Dropdown.Item to="/manager/transactions">
              All Transactions
            </Dropdown.Item>
          </Dropdown>

          <Dropdown title="Redemption">
            <Dropdown.Item to="/cashier/redemption">
              Process Redemption
            </Dropdown.Item>
          </Dropdown>

          <Dropdown title="Promotions">
            <Dropdown.Item to="/manager/promotions/create">
              Create Promotion
            </Dropdown.Item>
            <Dropdown.Item to="/manager/promotions">
              View Promotions
            </Dropdown.Item>
          </Dropdown>


          <Dropdown title="Events">
            <Dropdown.Item to="/manager/events/create">
              Create Event
            </Dropdown.Item>
            <Dropdown.Item to="/manager/events">View Events</Dropdown.Item>
          </Dropdown>


          <Dropdown title="Superuser Tools">
        
            <Dropdown.Item to="/superuser/user-promotion">
              User Promotion
            </Dropdown.Item>
          </Dropdown>

          <Link to="/manager/statistics">Statistics</Link>  

        </>
        
      )}

      {/* ------------------------ Organizer Tools (real organizer) ------------------------ */}
      {(isOrganizer ||
        realRole === "manager" ||
        realRole === "superuser") && (
        <Dropdown title="Organizer Tools">
          <Dropdown.Item to="/organizer/events">
            My Organized Events
          </Dropdown.Item>
          <Dropdown.Item to="/organizer/statistics">
            Statistics
          </Dropdown.Item>
        </Dropdown>
      )}

      {/* ------------------------ Interface Switcher ------------------------ */}
      <Dropdown title={`View as: ${viewRole}`}>
        {canSwitchTo("regular") && (
          <Dropdown.Item
            onClick={() => {
              changeViewRole("regular");
              navigate("/dashboard");
            }}
          >
            Regular User
          </Dropdown.Item>
        )}

        {canSwitchTo("cashier") && (
          <Dropdown.Item
            onClick={() => {
              changeViewRole("cashier");
              navigate("/dashboard");
            }}
          >
            Cashier
          </Dropdown.Item>
        )}

        {canSwitchTo("manager") && (
          <Dropdown.Item
            onClick={() => {
              changeViewRole("manager");
              navigate("/dashboard");
            }}
          >
            Manager
          </Dropdown.Item>
        )}

        {canSwitchTo("superuser") && (
          <Dropdown.Item
            onClick={() => {
              changeViewRole("superuser");
              navigate("/dashboard");
            }}
          >
            Superuser
          </Dropdown.Item>
        )}
      </Dropdown>

      {/* ------------------------ Avatar + Logout ------------------------ */}
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
