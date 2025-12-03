import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <Header />

      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
