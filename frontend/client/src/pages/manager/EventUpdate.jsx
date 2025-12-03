import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function renderField(label, key, type, form, setForm, editing, setEditing, tempValues, setTempValues) {
  const isEditing = editing[key];
  const value = form[key];

  let displayValue;
  if (value !== "" && value !== null && value !== undefined) {
    displayValue = value;
  } else if (["published"].includes(key)) {
    displayValue = "No";
  } else if (["capacity", "points"].includes(key)) {
    displayValue = "Not provided";
  } else {
    displayValue = "(empty)";
  }

  const startEditing = () => {
    setTempValues({ ...tempValues, [key]: value }); // store original
    setEditing({ ...editing, [key]: true });
  };

  const saveChanges = () => {
    setEditing({ ...editing, [key]: false });
  };

  const cancelChanges = () => {
    setForm({ ...form, [key]: tempValues[key] }); // restore original
    setEditing({ ...editing, [key]: false });
  };

  return (
    <div>
      <label>{label}: </label>

      {!isEditing && (
        <>
          <span>{displayValue}</span>
          <button type="button" onClick={startEditing}>Edit</button>
        </>
      )}

      {isEditing && (
        <div>
          {key === "description" ? (
            <textarea
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ) : type === "select" ? (
            <select
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            >
              <option value="">--</option>
              <option value="true">Yes</option>
            </select>
          ) : (
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          )}

          <button type="button" onClick={saveChanges}>Save</button>
          <button type="button" onClick={cancelChanges}>Cancel</button>
        </div>
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
  const [tempValues, setTempValues] = useState({});

  const [newGuest, setNewGuest] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState({
    name: false,
    description: false,
    location: false,
    startTime: false,
    endTime: false,
    capacity: false,
    points: false,     // manager-only
    published: false,  // manager-only (can only set true)
  });


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

        setForm({
          name: data.name || "",
          description: data.description || "",
          location: data.location || "",
          startTime: data.startTime ? data.startTime.slice(0, 16) : "",
          endTime: data.endTime ? data.endTime.slice(0, 16) : "",
          capacity: data.capacity ?? "",
          points: data.points ?? "",
          published: data.published ? "true" : "",
        });
      })
      .finally(() => setLoading(false));
  }, [eventId, BACKEND_URL, token]);

  if (loading) return <p>Loading event...</p>;
  if (!event) return <p>Event not found.</p>;

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
    <div>
      <h1>Update Event</h1>

      {message && (
        <p>
            {message}
        </p>
        )}

      {renderField("Name", "name", "text", form, setForm, editing, setEditing, tempValues, setTempValues)}
      {renderField("Description", "description", "text", form, setForm, editing, setEditing, tempValues, setTempValues)}
      {renderField("Location", "location", "text", form, setForm, editing, setEditing, tempValues, setTempValues)}
      {renderField("Start Time", "startTime", "datetime-local", form, setForm, editing, setEditing, tempValues, setTempValues)}
      {renderField("End Time", "endTime", "datetime-local", form, setForm, editing, setEditing, tempValues, setTempValues)}
      {renderField("Capacity", "capacity", "number", form, setForm, editing, setEditing, tempValues, setTempValues)}
      {renderField("Points", "points", "number", form, setForm, editing, setEditing, tempValues, setTempValues)}
      {renderField("Publish", "published", "select", form, setForm, editing, setEditing, tempValues, setTempValues)}

      <br />


      <h3>Points Info</h3>
      <p>Points Remaining: {event.pointsRemain}</p>
      <p>Points Awarded: {event.pointsAwarded}</p>

      <h3>Organizers</h3>

      <table border="1">
      <thead>
          <tr>
          <th>Name</th>
          <th>UTORid</th>
          </tr>
      </thead>

      <tbody>
          {event.organizers.map((org) => (
          <tr key={org.utorid}>
              <td>{org.name}</td>
              <td>{org.utorid}</td>
          </tr>
          ))}
      </tbody>
    </table>
    

    <h4>Add Guest</h4>
    <input
        value={newGuest}
        onChange={(e) => setNewGuest(e.target.value)}
        placeholder="Enter UTORid"
    />
    <button type="button" onClick={addGuest}>
    Add Guest
    </button>


    <h3>Guests</h3>
    {event.guests.length === 0 && (
        <p>No guests have joined this event yet.</p>
    )}

    {event.guests.length > 0 && (
    <table border="1">
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
            <td>{g.name}</td>
            <td>{g.utorid}</td>
            <td>
                <button type="button" onClick={() => {
                    if (window.confirm("Are you sure you want to remove this user from the event?")){
                    removeGuest(g.id)}}}>
                Remove
                </button>
            </td>
            </tr>
        ))}
        </tbody>
    </table>
    )}

    <br></br>

        <button type="button" onClick={() => navigate(-1)}>
        Back
        </button>

      <button onClick={handleUpdate}>Save Changes</button>
      <button type="button" onClick={handleDelete}>Delete Event</button>
      </div>
);
}