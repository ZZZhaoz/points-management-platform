import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import "./EventsListPage.css";

export default function EventsListPage() {
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [myEventIds, setMyEventIds] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [started, setStarted] = useState("");
  const [ended, setEnded] = useState("");
  const [attended, setAttended] = useState("");

  const [filterMessage, setFilterMessage] = useState("");

  const [page, setPage] = useState(1);
  const limit = 5;
  const [count, setCount] = useState(0);

  // Fetch events user joined (only once)
  useEffect(() => {
    fetch(`${BACKEND_URL}/users/me/events`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMyEventIds(new Set(data));
      })
      .catch(() => {});
  }, [BACKEND_URL, token]);

  const [debouncedFilters, setDebouncedFilters] = useState({
    name: "",
    location: "",
    started: "",
    ended: "",
    attended: "",
  });

  // Debounce filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({ name, location, started, ended, attended });
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [name, location, started, ended, attended]);

  // Fetch events from backend (DO NOT slice front-end)
  useEffect(() => {
    if (debouncedFilters.started !== "" && debouncedFilters.ended !== "") {
      setFilterMessage("You cannot filter by both started and ended.");
      return;
    } else {
      setFilterMessage("");
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page,
      limit,
      published: "true",
    });

    if (debouncedFilters.name)
      params.append("name", debouncedFilters.name);
    if (debouncedFilters.location)
      params.append("location", debouncedFilters.location);
    if (debouncedFilters.started !== "")
      params.append("started", debouncedFilters.started);
    if (debouncedFilters.ended !== "")
      params.append("ended", debouncedFilters.ended);

    // attended filtering is front-end only — do NOT send to backend

    fetch(`${BACKEND_URL}/events?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error();
        setEvents(data.results || []);
        setCount(data.count || 0);
      })
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, [page, debouncedFilters, BACKEND_URL, token]);

  // Apply attended filtering after backend pagination
  const displayedEvents = events.filter((event) => {
    const isJoined = myEventIds.has(event.id);
    if (debouncedFilters.attended === "true") return isJoined;
    if (debouncedFilters.attended === "false") return !isJoined;
    return true;
  });

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="events-list-page">
      <div className="events-header">
        <h1 className="events-title">Events 🎪</h1>
        <p className="events-subtitle">Discover and join exciting events!</p>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-title">
          Filter Events
        </div>

        {filterMessage && (
          <div className="alert alert-warning" style={{ marginBottom: "1rem" }}>
            {filterMessage}
          </div>
        )}

        <div className="filters-grid">
          <Input
            label="Search by name"
            value={name}
            onChange={setName}
            placeholder="Search by name"
          />

          <Input
            label="Search by location"
            value={location}
            onChange={setLocation}
            placeholder="Location"
          />

          <div className="filter-group">
            <label className="filter-label">Started</label>
            <select
              className="filter-select"
              value={started}
              onChange={(e) => setStarted(e.target.value)}
            >
              <option value="">Any</option>
              <option value="true">Started</option>
              <option value="false">Not started</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ended</label>
            <select
              className="filter-select"
              value={ended}
              onChange={(e) => setEnded(e.target.value)}
            >
              <option value="">Any</option>
              <option value="true">Ended</option>
              <option value="false">Not ended</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Attended</label>
            <select
              className="filter-select"
              value={attended}
              onChange={(e) => setAttended(e.target.value)}
            >
              <option value="">Any</option>
              <option value="true">Joined</option>
              <option value="false">Not Joined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && displayedEvents.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">No events found</div>
          <div className="empty-state-text">Try adjusting your filters or check back later!</div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Events List */}
      {!loading && displayedEvents.length > 0 && (
        <div className="events-grid">
          {displayedEvents.map((event) => {
            const isJoined = myEventIds.has(event.id);
            const isFull = event.numGuests >= event.capacity;

            return (
              <div
                key={event.id}
                className={`event-card ${isFull ? "full" : ""}`}
              >
                {isJoined && (
                  <div className="attending-badge">
                    Attending
                  </div>
                )}

                <h3 className="event-name">{event.name}</h3>
                <p className="event-description">{event.description}</p>

                <div className="event-details">
                  <div className="event-detail">
                    <strong>Location:</strong>
                    <span>{event.location}</span>
                  </div>

                  <div className="event-detail">
                    <strong>Time:</strong>
                    <span>
                      {event.startTime?.slice(0, 10)} → {event.endTime?.slice(0, 10)}
                    </span>
                  </div>

                  <div className="event-detail">
                    <strong>Capacity:</strong>
                    <span className={isFull ? "capacity-full" : ""}>
                      {event.numGuests}/{event.capacity}
                      {isFull && " (FULL)"}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/events/${event.id}`)}
                  variant="outline"
                  style={{ width: "100%" }}
                >
                  View Details →
                </Button>
              </div>
            );
          })}
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
