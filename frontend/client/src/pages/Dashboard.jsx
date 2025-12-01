import { useEffect, useState } from "react";

export default function Dashboard() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [points, setPoints] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  const typeColor = {
    purchase: "#4caf50",
    redemption: "#ff9800",
    adjustment: "#9c27b0",
    transfer: "#2196f3",
    event: "#f44336",
  };

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Load user points
        const userRes = await fetch(`${BACKEND_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();
        setPoints(userData.points || 0);

        // Load recent 5 transactions
        const txRes = await fetch(
          `${BACKEND_URL}/users/me/transactions?page=1&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const txData = await txRes.json();
        if (txRes.ok) {
          setRecentTx(txData.results);
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [BACKEND_URL, token]);

  if (loading) return <p>Loading...</p>;
  if (points === null) return <p>Not logged in.</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Your Points</h1>

      {/* Points Box */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "40px", fontWeight: "bold", margin: 0 }}>
          {points}
        </p>
        <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>points</p>
      </div>

      {/* Recent Transactions */}
      <h2 style={{ marginTop: "40px" }}>Recent Transactions</h2>
      <p>Your last 5 transactions</p>

      <div style={{ display: "grid", gap: "15px" }}>
        {recentTx.length === 0 && <p>No recent transactions.</p>}

        {recentTx.map((t) => (
          <div
            key={t.id}
            style={{
              border: "1px solid #ccc",
              borderLeft: `8px solid ${typeColor[t.type] || "#000"}`,
              padding: "15px",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* Left side */}
            <div>
              <h3 style={{ margin: 0 }}>
                {t.type.toUpperCase()} – ID #{t.id}
              </h3>

              <p style={{ margin: "6px 0" }}>
                <strong>Amount:</strong> {t.amount}
              </p>

              {t.spent != null && (
                <p style={{ margin: "6px 0" }}>
                  <strong>Spent:</strong> ${t.spent}
                </p>
              )}

              {t.relatedUtorid && (
                <p style={{ margin: "6px 0" }}>
                  <strong>Recipient:</strong>{" "}
                  <span style={{ fontWeight: "bold" }}>{t.relatedUtorid}</span>
                </p>
              )}

              {t.promotionNames?.length > 0 && (
                <p>
                  <strong>Promotions Used:</strong>{" "}
                  {t.promotionNames.map((name, idx) => (
                    <span key={idx} style={{ marginRight: "6px" }}>
                      {name}
                    </span>
                  ))}
                </p>
              )}

              <p style={{ margin: "6px 0" }}>
                <strong>Created By:</strong> {t.createdBy}
              </p>

              <p style={{ marginTop: "6px", fontSize: "0.9rem", color: "#666" }}>
                <strong>Time:</strong>{" "}
                {new Date(t.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Right side */}
            <div
              style={{
                textAlign: "right",
                minWidth: "150px",
                color: "#555",
                fontStyle: "italic",
              }}
            >
              {/* Remark */}
              {t.remark && <div>Remark: {t.remark}</div>}

              {/* Redemption QR button */}
              {t.type === "redemption" && !t.processed && (
                <button
                  onClick={() =>
                    (window.location.href = `/redeem/qr/${t.id}`)
                  }
                  style={{
                    marginTop: "10px",
                    padding: "6px 10px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                  }}
                >
                  Open QR Code
                </button>
              )}

              {t.type === "redemption" && t.processed && (
                <span style={{ color: "green", fontWeight: "bold" }}>
                  ✔ Processed by {t.processedBy?.utorid || "cashier"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Link to full transactions */}
      <div style={{ textAlign: "center", marginTop: "25px" }}>
        <button
          onClick={() => (window.location.href = "/transactions/my")}
          style={{
            padding: "8px 16px",
            background: "#444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
          }}
        >
          View All Transactions →
        </button>
      </div>
    </div>
  );
}
