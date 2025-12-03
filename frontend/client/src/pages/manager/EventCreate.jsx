import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EventsCreate() {
  const navigate = useNavigate();

  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Required fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [points, setPoints] = useState("");

  // Optional field
  const [capacity, setCapacity] = useState("");

  // Organizer input
  const [organizerUtorid, setOrganizerUtorid] = useState("");

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // VALIDATION
    if (!name.trim()) return setError("Name is required.");
    if (!description.trim()) return setError("Description is required.");
    if (!location.trim()) return setError("Location is required.");
    if (!startTime) return setError("Start time is required.");
    if (!endTime) return setError("End time is required.");
    if (!points) return setError("Points are required.");

    if (new Date(startTime) < new Date())
      return setError("Start time cannot be in the past.");

    if (new Date(endTime) <= new Date(startTime))
      return setError("End time must be after start time.");

    const payload = {
      name,
      description,
      location,
      startTime,
      endTime,
      points: Number(points),
    };

    if (capacity.trim() !== "") {
      payload.capacity = Number(capacity);
    }

    try {
      // STEP 1 — create event
      const res = await fetch(`${BACKEND_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const created = await res.json();

      if (!res.ok) {
        return setError("Failed to create event: " + JSON.stringify(created));
      }

      const eventId = created.id;

      // STEP 2 — add organizer if input is not empty
      if (organizerUtorid.trim() !== "") {
        const orgRes = await fetch(
          `${BACKEND_URL}/events/${eventId}/organizers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ utorid: organizerUtorid }),
          }
        );

        if (!orgRes.ok) {
          const msg = await orgRes.text();
          return setError(
            `Event created but failed to add organizer: ${msg}`
          );
        }
      }

      setSuccess("Event created successfully!");
      // reset inputs
      setName("");
      setDescription("");
      setLocation("");
      setStartTime("");
      setEndTime("");
      setPoints("");
      setCapacity("");
      setOrganizerUtorid("");

    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  return (
    <div>
      <h1>Create Event</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleCreate}>
        {/* Event Name */}
        <div>
          <label>Name: </label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Description */}
        <div>
          <label>Description: </label><br />
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Location */}
        <div>
          <label>Location: </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Start Time */}
        <div>
          <label>Start Time: </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        {/* End Time */}
        <div>
          <label>End Time: </label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {/* Optional Capacity */}
        <div>
          <label>Capacity (optional): </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        {/* Required Points */}
        <div>
          <label>Points: </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </div>

        {/* Organizer */}
        <div>
          <label>Organizer UTORID (optional): </label>
          <input
            value={organizerUtorid}
            onChange={(e) => setOrganizerUtorid(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Create Event</button>
        <button type="button" onClick={() => navigate("/dashboard")}>
          Cancel
        </button>
      </form>
    </div>
  );
}
