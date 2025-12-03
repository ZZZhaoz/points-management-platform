import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "../../contexts/EventContext";
import { Card } from "../../components/global/Card";
import Button from "../../components/global/Button";
import Input from "../../components/global/Input";

export default function EventEdit() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { getEventById, updateEvent, addGuest } = useEvents();

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);   // 🌟 新增 success 状态
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [utorid, setUtorid] = useState("");

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

    const [prevFormData, setPrevFormData] = useState({ ...formData });

    useEffect(() => {
        loadEvent();
    }, [eventId]);

    const loadEvent = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const result = await getEventById(eventId);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        const eventData = result.data;

        const formatted = {
            name: eventData.name || "",
            description: eventData.description || "",
            location: eventData.location || "",
            startTime: eventData.startTime
                ? new Date(eventData.startTime).toISOString().slice(0, 16)
                : "",
            endTime: eventData.endTime
                ? new Date(eventData.endTime).toISOString().slice(0, 16)
                : "",
            capacity:
                eventData.capacity != null ? eventData.capacity.toString() : "",
            points:
                eventData.points != null ? eventData.points.toString() : "",
            published: eventData.published || false,
        };

        setFormData(formatted);
        setPrevFormData(formatted);
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        const updateData = {};

        if (formData.name.trim() !== "") updateData.name = formData.name.trim();
        if (formData.description.trim() !== "") updateData.description = formData.description.trim();
        if (formData.location.trim() !== "") updateData.location = formData.location.trim();

        if (formData.startTime.trim() !== "")
            updateData.startTime = new Date(formData.startTime).toISOString();

        if (formData.endTime.trim() !== "")
            updateData.endTime = new Date(formData.endTime).toISOString();

        if (formData.capacity.trim() !== "") {
            const c = parseInt(formData.capacity.trim(), 10);
            if (!isNaN(c) && c > 0) updateData.capacity = c;
        }

        if (formData.points.trim() !== "") {
            const p = parseFloat(formData.points.trim());
            if (!isNaN(p) && p > 0) updateData.points = p;
        }

        updateData.published = formData.published;

        const result = await updateEvent(eventId, updateData);

        if (result.error) {
            setError(result.error);
            setSaving(false);
            return;
        }

        setSuccess("Event updated successfully!");
        setSaving(false);
    };

    const addUser = async () => {
        setError(null);
        setSuccess(null);

        const res = await addGuest(eventId, { utorid });

        if (res.error) {
            setError(res.error);
            setUtorid("");
            return;
        }

        setSuccess("Guest added to event successfully!");
        setUtorid("");
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCancel = () => {
        setFormData({ ...prevFormData });
        setError(null);
        setSuccess(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>

            {/* ===== Success message ===== */}
            {success && (
                <div
                    style={{
                        background: "#e6ffe6",
                        color: "#0b730b",
                        padding: "1rem",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                        fontWeight: "600",
                    }}
                >
                    {success}
                </div>
            )}

            {/* ===== Error message ===== */}
            {error && (
                <div
                    style={{
                        background: "#ffe5e5",
                        color: "#b00000",
                        padding: "1rem",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                        fontWeight: "600",
                    }}
                >
                    {error}
                </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
                <Button
                    onClick={() => navigate(`/organizer/events/${eventId}`)}
                    variant="secondary"
                >
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
                    onChange={(value) =>
                        handleInputChange("startTime", value)
                    }
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
                    onChange={(value) =>
                        handleInputChange("capacity", value)
                    }
                    placeholder="Leave empty for unlimited"
                />

                <Input
                    label="Points"
                    type="number"
                    value={formData.points}
                    onChange={(value) => handleInputChange("points", value)}
                    placeholder="Total points for event"
                />

                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "1rem",
                        marginBottom: "1rem",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) =>
                            handleInputChange("published", e.target.checked)
                        }
                    />
                    <span>Published</span>
                </label>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="secondary"
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                </div>
            </Card>

            {/* ===== Add Guest Section ===== */}
            <Card style={{ marginTop: "1.5rem" }}>
                <Input
                    label="Add Guest by UTORid"
                    value={utorid}
                    onChange={(v) => setUtorid(v)}
                    placeholder="Enter UTORid"
                />

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <Button onClick={addUser} variant="secondary">
                        Add Guest
                    </Button>
                </div>
            </Card>
        </div>
    );
}
