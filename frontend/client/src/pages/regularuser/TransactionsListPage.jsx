import { useState, useEffect } from "react";
import Input from "../../components/global/Input";

export default function TransactionsListPage() {
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

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
        }
      })
      .finally(() => setLoading(false));
  }, [debouncedFilters, page]);

  const typeColor = {
    purchase: "#4caf50",
    redemption: "#ff9800",
    adjustment: "#9c27b0",
    transfer: "#2196f3",
    event: "#f44336",
  };

  const [promotionCache, setPromotionCache] = useState({});

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
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2>My Transactions</h2>
      <p>All past transactions</p>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <Input
            label="Remark"
            value={remark}
            onChange={setRemark}
            placeholder="Search remark text..."
          />
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Any</option>
              <option value="purchase">Purchase</option>
              <option value="redemption">Redemption</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
              <option value="event">Event</option>
            </select>
          </label>

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
          />

          <label>
            Operator
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            >
              <option value="">None</option>
              <option value="gte">≥</option>
              <option value="lte">≤</option>
            </select>
          </label>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ display: "grid", gap: "15px" }}>
        {transactions.map((t) => (
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

              {t.promotionIds?.length > 0 && (
                <p>
                  <strong>Promotions Used:</strong>{" "}
                  {t.promotionIds.map((pid) => (
                    <span key={pid} style={{ marginRight: "6px" }}>
                      {promotionCache[pid] || "Loading..."}
                    </span>
                  ))}
                </p>
              )}

              <p style={{ margin: "6px 0" }}>
                <strong>Created By:</strong> {t.createdBy}
              </p>
            </div>

            {/* Right side */}
            <div
              style={{
                marginLeft: "20px",
                color: "#555",
                fontStyle: "italic",
                minWidth: "150px",
                textAlign: "right",
              }}
            >
              {/* Remark */}
              {t.remark && <div>Remark: {t.remark}</div>}

              {/* Redemption logic */}
              {t.type === "redemption" && (
                <div style={{ marginTop: "10px" }}>
                  {t.processed ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      ✔ Processed by {t.processedBy?.utorid || "cashier"}
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        (window.location.href = `/redeem/qr/${t.id}`)
                      }
                      style={{
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
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div
        style={{
          marginTop: "25px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span>
          Page {page} / {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
