import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/global/Input";

export default function EventsListPage() {
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

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
    <div>
      <h2>Events</h2>
      <p>All published events</p>

      {filterMessage && (
        <p style={{ color: "orange", fontWeight: "bold" }}>{filterMessage}</p>
      )}

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
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
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label>
            Started
            <select
              value={started}
              onChange={(e) => setStarted(e.target.value)}
            >
              <option value="">Started?</option>
              <option value="true">Started</option>
              <option value="false">Not started</option>
            </select>
          </label>

          <label>
            Ended
            <select
              value={ended}
              onChange={(e) => setEnded(e.target.value)}
            >
              <option value="">Ended?</option>
              <option value="true">Ended</option>
              <option value="false">Not ended</option>
            </select>
          </label>

          <label>
            Attended
            <select
              value={attended}
              onChange={(e) => setAttended(e.target.value)}
            >
              <option value="">Any</option>
              <option value="true">Joined</option>
              <option value="false">Not Joined</option>
            </select>
          </label>
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: "grid", gap: "16px" }}>
        {displayedEvents.map((event) => {
          const isJoined = myEventIds.has(event.id);

          return (
            <div
              key={event.id}
              style={{
                position: "relative",
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              {isJoined && (
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "#4caf50",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                  }}
                >
                  Attending
                </span>
              )}

              <h3>{event.name}</h3>
              <p>{event.description}</p>

              <p>
                <strong>Time:</strong>{" "}
                {event.startTime?.slice(0, 10)} → {event.endTime?.slice(0, 10)}
              </p>

              <p>
                <strong>Location:</strong> {event.location}
              </p>

              <p>
                <strong>Capacity:</strong> {event.numGuests}/{event.capacity}{" "}
                {event.numGuests >= event.capacity ? " (FULL)" : ""}
              </p>

              <Link to={`/events/${event.id}`}>
                <button style={{ marginTop: "10px" }}>View Details</button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div
        style={{
          marginTop: "25px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span>
          Page {page} / {totalPages}
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
