import NavBar from "../global/NavBar";

export default function Header() {
  return (
    <header
      className="header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        background: "#ffffff",
        borderBottom: "1px solid #ddd"
      }}
    >
      <div className="header-left">
        <h2 style={{ margin: 0 }}>Loyalty Program</h2>
      </div>

      <NavBar />
    </header>
  );
}
