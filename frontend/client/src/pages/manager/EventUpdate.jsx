import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditPage.css";

function renderField(label, key, type, form, setForm) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={key}>{label}</label>
      {key === "description" ? (
        <textarea
          id={key}
          className="field-textarea"
          value={form[key] || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      ) : type === "select" ? (
        <select
          id={key}
          className="field-select"
          value={form[key] || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        >
          <option value="">No</option>
          <option value="true">Yes</option>
        </select>
      ) : (
        <input
          id={key}
          className="field-input"
          type={type}
          value={form[key] || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      )}
    </div>
  );
}

export default function EventUpdate() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [originalForm, setOriginalForm] = useState({});

  const [newGuest, setNewGuest] = useState("");
  const [message, setMessage] = useState("");


  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    capacity: "",
    points: "",
    published: "false",
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) return;

        const data = await res.json();
        setEvent(data);

        const formData = {
          name: data.name || "",
          description: data.description || "",
          location: data.location || "",
          startTime: data.startTime ? data.startTime.slice(0, 16) : "",
          endTime: data.endTime ? data.endTime.slice(0, 16) : "",
          capacity: data.capacity ?? "",
          points: data.points ?? "",
          published: data.published ? "true" : "",
        };
        setForm(formData);
        setOriginalForm(formData);
      })
      .finally(() => setLoading(false));
  }, [eventId, BACKEND_URL, token]);

  if (loading) {
    return (
      <div className="edit-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="edit-page">
        <div className="alert alert-error">Event not found.</div>
      </div>
    );
  }

  // -----------------------
  // PATCH (UPDATE)
  // -----------------------
  const handleUpdate = async () => {
    const payload = {};

    for (const key in form) {
      if (form[key] === event[key] || form[key] === "") continue;

      if (key === "startTime" || key === "endTime") {
        payload[key] = new Date(form[key]).toISOString();
      } else if (["capacity", "points"].includes(key)) {
        payload[key] = Number(form[key]);
      } else if (key === "published") {
        payload.published = true;
      } else {
        payload[key] = form[key];
      }
    }

    const res = await fetch(`${BACKEND_URL}/events/${eventId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

  if (res.status === 409) {
    setMessage("An event with the given credentials already exists.");
    return;
  }

  
    if (!res.ok) {
    setMessage("Update failed.");
    return;
    }

    // success — show message then navigate
    setMessage("Event updated successfully.");


    };

  // -----------------------
  // DELETE
  // -----------------------
  const handleDelete = async () => {
    if (!window.confirm("Are you sure to delete this event?")) return;

    const res = await fetch(`${BACKEND_URL}/events/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 204) {
      alert("Event deleted.");
      navigate("/manager/events");
    } else if (res.status === 400) {
      alert("Cannot delete: event is already published.");
    } else {
      alert("Delete failed.");
    }
  };




    const addGuest = async () => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}/guests`, {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ utorid: newGuest }),
    });

    if (res.status === 400) {
        setMessage("This user is already added as guest or is an organizer.");
        return;
    }

    if (res.status === 404) {
        setMessage("User not found or event not published.");
        return;
    }

    if (res.status === 410) {
        setMessage("Event is full or has ended.");
        return;
    }

    if (!res.ok) {
        setMessage("Failed to add guest.");
        return;
    }

    // Reload event after add
    const updated = await fetch(`${BACKEND_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    setEvent(updated);
    setNewGuest("");
    setMessage("Guest added successfully.");
    };

    const removeGuest = async (userId) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}/guests/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status !== 204) {
        setMessage("Failed to remove guest.");
        return;
    }

    // Reload event
    const updated = await fetch(`${BACKEND_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    setEvent(updated);
    };

    

  return (
    <div className="edit-page">
      <div className="edit-page-header">
        <h1 className="edit-page-title">🎪 Update Event</h1>
        <p className="edit-page-subtitle">Edit event details and manage guests</p>
      </div>

      {message && (
        <div className={message.includes("successfully") ? "alert alert-success" : "alert alert-error"}>
          {message}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
        <div className="edit-form-card">
          <h2 className="form-section-title">Event Details</h2>
          <div className="form-grid">
            {renderField("Name", "name", "text", form, setForm)}
            {renderField("Description", "description", "text", form, setForm)}
            {renderField("Location", "location", "text", form, setForm)}
            {renderField("Start Time", "startTime", "datetime-local", form, setForm)}
            {renderField("End Time", "endTime", "datetime-local", form, setForm)}
            {renderField("Capacity", "capacity", "number", form, setForm)}
            {renderField("Points", "points", "number", form, setForm)}
            {renderField("Publish", "published", "select", form, setForm)}
          </div>
        </div>

        <div className="info-section">
          <h3 className="info-section-title">📊 Points Information</h3>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-label">Points Remaining</span>
              <span className="info-value-large">{event.pointsRemain || 0}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Points Awarded</span>
              <span className="info-value-large">{event.pointsAwarded || 0}</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3 className="info-section-title">👥 Organizers</h3>
          {event.organizers.length === 0 ? (
            <p className="empty-info-text">No organizers assigned to this event.</p>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>UTORid</th>
                  </tr>
                </thead>
                <tbody>
                  {event.organizers.map((org) => (
                    <tr key={org.utorid}>
                      <td><strong>{org.name}</strong></td>
                      <td>{org.utorid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="edit-form-card">
          <h2 className="form-section-title">➕ Add Guest</h2>
          <div className="field-group">
            <label className="field-label" htmlFor="newGuest">UTORid</label>
            <div className="add-guest-input-group">
              <input
                id="newGuest"
                className="field-input"
                value={newGuest}
                onChange={(e) => setNewGuest(e.target.value)}
                placeholder="Enter UTORid"
              />
              <button
                type="button"
                className="action-button primary"
                onClick={addGuest}
              >
                Add Guest
              </button>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3 className="info-section-title">🎫 Guests ({event.guests.length})</h3>
          {event.guests.length === 0 ? (
            <div className="empty-state-small">
              <p className="empty-info-text">No guests have joined this event yet.</p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>UTORid</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {event.guests.map((g) => (
                    <tr key={g.id}>
                      <td><strong>{g.name}</strong></td>
                      <td>{g.utorid}</td>
                      <td>
                        <button
                          type="button"
                          className="action-button danger small"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to remove this user from the event?")) {
                              removeGuest(g.id);
                            }
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button
            type="button"
            className="action-button secondary"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <button
            type="button"
            className="action-button secondary"
            onClick={() => setForm({ ...originalForm })}
          >
            Reset
          </button>
          <button
            type="submit"
            className="action-button primary"
          >
            Save Changes
          </button>
          <button
            type="button"
            className="action-button danger"
            onClick={handleDelete}
          >
            Delete Event
          </button>
        </div>
      </form>
    </div>
  );
}