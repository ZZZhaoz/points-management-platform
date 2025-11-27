import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/global/Card";

export default function Events() {
  const { getMyEvents } = useAuth();
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>My Events (As Organizer)</h1>
      
      {events.length === 0 ? (
        <p>You are not organizing any events.</p>
      ) : (
        <div>
          {events.map((event) => (
            <Card 
              key={event.id} 
              onClick={() => handleEventClick(event.id)}
              style={{ cursor: "pointer", marginBottom: "1rem" }}
            >
              <h2>{event.name}</h2>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

