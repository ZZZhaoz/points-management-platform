import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "../../contexts/EventContext";
import { Card } from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";
import "./OrganizerPage.css";

export default function AwardPoints() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { awardPoints, getEventById } = useEvents();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [awarding, setAwarding] = useState(false);
  const [awardError, setAwardError] = useState(null);
  const [awardSuccess, setAwardSuccess] = useState(null);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    setError(null);
    setAwardError(null);
    
    const result = await getEventById(eventId);
    
    if (result.error) {
      setError(result.error);
    } else {
      setEvent(result.data);
    }
    setLoading(false);
  };

  const handleAwardToGuest = async (utorid) => {
    if (!pointsAmount || parseInt(pointsAmount) <= 0) {
      setAwardError("Please enter a valid points amount");
      return;
    }

    setAwarding(true);
    setAwardError(null);
    setAwardSuccess(null);

    const result = await awardPoints(event.id, {
      type: "event",
      utorid: utorid,
      amount: parseInt(pointsAmount),
      remark: remark || "",
    });

    setAwarding(false);

    if (result.error) {
      setAwardError(result.error);
    } else {
      setAwardSuccess(`Successfully awarded ${pointsAmount} points to ${utorid}`);
      console.log(`Awarded ${pointsAmount} points to ${utorid}:`, result.data || result);

      setPointsAmount("");
      setRemark("");
      await loadEvent();
    }
  };

  const handleAwardToAll = async () => {
    if (!pointsAmount || parseInt(pointsAmount) <= 0) {
      setAwardError("Please enter a valid points amount");
      return;
    }

    if (!event.guests || event.guests.length === 0) {
      setAwardError("No guests to award points to");
      return;
    }

    setAwarding(true);
    setAwardError(null);
    setAwardSuccess(null);

    const result = await awardPoints(event.id, {
      type: "event",
      amount: parseInt(pointsAmount),
      remark: remark || "",
    });

    setAwarding(false);

    if (result.error) {
      setAwardError(result.error);
    } else {
      setAwardSuccess(`Successfully awarded ${pointsAmount} points to all ${event.guests.length} guests`);
      setPointsAmount("");
      setRemark("");
      // Reload event to get updated points
      await loadEvent();
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

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
        <Button onClick={() => navigate(`/organizer/events/${eventId}`)} variant="secondary" style={{ marginTop: "1rem" }}>
          ← Back to Event Detail
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <div className="empty-state-title">Event not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="organizer-page">
      <div className="back-button-container">
        <Button 
          onClick={() => navigate(`/organizer/events/${eventId}`)} 
          variant="secondary"
        >
          ← Back to Event Detail
        </Button>
      </div>

      <div className="organizer-header">
        <h1 className="organizer-title">Award Points ⭐</h1>
        <p className="organizer-subtitle">{event.name}</p>
      </div>
      
      <Card style={{ marginBottom: "2rem" }}>
        <div className="event-info-grid">
          <div className="event-info-item">
            <strong>Points Remaining:</strong>
            <span style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--primary)" }}>
              {event.pointsRemain}
            </span>
          </div>
          <div className="event-info-item">
            <strong>Points Awarded:</strong>
            <span>{event.pointsAwarded || 0}</span>
          </div>
          <div className="event-info-item">
            <strong>Guests (RSVPed):</strong>
            <span>{event.guests?.length || 0}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 style={{ marginBottom: "1.5rem" }}>Award Points</h2>
        
        <Input
          label="Points Amount"
          type="number"
          value={pointsAmount}
          onChange={setPointsAmount}
          placeholder="Enter points to award"
          required
        />

        <Input
          label="Remark (Optional)"
          type="text"
          value={remark}
          onChange={setRemark}
          placeholder="Enter remark"
        />

        {awardError && (
          <div className="alert alert-error" style={{ marginTop: "1rem" }}>
            {awardError}
          </div>
        )}

        {awardSuccess && (
          <div className="alert alert-success" style={{ marginTop: "1rem" }}>
            {awardSuccess}
          </div>
        )}

        <div style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
          <Button
            onClick={handleAwardToAll}
            disabled={awarding || !event.guests || event.guests.length === 0}
            variant="success"
            style={{ width: "100%" }}
          >
            {awarding ? "Awarding..." : `Award to All Guests (${event.guests?.length || 0})`}
          </Button>
        </div>

        <h3 style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "2px solid var(--border-light)" }}>
          👥 Guests List
        </h3>
        {event.guests && event.guests.length > 0 ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {event.guests.map((guest) => (
              <Card
                key={guest.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                }}
              >
                <div>
                  <p style={{ margin: "0.25rem 0", fontWeight: "600" }}>{guest.name}</p>
                  <p style={{ margin: "0.25rem 0", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
                    UTORid: {guest.utorid}
                  </p>
                </div>
                <Button
                  onClick={() => handleAwardToGuest(guest.utorid)}
                  disabled={awarding || !pointsAmount || parseInt(pointsAmount) <= 0}
                  variant="primary"
                  size="sm"
                >
                  ⭐ Award
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "2rem" }}>
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">No guests have RSVPed to this event yet.</div>
          </div>
        )}
      </Card>
    </div>
  );
}
