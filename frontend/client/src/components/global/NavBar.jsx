
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";
import "./NavBar.css";
import { useAuth } from "../../contexts/AuthContext";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, viewRole, changeViewRole } = useAuth();
  if (!user) return null;
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

  // Role hierarchy for interface switching
  const roleRank = {
    regular: 1,
    cashier: 2,
    manager: 3,
    superuser: 4,
  };

  // Check if user can switch to a given role
  const canSwitchTo = (targetRole) => {
    if (!realRole) return false;
    const currentRank = roleRank[realRole] || 0;
    const targetRank = roleRank[targetRole] || 0;
    return targetRank <= currentRank;
  };

  return (
    <nav className="nav-bar">
      <Link to="/dashboard" className="nav-link">Home</Link>

      {/* ------------------------ Regular Nav ------------------------ */}
      {viewRole === "regular" && (
        <>
          <Link to="/statistics" className="nav-link">Statistics</Link>
          
          <Link to="/user/qr" className="nav-link">My QR</Link> 
          <Link to="/promotions" className="nav-link">Promotions</Link>
          <Link to="/events" className="nav-link">Events</Link>
       
        

          <Dropdown title="Transactions">
            <Dropdown.Item to="/transactions/my">My Transactions</Dropdown.Item>
            <Dropdown.Item to="/transfer">Transfer Points</Dropdown.Item>
            <Dropdown.Item to="/redeem">Redeem Points</Dropdown.Item>
          </Dropdown>

        </>
      )}

      {/* ------------------------ Cashier Nav ------------------------ */}
      {viewRole === "cashier" && (
        <>
            <Link to="/register" className="nav-link">Register User</Link>

            <Link to="/cashier/transactions" className="nav-link">
              Create Transaction
            </Link>
             <Link to="/cashier/redemption" className="nav-link">
              Process Redemption
            </Link>
         

        </>
      )}

      {/* ------------------------ Manager Nav ------------------------ */}
      {viewRole === "manager" && (
        
        <>
          <Link to="/manager/statistics" className="nav-link">Statistics</Link>  
          <Dropdown title="Users">
            <Dropdown.Item to="/register">Register User</Dropdown.Item>
            <Dropdown.Item to="/manager/users">View Users</Dropdown.Item>
          </Dropdown>
          
          <Dropdown title="Transactions">
            <Dropdown.Item to="/cashier/transactions">
              Create Transaction
            </Dropdown.Item>
            <Dropdown.Item to="/manager/transactions">
              View Transactions
            </Dropdown.Item>
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
        </>
      )}

      {/* ------------------------ Superuser Nav ------------------------ */}
      {viewRole === "superuser" && (
        <>
          <Link to="/manager/statistics" className="nav-link">Statistics</Link> 
          
          <Dropdown title="Users">
            <Dropdown.Item to="/register">Register User</Dropdown.Item>
            <Dropdown.Item to="/manager/users">View Users</Dropdown.Item>
            <Dropdown.Item to="/superuser/user-promotion"> User Promotion</Dropdown.Item>
          </Dropdown>
          <Dropdown title="Transactions">
            <Dropdown.Item to="/cashier/transactions">
              Create Transaction
            </Dropdown.Item>
            <Dropdown.Item to="/manager/transactions">
              View Transactions
            </Dropdown.Item>
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
            <Dropdown.Item to="/manager/events">View Events</Dropdown.Item>
            <Dropdown.Item to="/manager/events/create">
              Create Event
            </Dropdown.Item>
          </Dropdown>
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
            Events Statistics
          </Dropdown.Item>
        </Dropdown>
      )}

      {/* ------------------------ Interface Switcher ------------------------ */}
      {roleRank[realRole] > roleRank["regular"] && (
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
      )}

      {/* ------------------------ Avatar ------------------------ */}
     <div className="nav-right">
      <div
        className="nav-avatar"
        onClick={() => navigate("/profile")}
        title="View Profile"
      >
        {avatarUrl ? (
          <img src={`${process.env.REACT_APP_BACKEND_URL}${avatarUrl}`} alt="avatar" />
        ) : (
          displayLetter
        )}
      </div>
    </div>
    </nav>
  );
}