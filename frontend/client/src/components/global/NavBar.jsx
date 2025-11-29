import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset/");

  if (isAuthPage) return null;

  const utorid = localStorage.getItem("utorid") || "U";
  const avatarUrl = localStorage.getItem("avatarUrl");

  // fallback: 首字母头像
  const displayLetter = utorid[0].toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <Link to="/dashboard">Home</Link>

      {/* ⭐ Avatar 在右侧 */}
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
    </div>
  );
}
