import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/global/Button";
import "./Dashboard.css";

const typeIcons = {
  purchase: "🛒",
  redemption: "🎫",
  adjustment: "⚙️",
  transfer: "💸",
  event: "🎪",
};

export default function Dashboard() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [points, setPoints] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (points === null) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div className="empty-state-title">Not logged in</div>
          <div className="empty-state-text">Please log in to view your dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome Back! 👋</h1>
        <p className="dashboard-subtitle">Here's your loyalty program overview</p>
      </div>

      {/* Points Card */}
      <div className="points-card">
        <div className="points-label">Your Current Balance</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="points-value">
            {points.toLocaleString()}
          </span>
          <span className="points-emoji">⭐</span>
        </div>
        <div style={{ marginTop: "1rem", opacity: 0.9, fontSize: "1.125rem" }}>
          points available
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="section-header">
          <div>
            <h2 className="section-title">Recent Transactions</h2>
            <p className="section-subtitle">Your last 5 transactions</p>
          </div>
        </div>

        {recentTx.length === 0 ? (
          <div className="empty-transactions">
            <div className="empty-transactions-icon">📭</div>
            <div className="empty-transactions-text">No transactions yet. Start earning points!</div>
          </div>
        ) : (
          <div className="transactions-grid">
            {recentTx.map((t) => (
              <div key={t.id} className={`transaction-card ${t.type}`}>
                <div className="transaction-header">
                  <div>
                    <div className="transaction-type">
                      {typeIcons[t.type] || "📄"} {t.type}
                      <span className="transaction-id"> #{t.id}</span>
                    </div>
                  </div>
                  <div className="transaction-amount">
                    {t.amount > 0 ? "+" : ""}{t.amount} pts
                  </div>
                </div>

                <div className="transaction-details">
                  {t.spent != null && (
                    <div className="transaction-detail">
                      <strong>Spent:</strong>
                      <span>${t.spent}</span>
                    </div>
                  )}

                  {t.relatedUtorid && (
                    <div className="transaction-detail">
                      <strong>{t.type === "transfer" ? "To:" : "With:"}</strong>
                      <span style={{ fontWeight: "600" }}>{t.relatedUtorid}</span>
                    </div>
                  )}

                  {t.promotionNames?.length > 0 && (
                    <div className="transaction-detail">
                      <strong>Promotions:</strong>
                      <span>
                        {t.promotionNames.map((name, idx) => (
                          <span key={idx} className="badge badge-primary" style={{ marginLeft: "0.5rem" }}>
                            {name}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}

                  <div className="transaction-detail">
                    <strong>Created By:</strong>
                    <span>{t.createdBy}</span>
                  </div>

                  {t.remark && (
                    <div className="transaction-detail">
                      <strong>Note:</strong>
                      <span style={{ fontStyle: "italic" }}>"{t.remark}"</span>
                    </div>
                  )}
                </div>

                <div className="transaction-footer">
                  <div className="transaction-time">
                    {new Date(t.createdAt).toLocaleString()}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {t.type === "redemption" && !t.processed && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/redeem/qr/${t.id}`)}
                        className="btn-primary"
                      >
                        View QR
                      </Button>
                    )}
                    {t.type === "redemption" && t.processed && (
                      <span className="badge badge-success">
                        ✔ Processed by {t.processedBy?.utorid || "cashier"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="view-all-button">
          <Button
            onClick={() => navigate("/transactions/my")}
            variant="outline"
            size="lg"
          >
            View All Transactions →
          </Button>
        </div>
      </div>
    </div>
  );
}
