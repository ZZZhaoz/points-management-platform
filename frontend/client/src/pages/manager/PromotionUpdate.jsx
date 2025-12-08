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
          <option value="automatic">Automatic</option>
          <option value="onetime">One-Time</option>
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

export default function PromotionUpdate() {
  const { promotionId } = useParams();
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState(null);
  const [originalForm, setOriginalForm] = useState({});

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
        const formData = {
          name: data.name || "",
          description: data.description || "",
          type: data.type || "",
          startTime: data.startTime ? data.startTime.slice(0, 16) : "",
          endTime: data.endTime ? data.endTime.slice(0, 16) : "",
          minSpending: data.minSpending ?? "",
          rate: data.rate ?? "",
          points: data.points ?? "",
        };
        setForm(formData);
        setOriginalForm(formData);
      })
      .finally(() => setLoading(false));
  }, [promotionId, BACKEND_URL, token]);

  if (loading) {
    return (
      <div className="edit-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading promotion...</p>
        </div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="edit-page">
        <div className="alert alert-error">Promotion not found.</div>
      </div>
    );
  }


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

        // Normalize type for comparison
        let formValue = form[key];
        let promotionValue = promotion[key];
        
        if (key === "type") {
          // Both should be "onetime" for comparison
          formValue = formValue === "one-time" ? "onetime" : formValue;
        }

        if (formValue !== promotionValue) {

            if (key === "startTime" || key === "endTime") {
            payload[key] = new Date(form[key]).toISOString();

            } else if (["minSpending", "rate", "points"].includes(key)) {
            payload[key] = Number(form[key]);

            } else if (key === "type") {
            // Ensure we send "onetime" to backend
            payload[key] = form[key] === "one-time" ? "onetime" : form[key];

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

    setSuccess("Promotion updated successfully!");
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


  const message = error || success;
  const isSuccess = !!success && !error;

  return (
    <div className="edit-page">
      <div className="edit-page-header">
        <h1 className="edit-page-title">🎁 Update Promotion</h1>
        <p className="edit-page-subtitle">Edit promotion details and settings</p>
      </div>

      {message && (
        <div className={isSuccess ? "alert alert-success" : "alert alert-error"}>
          {message}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
        <div className="edit-form-card">
          <h2 className="form-section-title">Promotion Details</h2>
          <div className="form-grid">
            {renderField("Name", "name", "text", form, setForm)}
            {renderField("Description", "description", "text", form, setForm)}
            {renderField("Type", "type", "select", form, setForm)}
            {renderField("Start Time", "startTime", "datetime-local", form, setForm)}
            {renderField("End Time", "endTime", "datetime-local", form, setForm)}
            {renderField("Minimum Spending", "minSpending", "number", form, setForm)}
            {renderField("Rate", "rate", "number", form, setForm)}
            {renderField("Points", "points", "number", form, setForm)}
          </div>
        </div>

        <div className="action-buttons">
          <button type="button" className="action-button secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <button type="button" className="action-button secondary" onClick={() => setForm({ ...originalForm })}>
            Reset
          </button>
          <button type="submit" className="action-button primary">
            💾 Save Changes
          </button>
          <button type="button" className="action-button danger" onClick={handleDelete}>
            🗑️ Delete Promotion
          </button>
        </div>
      </form>
    </div>
  );
}