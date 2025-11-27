import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEventById, updateEvent } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    capacity: "",
    points: "",
    published: false,
  });

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    setError(null);
    const result = await getEventById(eventId);
    
    if (result.error) {
      setError(result.error);
    } else {
      setEvent(result.data);
      // Populate form data
      const eventData = result.data;
      setFormData({
        name: eventData.name || "",
        description: eventData.description || "",
        location: eventData.location || "",
        startTime: eventData.startTime ? new Date(eventData.startTime).toISOString().slice(0, 16) : "",
        endTime: eventData.endTime ? new Date(eventData.endTime).toISOString().slice(0, 16) : "",
        capacity: eventData.capacity != null ? eventData.capacity.toString() : "",
        points: eventData.points != null ? eventData.points.toString() : "",
        published: eventData.published || false,
      });
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    // Prepare update data
    const updateData = {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      startTime: formData.startTime ? new Date(formData.startTime).toISOString() : undefined,
      endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
      capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
      points: formData.points ? parseFloat(formData.points) : undefined,
      published: formData.published,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await updateEvent(eventId, updateData);
    
    if (result.error) {
      setError(result.error);
      setSaving(false);
    } else {
      setIsEditing(false);
      await loadEvent(); // Reload event data
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original event data
    if (event) {
      setFormData({
        name: event.name || "",
        description: event.description || "",
        location: event.location || "",
        startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : "",
        endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : "",
        capacity: event.capacity != null ? event.capacity.toString() : "",
        points: event.points != null ? event.points.toString() : "",
        published: event.published || false,
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error && !event) {
    return (
      <div>
        <div>Error: {error}</div>
        <Button onClick={() => navigate("/organizer/events")}>Back to Events</Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <Button onClick={() => navigate("/organizer/events")} variant="secondary">
          ← Back to Events
        </Button>
      </div>

      <h1>Event Details</h1>

      {isEditing ? (
        <Card>
          <h2>Edit Event</h2>
          
          <Input
            label="Event Name"
            value={formData.name}
            onChange={(value) => handleInputChange("name", value)}
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(value) => handleInputChange("description", value)}
            required
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(value) => handleInputChange("location", value)}
            required
          />

          <Input
            label="Start Time"
            type="datetime-local"
            value={formData.startTime}
            onChange={(value) => handleInputChange("startTime", value)}
            required
          />

          <Input
            label="End Time"
            type="datetime-local"
            value={formData.endTime}
            onChange={(value) => handleInputChange("endTime", value)}
            required
          />

          <Input
            label="Capacity"
            type="number"
            value={formData.capacity}
            onChange={(value) => handleInputChange("capacity", value)}
            placeholder="Leave empty for unlimited"
          />

          <Input
            label="Points"
            type="number"
            value={formData.points}
            onChange={(value) => handleInputChange("points", value)}
            placeholder="Points for this event"
          />

          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => handleInputChange("published", e.target.checked)}
              />
              <span>Published</span>
            </label>
          </div>

          {error && <div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>}

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button onClick={handleCancel} variant="secondary" disabled={saving}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2>{event.name}</h2>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          </div>

          <p><strong>Description:</strong> {event.description}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Start Time:</strong> {formatDate(event.startTime)}</p>
          <p><strong>End Time:</strong> {formatDate(event.endTime)}</p>
          
          {event.capacity !== null && (
            <p><strong>Capacity:</strong> {event.numGuests || 0} / {event.capacity}</p>
          )}
          
          {event.points !== null && (
            <p><strong>Points:</strong> {event.points}</p>
          )}

          {event.pointsRemain !== undefined && (
            <p><strong>Points Remaining:</strong> {event.pointsRemain}</p>
          )}

          <p><strong>Published:</strong> {event.published ? "Yes" : "No"}</p>

          {event.organizers && event.organizers.length > 0 && (
            <p>
              <strong>Organizers:</strong>{" "}
              {event.organizers.map((org) => org.name).join(", ")}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

