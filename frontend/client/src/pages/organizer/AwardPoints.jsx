import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "../../contexts/EventContext";
import { Card } from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";

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
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <div>Error: {error}</div>
        <Button onClick={() => navigate(`/organizer/events/${eventId}`)} variant="secondary" style={{ marginTop: "1rem" }}>
          ← Back to Event Detail
        </Button>
      </div>
    );
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <Button 
        onClick={() => navigate(`/organizer/events/${eventId}`)} 
        variant="secondary" 
        style={{ marginBottom: "1rem" }}
      >
        ← Back to Event Detail
      </Button>
      
      <Card style={{ marginBottom: "2rem" }}>
        <h1>{event.name}</h1>
        <p><strong>Description:</strong> {event.description}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Points Remaining:</strong> {event.pointsRemain}</p>
        <p><strong>Points Awarded:</strong> {event.pointsAwarded}</p>
        <p><strong>Guests (RSVPed):</strong> {event.guests?.length || 0}</p>
      </Card>

      <Card>
        <h2>Award Points</h2>
        
        <div style={{ marginBottom: "1rem" }}>
          <Input
            label="Points Amount"
            type="number"
            value={pointsAmount}
            onChange={setPointsAmount}
            placeholder="Enter points to award"
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <Input
            label="Remark (Optional)"
            type="text"
            value={remark}
            onChange={setRemark}
            placeholder="Enter remark"
          />
        </div>

        {awardError && (
          <div style={{ color: "red", marginBottom: "1rem" }}>
            {awardError}
          </div>
        )}

        {awardSuccess && (
          <div style={{ color: "green", marginBottom: "1rem" }}>
            {awardSuccess}
          </div>
        )}

        <div style={{ marginBottom: "2rem" }}>
          <Button
            onClick={handleAwardToAll}
            disabled={awarding || !event.guests || event.guests.length === 0}
            style={{ marginRight: "1rem" }}
          >
            {awarding ? "Awarding..." : `Award to All Guests (${event.guests?.length || 0})`}
          </Button>
        </div>

        <h3>Guests List</h3>
        {event.guests && event.guests.length > 0 ? (
          <div>
            {event.guests.map((guest) => (
              <Card
                key={guest.id}
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p><strong>Name:</strong> {guest.name}</p>
                  <p><strong>UTORid:</strong> {guest.utorid}</p>
                </div>
                <Button
                  onClick={() => handleAwardToGuest(guest.utorid)}
                  disabled={awarding || !pointsAmount || parseInt(pointsAmount) <= 0}
                  variant="secondary"
                >
                  Award Points
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <p>No guests have RSVPed to this event yet.</p>
        )}
      </Card>
    </div>
  );
}
