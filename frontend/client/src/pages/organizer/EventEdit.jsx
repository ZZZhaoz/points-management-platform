import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";

export default function EventEdit() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { getEventById, updateEvent, addGuest } = useAuth();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [utorid, setUtorid] = useState(null);
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
    const [prevFormData, setPrevFormData] = useState({
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
            alert("Error: " + result.error);
        } else {
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

            setPrevFormData({
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

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        // Prepare update data - only include fields that are provided
        const updateData = {};

        // Only include name if it's provided and not empty
        if (formData.name && formData.name.trim() !== "") {
            updateData.name = formData.name.trim();
        }

        // Only include description if it's provided and not empty
        if (formData.description && formData.description.trim() !== "") {
            updateData.description = formData.description.trim();
        }

        // Only include location if it's provided and not empty
        if (formData.location && formData.location.trim() !== "") {
            updateData.location = formData.location.trim();
        }

        // Only include startTime if it's provided
        if (formData.startTime && formData.startTime.trim() !== "") {
            updateData.startTime = new Date(formData.startTime).toISOString();
        }

        // Only include endTime if it's provided
        if (formData.endTime && formData.endTime.trim() !== "") {
            updateData.endTime = new Date(formData.endTime).toISOString();
        }

        // Handle capacity - only include if not empty, otherwise don't include (don't send null)
        if (formData.capacity && formData.capacity.toString().trim() !== "") {
            const capacityNum = parseInt(formData.capacity.toString().trim(), 10);
            if (!isNaN(capacityNum) && capacityNum > 0) {
                updateData.capacity = capacityNum;
            }
        }
        // If empty, don't include capacity field at all (backend will keep existing value)

        // Handle points - only include if not empty
        if (formData.points && formData.points.toString().trim() !== "") {
            const pointsNum = parseFloat(formData.points.toString().trim());
            if (!isNaN(pointsNum) && pointsNum > 0) {
                updateData.points = pointsNum;
            }
        }

        // Handle published - ensure it's a boolean
        if (typeof formData.published === "boolean") {
            updateData.published = formData.published;
        }

        const result = await updateEvent(eventId, updateData);

        if (result.error) {
            alert("Error: " + result.error);
            setError(result.error);
            setSaving(false);
        } else {
            // Success 
            alert("Success!");
            setSaving(false);
        }
    };


    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCancel = () => {
        setFormData({ ...prevFormData });
    };

    const addUser = async() => {
        const res = await addGuest(eventId, { utorid });

        if (res.error) {
            setError(res.error);
            setUtorid(null);
            alert("Error: " + res.error);
        } else {
            // Success 
            alert("Success to add guest to the event");
            setUtorid(null);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: "1rem" }}>
                <Button onClick={() => navigate(`/organizer/events/${eventId}`)} variant="secondary">
                    ← Back to Event
                </Button>
            </div>

            <h1>Edit Event</h1>

            <Card>
                <Input
                    label="Event Name"
                    value={formData.name}
                    onChange={(value) => handleInputChange("name", value)}
                />

                <Input
                    label="Description"
                    value={formData.description}
                    onChange={(value) => handleInputChange("description", value)}
                />

                <Input
                    label="Location"
                    value={formData.location}
                    onChange={(value) => handleInputChange("location", value)}
                />

                <Input
                    label="Start Time"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(value) => handleInputChange("startTime", value)}
                />

                <Input
                    label="End Time"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(value) => handleInputChange("endTime", value)}
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

                {/* {error && <div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>} */}

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={handleCancel} variant="secondary" disabled={saving}>
                        Cancel
                    </Button>
                </div>
            </Card>
            <Card>
                <input
                    value={utorid || ""}
                    onChange={(e) => setUtorid(e.target.value)}
                    placeholder="Add a guest's utorid"
                />

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <Button onClick={addUser} variant="secondary">
                        Add
                    </Button>
                </div>
            </Card>
        </div>
    );
}