import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import NavBar from "../global/NavBar";

export default function Layout() {
  return (
    <div>
      <Header />
      <NavBar />
      <div style={{ padding: "20px" }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
