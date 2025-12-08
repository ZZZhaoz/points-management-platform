import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./TransactionsList.css";

function getQuery(filters) {
  const params = new URLSearchParams();

  if (filters.name) params.set("name", filters.name);
  if (filters.createdBy) params.set("createdBy", filters.createdBy);
  if (filters.suspicious !== "") params.set("suspicious", filters.suspicious);
  if (filters.promotionId) params.set("promotionId", filters.promotionId);
  if (filters.type) params.set("type", filters.type);
  if (filters.relatedId) params.set("relatedId", filters.relatedId);
  if (filters.id) params.set("id", filters.id);
  if (filters.amount) params.set("amount", filters.amount);
  if (filters.operator) params.set("operator", filters.operator);

  params.set("page", filters.page);
  params.set("limit", filters.limit);

  return params.toString();
}

function sortTransactions(transactions, sortBy, sortOrder) {
  const sorted = [...transactions];

  sorted.sort((a, b) => {
    const x = a[sortBy];
    const y = b[sortBy];

    if (x < y) return sortOrder === "asc" ? -1 : 1;
    if (x > y) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

export default function TransactionsList() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Filters (FIXED: no nulls)
  const [filters, setFilters] = useState({
    name: "",
    createdBy: "",
    suspicious: "",
    promotionId: "",
    type: "",
    relatedId: "",
    id: "",
    amount: "",
    operator: "",
    page: 1,
    limit: 10,
  });

  // Use state for sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Use state for pagination and getting data
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch from backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/transactions?${getQuery(filters)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
      if (!res.ok) {
        setTransactions([]);        
        setTotalCount(0);
        setError("Failed to load transactions");
        setSuccess("");
        return;
      }
        const data = await res.json();
        setTransactions(data.results || []);
        setTotalCount(data.count || 0);
      })
      .finally(() => setLoading(false));
  }, [filters, BACKEND_URL, token]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  const sortedTransactions = sortTransactions(transactions, sortBy, sortOrder);
  const totalPages = Math.ceil(totalCount / filters.limit);

  return (
    <div className="transactions-list-page">
      <div className="transactions-list-header">
        <h1 className="transactions-list-title">💸 All Transactions</h1>
        <p className="transactions-list-subtitle">View and manage all system transactions</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="filters-card">
        <h2 className="filters-title">Filters & Search</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Name</label>
            <input
              type="text"
              className="filter-input"
              value={filters.name}
              onChange={(e) =>
                setFilters({ ...filters, name: e.target.value, page: 1 })
              }
              placeholder="Enter name..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Created By (utorid)</label>
            <input
              type="text"
              className="filter-input"
              value={filters.createdBy}
              onChange={(e) =>
                setFilters({ ...filters, createdBy: e.target.value, page: 1 })
              }
              placeholder="Enter UTORid..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Suspicious</label>
            <select
              className="filter-select"
              value={filters.suspicious}
              onChange={(e) =>
                setFilters({ ...filters, suspicious: e.target.value, page: 1 })
              }
            >
              <option value="">All</option>
              <option value="true">Suspicious Only</option>
              <option value="false">Not Suspicious</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Promotion ID</label>
            <input
              type="number"
              className="filter-input"
              value={filters.promotionId}
              onChange={(e) =>
                setFilters({ ...filters, promotionId: e.target.value, page: 1 })
              }
              placeholder="Enter ID..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Type</label>
            <select
              className="filter-select"
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value, page: 1 })
              }
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="adjustment">Adjustment</option>
              <option value="redemption">Redemption</option>
              <option value="transfer">Transfer</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Transaction ID</label>
            <input
              type="number"
              className="filter-input"
              value={filters.id}
              onChange={(e) =>
                setFilters({ ...filters, id: e.target.value, page: 1 })
              }
              placeholder="Enter ID..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Amount</label>
            <input
              type="number"
              className="filter-input"
              value={filters.amount}
              onChange={(e) =>
                setFilters({ ...filters, amount: e.target.value, page: 1 })
              }
              placeholder="Enter amount..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Operator</label>
            <select
              className="filter-select"
              value={filters.operator}
              onChange={(e) =>
                setFilters({ ...filters, operator: e.target.value, page: 1 })
              }
            >
              <option value="">All</option>
              <option value="gte">Greater Than or Equal</option>
              <option value="lte">Less Than or Equal</option>
            </select>
          </div>
        </div>

        <div className="sort-controls">
          <div className="sort-group">
            <label className="filter-label">Sort By:</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ minWidth: "150px" }}
            >
              <option value="createdAt">Created Date</option>
              <option value="amount">Amount</option>
              <option value="id">ID</option>
              <option value="type">Type</option>
            </select>
          </div>

          <div className="sort-group">
            <label className="filter-label">Order:</label>
            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="sort-group">
            <label className="filter-label">Items per page:</label>
            <select
              className="filter-select"
              value={filters.limit}
              onChange={(e) =>
                setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })
              }
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="25">25</option>
            </select>
          </div>
        </div>
      </div>

      {sortedTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💸</div>
          <div className="empty-state-text">No transactions found.</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>UtorID</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Spent</th>
                <th>Created By</th>
                <th>Suspicious</th>
                <th>Promotion IDs</th>
                <th>Remark</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.id}</strong></td>
                  <td>{t.utorid}</td>
                  <td className={t.amount >= 0 ? "amount-positive" : "amount-negative"}>
                    {t.amount >= 0 ? "+" : ""}{t.amount}
                  </td>
                  <td>
                    <span className={`type-badge ${t.type}`}>{t.type}</span>
                  </td>
                  <td>{t.spent || "-"}</td>
                  <td>{t.createdBy}</td>
                  <td>
                    <span className={`suspicious-badge ${t.suspicious ? "yes" : "no"}`}>
                      {t.suspicious ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    {t.promotionIds && t.promotionIds.length > 0
                      ? t.promotionIds.join(", ")
                      : "None"}
                  </td>
                  <td>{t.remark ? t.remark : "No remarks"}</td>
                  <td>
                    <Link to={`/manager/transactions/${t.id}`} className="edit-link">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button
          className="pagination-button"
          disabled={filters.page === 1}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          Previous
        </button>

        <span className="pagination-info">
          Page {filters.page} of {totalPages || 1}
        </span>

        <button
          className="pagination-button"
          disabled={filters.page >= totalPages}
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
}