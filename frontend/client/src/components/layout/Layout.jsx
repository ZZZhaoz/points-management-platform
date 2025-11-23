import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div>
      <Header />
      <div style={{ padding: "20px" }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
