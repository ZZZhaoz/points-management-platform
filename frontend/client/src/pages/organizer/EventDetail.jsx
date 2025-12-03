import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "../../contexts/EventContext";
import { Card } from "../../components/global/Card";
import Button from "../../components/global/Button";

export default function EventDetail() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { getEventById } = useEvents();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [isEditing, setIsEditing] = useState(false);
    // const [saving, setSaving] = useState(false);

    // // Form state
    // const [formData, setFormData] = useState({
    //     name: "",
    //     description: "",
    //     location: "",
    //     startTime: "",
    //     endTime: "",
    //     capacity: "",
    //     points: "",
    //     published: false,
    // });
    // useEffect(() => {
    //     loadEvent();
    // }, []);

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
            // const eventData = result.data;
            // setFormData({
            //     name: eventData.name || "",
            //     description: eventData.description || "",
            //     location: eventData.location || "",
            //     startTime: eventData.startTime ? new Date(eventData.startTime).toISOString().slice(0, 16) : "",
            //     endTime: eventData.endTime ? new Date(eventData.endTime).toISOString().slice(0, 16) : "",
            //     capacity: eventData.capacity != null ? eventData.capacity.toString() : "",
            //     points: eventData.points != null ? eventData.points.toString() : "",
            //     published: eventData.published || false,
            // });
        }
        setLoading(false);
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

            <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2>{event.name}</h2>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Button onClick={() => navigate(`/organizer/events/${eventId}/award-points`)} variant="secondary">
                            Award Points
                        </Button>
                        <Button onClick={() => navigate(`/organizer/events/${eventId}/edit`)}>Edit</Button>
                    </div>
                </div>

                <p><strong>Description:</strong> {event.description}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Start Time:</strong> {formatDate(event.startTime)}</p>
                <p><strong>End Time:</strong> {formatDate(event.endTime)}</p>

                {event.capacity !== null && (
                    <p><strong>Capacity:</strong> {event.numGuests || 0} / {event.capacity}</p>
                )}

                {event.pointsAwarded !== null && (
                    <p><strong>Points:</strong> {event.pointsAwarded}</p>
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
        </div>
    );
}

