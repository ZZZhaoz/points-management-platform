import { useLocation } from "react-router-dom";
import NavBar from "../global/NavBar";

export default function Header() {
  const location = useLocation();

  // auth pages: hide navbar entirely
  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset/");

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 30px",
        backgroundColor: "#f7f7f7",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h2 style={{ margin: 0 }}>Loyalty Program</h2>

      {!isAuthPage && <NavBar showOnlyLinks={true} />}
    </header>
  );
}
