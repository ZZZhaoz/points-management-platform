import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function renderField(label, key, type, form, setForm, editing, setEditing, tempValues, setTempValues) {
  const isEditing = editing[key];
  const value = form[key];

  const startEditing = () => {
    setTempValues({ ...tempValues, [key]: value });  // store original
    setEditing({ ...editing, [key]: true });
  };

  const saveChanges = () => {
    setEditing({ ...editing, [key]: false });
  };

  const cancelChanges = () => {
    setForm({ ...form, [key]: tempValues[key] });    // restore original
    setEditing({ ...editing, [key]: false });
  };

  return (
    <div>
      <label>{label}: </label>

      {!isEditing && (
        <>
          <span>{value || "(empty)"} </span>
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
              <option value="automatic">Automatic</option>
              <option value="one-time">One-Time</option>
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

export default function PromotionUpdate() {
  const { promotionId } = useParams();
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState(null);
  const [tempValues, setTempValues] = useState({});

  // Use these states to keep track of which fields are being edited.
  const [editing, setEditing] = useState({
    name: false,
    description: false,
    type: false,
    startTime: false,
    endTime: false,
    minSpending: false,
    rate: false,
    points: false,
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    startTime: "",
    endTime: "",
    minSpending: "",
    rate: "",
    points: "",
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/promotions/${promotionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("Promotion not found");
          return;
        }

        const data = await res.json();
        setPromotion(data);

        // Fill in the form fields.
        setForm({
          name: data.name || "",
          description: data.description || "",
          type: data.type === "onetime" ? "one-time" : data.type,
          startTime: data.startTime ? data.startTime.slice(0, 16) : "",
          endTime: data.endTime ? data.endTime.slice(0, 16) : "",
          minSpending: data.minSpending ?? "",
          rate: data.rate ?? "",
          points: data.points ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [promotionId, BACKEND_URL, token]);

  if (loading) return <p>Loading promotion...</p>;
  if (!promotion) return <p>Promotion not found.</p>;


  // Update the promotion
  const handleUpdate = async () => {

    const payload = {};

    // Only send the data from the newly updated field to the backend
    for (const key in form) {

        // If the user leaves a field empty, dont update
        if (form[key] === "") {
            setError(`${key} cannot be empty.`);
            setSuccess("");
            return;   // stop the update entirely
        }

        if (form[key] !== promotion[key]) {

            if (key === "startTime" || key === "endTime") {
            payload[key] = new Date(form[key]).toISOString();

            } else if (["minSpending", "rate", "points"].includes(key)) {
            payload[key] = Number(form[key]);

            } else {
            payload[key] = form[key];
            }
        }
    }

    const res = await fetch(`${BACKEND_URL}/promotions/${promotionId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError("Update failed!");
      setSuccess("");
      return;
    }

    setSuccess("Promotion updated!");
    setError("");
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) return;

    const res = await fetch(`${BACKEND_URL}/promotions/${promotionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 204) {
      alert("Promotion deleted.");
      navigate("/manager/promotions");
    } else if (res.status === 403) {
      alert("Cannot delete: promotion already started.");
    } else {
      alert("Delete failed.");
    }
  };


  return (
    <div>
      <h1>Update Promotion</h1>

    {error && <p >{error}</p>}
    {success && <p >{success}</p>}


    {renderField("Name", "name", "text", form, setForm, editing, setEditing, tempValues, setTempValues)}
    {renderField("Description", "description", "text", form, setForm, editing, setEditing, tempValues, setTempValues)}
    {renderField("Type", "type", "select", form, setForm, editing, setEditing, tempValues, setTempValues)}
    {renderField("Start Time", "startTime", "datetime-local", form, setForm, editing, setEditing, tempValues, setTempValues)}
    {renderField("End Time", "endTime", "datetime-local", form, setForm, editing, setEditing, tempValues, setTempValues)}
    {renderField("Minimum Spending", "minSpending", "number", form, setForm, editing, setEditing, tempValues, setTempValues)}
    {renderField("Rate", "rate", "number", form, setForm, editing, setEditing, tempValues, setTempValues)}
    {renderField("Points", "points", "number", form, setForm, editing, setEditing, tempValues, setTempValues)}

      <br />

      <button type="button" onClick={() => navigate(-1)}> Back </button>
      <button onClick={handleUpdate}>Save Changes</button>
      <button type="button" onClick={handleDelete}>
        Delete Promotion
      </button>
    </div>
  );
}