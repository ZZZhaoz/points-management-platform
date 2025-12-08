import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "../../contexts/EventContext";
import { Card } from "../../components/global/Card";
import Button from "../../components/global/Button";
import "./OrganizerPage.css";

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
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading event details...</p>
                </div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="page-container">
                <div className="alert alert-error">{error}</div>
                <Button onClick={() => navigate("/organizer/events")} variant="secondary" style={{ marginTop: "1rem" }}>
                    ← Back to Events
                </Button>
            </div>
        );
    }

    if (!event) return null;

    const hasStarted = new Date(event.startTime) < new Date();

    return (
        <div className="organizer-page">
            <div className="back-button-container">
                <Button onClick={() => navigate("/organizer/events")} variant="secondary">
                    ← Back to Events
                </Button>
            </div>

            <div className="organizer-header">
                <h1 className="organizer-title">{event.name} 🎪</h1>
                <p className="organizer-subtitle">Event Details & Management</p>
            </div>

            <Card>
                <div className="action-buttons">
                    <Button onClick={() => navigate(`/organizer/events/${eventId}/award-points`)} variant="success">
                        Award Points
                    </Button>
                    <Button onClick={() => navigate(`/organizer/events/${eventId}/edit`)} variant="primary">
                        Edit Event
                    </Button>
                </div>

                <div className="event-info-grid">
                    <div className="event-info-item">
                        <strong>Description:</strong>
                        <span>{event.description || "No description"}</span>
                    </div>

                    <div className="event-info-item">
                        <strong>Location:</strong>
                        <span>{event.location}</span>
                    </div>

                    <div className="event-info-item">
                        <strong>Start Time:</strong>
                        <span>{formatDate(event.startTime)}</span>
                    </div>

                    <div className="event-info-item">
                        <strong>End Time:</strong>
                        <span>{formatDate(event.endTime)}</span>
                    </div>

                    {event.capacity !== null && (
                        <div className="event-info-item">
                            <strong>Capacity:</strong>
                            <span>{event.numGuests || 0} / {event.capacity}</span>
                        </div>
                    )}

                    {event.pointsAwarded !== null && (
                        <div className="event-info-item">
                            <strong>Points Awarded:</strong>
                            <span>{event.pointsAwarded}</span>
                        </div>
                    )}

                    {event.pointsRemain !== undefined && (
                        <div className="event-info-item">
                            <strong>Points Remaining:</strong>
                            <span>{event.pointsRemain}</span>
                        </div>
                    )}

                    <div className="event-info-item">
                        <strong>Published:</strong>
                        <span>
                            {event.published ? (
                                <span className="badge badge-success">Yes</span>
                            ) : (
                                <span className="badge badge-gray">No</span>
                            )}
                        </span>
                    </div>

                    {event.organizers && event.organizers.length > 0 && (
                        <div className="event-info-item">
                            <strong>Organizers:</strong>
                            <span>{event.organizers.map((org) => org.name).join(", ")}</span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

