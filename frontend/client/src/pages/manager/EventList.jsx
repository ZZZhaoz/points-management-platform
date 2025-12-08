import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./EventList.css";

function getQuery(filters) {
  const params = new URLSearchParams();

  if (filters.name) params.set("name", filters.name);
  if (filters.location) params.set("location", filters.location);

  if (filters.started === "true" || filters.started === "false") {
    params.set("started", filters.started);
  }

  if (filters.ended === "true" || filters.ended === "false") {
    params.set("ended", filters.ended);
  }

  if (filters.showFull === "true" || filters.showFull === "false") {
    params.set("showFull", filters.showFull);
  }

  if (filters.published === "true" || filters.published === "false") {
    params.set("published", filters.published);
  }

  params.set("page", filters.page);
  params.set("limit", filters.limit);

  return params.toString();
}

export default function EventsList() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [filters, setFilters] = useState({
    name: "",
    location: "",
    started: "",
    ended: "",
    showFull: "",
    published: "",
    page: 1,
    limit: 10,
  });

  const [events, setEvents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    
    console.log(getQuery(filters));
    fetch(`${BACKEND_URL}/events?${getQuery(filters)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          setError("Failed to load events");
          setEvents([]);
          setSuccess("");
          return;
        }

        setError("");
        setSuccess("Events loaded.");

        const data = await res.json();
        setEvents(data.results || []);
        setTotalCount(data.count || 0);
      })
      .finally(() => setLoading(false));
  }, [filters, BACKEND_URL, token]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / filters.limit);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="events-list-page">
      <div className="events-list-header">
        <h1 className="events-list-title">🎪 All Events</h1>
        <p className="events-list-subtitle">View and manage all events in the system</p>
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
              placeholder="Enter event name..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Location</label>
            <input
              type="text"
              className="filter-input"
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value, page: 1 })
              }
              placeholder="Enter location..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Started</label>
            <select
              className="filter-select"
              value={filters.started}
              onChange={(e) =>
                setFilters({ ...filters, started: e.target.value, page: 1 })
              }
            >
              <option value="">All</option>
              <option value="true">Started</option>
              <option value="false">Not Started</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ended</label>
            <select
              className="filter-select"
              value={filters.ended}
              onChange={(e) =>
                setFilters({ ...filters, ended: e.target.value, page: 1 })
              }
            >
              <option value="">All</option>
              <option value="true">Ended</option>
              <option value="false">Not Ended</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Show Full</label>
            <select
              className="filter-select"
              value={filters.showFull}
              onChange={(e) =>
                setFilters({ ...filters, showFull: e.target.value, page: 1 })
              }
            >
              <option value="">All</option>
              <option value="true">Full</option>
              <option value="false">Not Full</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Published</label>
            <select
              className="filter-select"
              value={filters.published}
              onChange={(e) =>
                setFilters({ ...filters, published: e.target.value, page: 1 })
              }
            >
              <option value="">All</option>
              <option value="true">Published</option>
              <option value="false">Not Published</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Items per page</label>
            <select
              className="filter-select"
              value={filters.limit}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  limit: parseInt(e.target.value),
                  page: 1,
                })
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

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-text">No Events Found. Try a Different Filter!</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Capacity</th>
                <th>Guests</th>
                <th>Points Remain</th>
                <th>Points Awarded</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {ev.name}
                  </td>
                  <td>{ev.location}</td>
                  <td>{formatDate(ev.startTime)}</td>
                  <td>{formatDate(ev.endTime)}</td>
                  <td>{ev.capacity ?? "-"}</td>
                  <td>{ev.numGuests}</td>
                  <td>{ev.pointsRemain}</td>
                  <td>{ev.pointsAwarded}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: ev.published
                          ? "var(--success-light)"
                          : "var(--gray-200)",
                        color: ev.published ? "var(--success)" : "var(--gray-600)",
                      }}
                    >
                      {ev.published ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <Link to={`/manager/events/${ev.id}`} className="edit-link">Edit</Link>
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