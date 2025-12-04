import { useNavigate } from "react-router-dom";
import { Card } from "../../components/global/Card";
import Button from "../../components/global/Button";

export default function CashierDashboard() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
                Cashier Dashboard
            </h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "2rem",
                    marginTop: "2rem",
                }}
            >
                {/* Transaction Creation Card */}
                <Card
                    style={{
                        padding: "2rem",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                    }}
                    onClick={() => navigate("/cashier/transactions")}
                >
                    <h2 style={{ marginBottom: "1rem" }}>Create Transaction</h2>
                    <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                        Record a new purchase transaction for a customer
                    </p>
                    {/* <Button variant="primary" style={{ width: "100%" }}>
                        Go to Transaction Creation →
                    </Button> */}
                </Card>

                {/* Redemption Processing Card */}
                <Card
                    style={{
                        padding: "2rem",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                    }}
                    onClick={() => navigate("/cashier/redemption")}
                >
                    <h2 style={{ marginBottom: "1rem" }}>Process Redemption</h2>
                    <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                        Process redemption transactions and verify QR codes
                    </p>
                    {/* <Button variant="primary" style={{ width: "100%" }}>
                        Go to Redemption Processing →
                    </Button> */}
                </Card>
            </div>
        </div>
    );
}

