import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import "./TransactionsListPage.css";

const typeIcons = {
  purchase: "🛒",
  redemption: "🎫",
  adjustment: "⚙️",
  transfer: "💸",
  event: "🎪",
};

export default function TransactionsListPage() {
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("");
  const [promotionName, setPromotionName] = useState("");
  const [remark, setRemark] = useState("");       
  const [amount, setAmount] = useState("");
  const [operator, setOperator] = useState("");

  const [debouncedFilters, setDebouncedFilters] = useState({
    type: "",
    promotionName: "",
    remark: "",          
    amount: "",
    operator: "",
  });

  const [page, setPage] = useState(1);
  const limit = 6;
  const totalPages = Math.ceil(count / limit);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters({
        type,
        promotionName,
        remark,          
        amount,
        operator,
      });
      setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [type, promotionName, remark, amount, operator]);

  // Fetch transactions
  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams({
      page,
      limit,
    });

    if (debouncedFilters.type) params.append("type", debouncedFilters.type);
    if (debouncedFilters.promotionName)
      params.append("promotionName", debouncedFilters.promotionName);

    if (debouncedFilters.remark)
      params.append("remark", debouncedFilters.remark);

    if (debouncedFilters.amount && debouncedFilters.operator) {
      params.append("amount", debouncedFilters.amount);
      params.append("operator", debouncedFilters.operator);
    }

    fetch(`${BACKEND_URL}/users/me/transactions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setTransactions(data.results);
          setCount(data.count);
          setError("");
        } else {
          setError(data.error || "Failed to load transactions");
        }
      })
      .catch(() => {
        setError("Network error. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [debouncedFilters, page, BACKEND_URL, token]);

  const [promotionCache, setPromotionCache] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPromotions = async () => {
      const ids = [...new Set(transactions.flatMap((t) => t.promotionIds || []))];

      for (const id of ids) {
        if (!id) continue;
        if (promotionCache[id]) continue;

        const res = await fetch(`${BACKEND_URL}/promotions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setPromotionCache((prev) => ({ ...prev, [id]: data.name }));
        } else {
          setPromotionCache((prev) => ({ ...prev, [id]: "Unavailable" }));
        }
      }
    };

    loadPromotions();
  }, [transactions]);

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h1 className="transactions-title">My Transactions 💸</h1>
        <p className="transactions-subtitle">View and filter all your past transactions</p>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-title">
          Filter Transactions
        </div>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Type</label>
            <select 
              className="filter-select"
              value={type} 
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Any</option>
              <option value="purchase">Purchase</option>
              <option value="redemption">Redemption</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
              <option value="event">Event</option>
            </select>
          </div>

          <Input
            label="Promotion Name"
            value={promotionName}
            onChange={setPromotionName}
            placeholder="Search Promotion Name"
          />

          <Input
            label="Amount"
            value={amount}
            onChange={setAmount}
            placeholder="e.g. 50"
            type="number"
          />

          <div className="filter-group">
            <label className="filter-label">Operator</label>
            <select
              className="filter-select"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            >
              <option value="">None</option>
              <option value="gte">≥ (Greater than or equal)</option>
              <option value="lte">≤ (Less than or equal)</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <Input
            label="Remark"
            value={remark}
            onChange={setRemark}
            placeholder="Search remark text..."
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && !error && (
        <div className="empty-transactions">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No transactions found</div>
          <div className="empty-state-text">Try adjusting your filters or check back later!</div>
        </div>
      )}

      {/* Transactions */}
      {!loading && transactions.length > 0 && (
        <div className="transactions-grid">
          {transactions.map((t) => (
            <div key={t.id} className={`transaction-card ${t.type}`}>
              <div className="transaction-header">
                <div>
                  <div className="transaction-type">
                    {typeIcons[t.type] || "📄"} {t.type}
                    <span className="transaction-id"> #{t.id}</span>
                  </div>
                </div>
                <div className={`transaction-amount ${t.amount > 0 ? "positive" : "negative"}`}>
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

                {t.promotionIds?.length > 0 && (
                  <div className="transaction-detail">
                    <strong>Promotions:</strong>
                    <span>
                      {t.promotionIds.map((pid) => (
                        <span key={pid} className="badge badge-primary" style={{ marginLeft: "0.5rem" }}>
                          {promotionCache[pid] || "Loading..."}
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
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  {t.type === "redemption" && !t.processed && (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/redeem/qr/${t.id}`)}
                      variant="primary"
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>

          <span className="pagination-info">
            Page {page} / {totalPages || 1}
          </span>

          <button
            className="pagination-button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
