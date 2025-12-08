import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PromotionList.css";

function getQuery(filters) {
  const params = new URLSearchParams();

  if (filters.name && filters.name.trim() !== "") {
    params.set("name", filters.name.trim());
  }
  if (filters.type && filters.type.trim() !== "") {
    params.set("type", filters.type);
  }

  params.set("page", filters.page);
  params.set("limit", filters.limit);

  return params.toString();
}

function sortPromotions(promos, sortBy, sortOrder) {
  const sorted = [...promos];

  sorted.sort((a, b) => {
    let x = a[sortBy];
    let y = b[sortBy];

    if (sortBy === "startTime" || sortBy === "endTime") {
      x = new Date(x);
      y = new Date(y);
    }

    if (x < y) return sortOrder === "asc" ? -1 : 1; 
    if (x > y) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

export default function PromotionsList() {
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Use state for filters
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    page: 1,
    limit: 10,
  });

  // Use state for sorting
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Use state for pagination and data
  const [promotions, setPromotions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Use state to hold temporary name

  // FETCH
  useEffect(() => {

    console.log(getQuery(filters));
    fetch(`${BACKEND_URL}/promotions?${getQuery(filters)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("Failed to load promotions");
          return;
        }
        const data = await res.json();
        setPromotions(data.results || []);
        setTotalCount(data.count || 0);
      })
      .finally(() => setLoading(false));
  }, [filters, BACKEND_URL, token]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading promotions...</p>
      </div>
    );
  }

  const sortedPromotions = sortPromotions(promotions, sortBy, sortOrder);
  const totalPages = Math.ceil(totalCount / filters.limit);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="promotions-list-page">
      <div className="promotions-list-header">
        <h1 className="promotions-list-title">All Promotions</h1>
        <p className="promotions-list-subtitle">Manage and view all system promotions</p>
      </div>

      <div className="filters-card">
        <h2 className="filters-title">Filters & Search</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="name" className="filter-label">Search By Name</label>
            <input
              id="name"
              type="text"
              className="filter-input"
              value={filters.name}
              onChange={(e) =>
                setFilters({ ...filters, name: e.target.value, page: 1 })
              }
              placeholder="Enter promotion name..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="type" className="filter-label">Type</label>
            <select
              id="type"
              className="filter-select"
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value, page: 1 })
              }
            >
              <option value="">All</option>
              <option value="automatic">Automatic</option>
              <option value="onetime">One-Time</option>
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
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="startTime">Starting Date</option>
              <option value="endTime">Expiry Date</option>
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

      {sortedPromotions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎁</div>
          <div className="empty-state-text">No Promotions Found. Try a Different Filter!</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Starting Date</th>
                <th>Expiry Date</th>
                <th>Min Spending</th>
                <th>Rate</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPromotions.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>
                    <span className={`type-badge ${p.type}`}>{p.type}</span>
                  </td>
                  <td>{formatDate(p.startTime)}</td>
                  <td>{formatDate(p.endTime)}</td>
                  <td>{p.minSpending !== null ? p.minSpending : "-"}</td>
                  <td>{p.rate !== null ? p.rate : "-"}</td>
                  <td>{p.points !== null ? p.points : "-"}</td>
                  <td>
                    <Link to={`/manager/promotions/${p.id}`} className="edit-link">Edit</Link>
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