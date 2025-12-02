import { useLocation, Link } from "react-router-dom";
import NavBar from "../global/NavBar";
import "./Header.css";

export default function Header() {
  const location = useLocation();

  // auth pages: hide navbar entirely
  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset/");

  return (
    <header className="header">
      <div className="header-content">
        <Link to={isAuthPage ? "/" : "/dashboard"} className="header-logo">
          <span className="header-logo-icon">🎁</span>
          <span className="header-logo-text">LoyaltyHub</span>
        </Link>

        {!isAuthPage && (
          <div className="header-nav-wrapper">
            <NavBar />
          </div>
        )}
      </div>
    </header>
  );
}
