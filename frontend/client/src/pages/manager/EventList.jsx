import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  if (loading) return <p>Loading events...</p>;

  const totalPages = Math.ceil(totalCount / filters.limit);

  return (
    <div>
      <h1>All Events</h1>

      {error && <p >{error}</p>}
      {success && <p >{success}</p>}

      {/* NAME FILTER */}
      <label>Name: </label>
      <input
        value={filters.name}
        onChange={(e) => setFilters({ ...filters, name: e.target.value, page: 1 })}
      />

      <br />

      {/* LOCATION FILTER */}
      <label>Location: </label>
      <input
        value={filters.location}
        onChange={(e) => setFilters({ ...filters, location: e.target.value, page: 1 })}
      />

      <br />

      {/* STARTED FILTER */}
      <label>Started: </label>
      <select
        value={filters.started}
        onChange={(e) => setFilters({ ...filters, started: e.target.value, page: 1 })}
      >
        <option value="">All</option>
        <option value="true">Started</option>
        <option value="false">Not Started</option>
      </select>

      <br />

      {/* ENDED FILTER */}
      <label>Ended: </label>
      <select
        value={filters.ended}
        onChange={(e) => setFilters({ ...filters, ended: e.target.value, page: 1 })}
      >
        <option value="">All</option>
        <option value="true">Ended</option>
        <option value="false">Not Ended</option>
      </select>

      <br />

      {/* FULL FILTER */}
      <label>Show Full: </label>
      <select
        value={filters.showFull}
        onChange={(e) => setFilters({ ...filters, showFull: e.target.value, page: 1 })}
      >
        <option value="">All</option>
        <option value="true">Full</option>
        <option value="false">Not Full</option>
      </select>

      <br />

      {/* PUBLISHED FILTER */}
      <label>Published: </label>
      <select
        value={filters.published}
        onChange={(e) => setFilters({ ...filters, published: e.target.value, page: 1 })}
      >
        <option value="">All</option>
        <option value="true">Published</option>
        <option value="false">Not Published</option>
      </select>

      <br /><br />

      <label>Items per page: </label>
      <select
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

      <br /><br />


        
      {/* TABLE */}
      {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
      <table border="1">
        <thead>
            <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Start</th>
            <th>End</th>
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
                <td>{ev.name}</td>
                <td>{ev.location}</td>
                <td>{ev.startTime}</td>
                <td>{ev.endTime}</td>
                <td>{ev.capacity ?? "-"}</td>
                <td>{ev.numGuests}</td>
                <td>{ev.pointsRemain}</td>
                <td>{ev.pointsAwarded}</td>
                <td>{ev.published ? "Yes" : "No"}</td>

                <td>
                <Link to={`/manager/events/${ev.id}`}>Edit</Link>
                </td>
            </tr>
            ))}
        </tbody>
      </table>
        )}

  

      {/* PAGINATION */}
      <br />
      <button
        disabled={filters.page === 1}
        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
      >
        Previous
      </button>

      <span>
        Page {filters.page} of {totalPages || 1}
      </span>

      <button
        disabled={filters.page >= totalPages}
        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
      >
        Next
      </button>
    </div>
  );
}