import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import "./EventCreate.css";

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
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // VALIDATION
    if (!name.trim()) {
      setError("Name is required.");
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      setLoading(false);
      return;
    }
    if (!location.trim()) {
      setError("Location is required.");
      setLoading(false);
      return;
    }
    if (!startTime) {
      setError("Start time is required.");
      setLoading(false);
      return;
    }
    if (!endTime) {
      setError("End time is required.");
      setLoading(false);
      return;
    }
    if (!points) {
      setError("Points are required.");
      setLoading(false);
      return;
    }

    if (new Date(startTime) < new Date()) {
      setError("Start time cannot be in the past.");
      setLoading(false);
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      setLoading(false);
      return;
    }

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
        setError("Failed to create event: " + JSON.stringify(created));
        setLoading(false);
        return;
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
          setError(`Event created but failed to add organizer: ${msg}`);
          setLoading(false);
          return;
        }
      }

      setSuccess("Event created successfully! ✨");
      // reset inputs
      setName("");
      setDescription("");
      setLocation("");
      setStartTime("");
      setEndTime("");
      setPoints("");
      setCapacity("");
      setOrganizerUtorid("");
      setLoading(false);

    } catch (err) {
      setError("Network error: " + err.message);
      setLoading(false);
    }
  };

  const message = error || success;
  const isSuccess = !!success && !error;

  return (
    <div className="create-event-page">
      <div className="create-event-header">
        <h1 className="create-event-title">Create Event 🎪</h1>
        <p className="create-event-subtitle">Set up a new event for your loyalty program</p>
      </div>

      <div className="create-event-card">
        <div className="create-event-icon">🎉</div>

        <form onSubmit={handleCreate}>
          <Input
            label="Event Name"
            placeholder="Enter event name"
            value={name}
            onChange={setName}
            required
          />

          {/* Description Textarea */}
          <div className="input-wrapper">
            <label className="input-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Enter event description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ 
                resize: "vertical",
                minHeight: "100px",
                fontFamily: "var(--font-sans)"
              }}
            />
          </div>

          <Input
            label="Location"
            placeholder="Enter event location"
            value={location}
            onChange={setLocation}
            required
          />

          <Input
            label="Start Time"
            type="datetime-local"
            value={startTime}
            onChange={setStartTime}
            required
          />

          <Input
            label="End Time"
            type="datetime-local"
            value={endTime}
            onChange={setEndTime}
            required
          />

          <Input
            label="Points"
            type="number"
            min="0"
            placeholder="Enter points to award"
            value={points}
            onChange={setPoints}
            required
          />

          <Input
            label="Capacity (Optional)"
            type="number"
            min="1"
            placeholder="Enter maximum capacity"
            value={capacity}
            onChange={setCapacity}
          />

          <Input
            label="Organizer UTORID (Optional)"
            placeholder="Enter organizer's UTORID"
            value={organizerUtorid}
            onChange={setOrganizerUtorid}
          />

          {message && (
            <div className={`alert ${isSuccess ? "alert-success" : "alert-error"}`} style={{ marginTop: "1rem" }}>
              {message}
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? "Creating..." : "Create Event"}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
