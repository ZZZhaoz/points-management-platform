import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Events.css";
import { useEvents } from "../../contexts/EventContext";
import { Card } from "../../components/global/Card";

export default function Events() {
  const { getMyEvents } = useEvents();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    const result = await getMyEvents();
    
    if (result.error) {
      setError(result.error);
    } else {
      setEvents(result.data || []);
    }
    setLoading(false);
  };

  const handleEventClick = (eventId) => {
    navigate(`/organizer/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="organizer-events-page">
      <div className="organizer-events-header">
        <h1 className="organizer-events-title">My Organized Events 👔</h1>
        <p className="organizer-events-subtitle">Manage events you're organizing</p>
      </div>
      
      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">No events yet</div>
          <div className="empty-state-text">You are not organizing any events.</div>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-card-clickable"
              onClick={() => handleEventClick(event.id)}
            >
              <h2>🎪 {event.name}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

