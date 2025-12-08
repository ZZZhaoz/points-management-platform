import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/global/Button";
import "./EventDetailPage.css";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [event, setEvent] = useState(null);
  const [attending, setAttending] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load event details
  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setEvent(data);
          setMessage("");
        } else {
          setMessage("Failed to load event.");
        }
      })
      .catch(() => setMessage("Network error."))
      .finally(() => setLoading(false));
  }, [eventId, BACKEND_URL, token]);

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
  }, [eventId, BACKEND_URL, token]);

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

  // Cancel RSVP
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <div className="empty-state-title">Event not found</div>
          <div className="empty-state-text">{message || "Unable to load event details"}</div>
        </div>
      </div>
    );
  }

  const hasEnded = new Date(event.endTime) < new Date();
  const isFull = event.numGuests >= event.capacity;
  const isSuccess = message && (message.includes("Successfully") || message.includes("left"));

  return (
    <div className="event-detail-page">
      <div className="event-detail-header">
        <h1 className="event-detail-title">{event.name} 🎪</h1>
      </div>

      <div className="event-detail-card">
        <p className="event-description-large">{event.description}</p>

        <div className="event-detail-info">
          <div className="event-detail-item">
            <strong>Location:</strong>
            <span>{event.location}</span>
          </div>

          <div className="event-detail-item">
            <strong>Time:</strong>
            <span>
              {new Date(event.startTime).toLocaleString()} → {new Date(event.endTime).toLocaleString()}
            </span>
          </div>

          <div className="event-detail-item">
            <strong>Capacity:</strong>
            <span className={isFull ? "capacity-full" : ""}>
              {event.numGuests}/{event.capacity}
              {isFull && " (FULL)"}
            </span>
          </div>

          {attending && (
            <div className="event-detail-item">
              <strong>Status:</strong>
              <span className="badge badge-success">You are attending this event</span>
            </div>
          )}
        </div>

        {message && (
          <div className={`alert ${isSuccess ? "alert-success" : "alert-error"}`}>
            {message}
          </div>
        )}

        <div className="event-actions">
          {hasEnded ? (
            <Button disabled variant="secondary" style={{ width: "100%" }}>
              Event Ended
            </Button>
          ) : attending ? (
            <Button
              onClick={handleCancel}
              variant="error"
              style={{ width: "100%" }}
            >
              Cancel RSVP
            </Button>
          ) : (
            <Button
              onClick={handleJoin}
              disabled={isFull}
              variant={isFull ? "secondary" : "success"}
              style={{ width: "100%" }}
            >
              {isFull ? "Event Full" : "Join Event (RSVP)"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
