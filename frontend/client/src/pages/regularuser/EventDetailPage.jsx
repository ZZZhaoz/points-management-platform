import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [event, setEvent] = useState(null);
  const [attending, setAttending] = useState(false);
  const [message, setMessage] = useState("");

  // Load event details
  useEffect(() => {
    fetch(`${BACKEND_URL}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) setEvent(data);
        else setMessage("Failed to load event.");
      })
      .catch(() => setMessage("Network error."));
  }, [eventId]);

  // Check if user already RSVPed
  useEffect(() => {
    fetch(`${BACKEND_URL}/users/me/events`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAttending(data.includes(Number(eventId)));
        }
      })
      .catch(() => {});
  }, [eventId]);

  // RSVP 
  const handleJoin = async () => {
    setMessage("");

    if (event.numGuests >= event.capacity) {
      setMessage("This event is full.");
      return;
    }

    const res = await fetch(`${BACKEND_URL}/events/${eventId}/guests/me`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setAttending(true);
      setEvent({ ...event, numGuests: event.numGuests + 1 });
      setMessage("Successfully joined the event!");
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to join.");
    }
  };

  // ⭐ 4. Cancel RSVP
  const handleCancel = async () => {
    setMessage("");

    const res = await fetch(`${BACKEND_URL}/events/${eventId}/guests/me`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setAttending(false);
      setEvent({ ...event, numGuests: event.numGuests - 1 });
      setMessage("You have left the event.");
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to cancel.");
    }
  };

  if (!event) return <p>Loading event...</p>;

  const hasEnded = new Date(event.endTime) < new Date();

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>{event.name}</h2>
      <p>{event.description}</p>

      <p><strong>Location:</strong> {event.location}</p>
      <p>
        <strong>Time:</strong>{" "}
        {event.startTime?.slice(0, 10)} → {event.endTime?.slice(0, 10)}
      </p>

      <p>
        <strong>Capacity:</strong> {event.numGuests}/{event.capacity}{" "}
        {event.numGuests >= event.capacity ? "(FULL)" : ""}
      </p>

      {hasEnded ? (
        <button
          disabled
          style={{
            padding: "10px 20px",
            background: "#777",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "20px",
            cursor: "not-allowed"
          }}
        >
          Event Ended
        </button>
      ) : attending ? (
        <button
          onClick={handleCancel}
          style={{
            padding: "10px 20px",
            background: "#ff5252",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "20px"
          }}
        >
          Cancel RSVP
        </button>
      ) : (
        <button
          onClick={handleJoin}
          disabled={event.numGuests >= event.capacity}
          style={{
            padding: "10px 20px",
            background: event.numGuests >= event.capacity ? "#999" : "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "20px"
          }}
        >
          Join Event (RSVP)
        </button>
      )}

      {message && (
        <p style={{ marginTop: "15px", color: "green", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
}
