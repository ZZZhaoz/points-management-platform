import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import "./PromotionCreate.css";

export default function PromotionsCreate() {
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Required fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("automatic");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  //optional fields
  const [minSpending, setMinSpending] = useState("");
  const [rate, setRate] = useState("");
  const [points, setPoints] = useState("");

  // use state for error and success message
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    // Prevent page reload
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name.trim()) {
      setError("Name is required.");
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      setLoading(false);
      return;
    }
    if (!startTime) {
      setError("Start time is required.");
      setLoading(false);
      return;
    }
    if (!endTime) {
      setError("End time is required.");
      setLoading(false);
      return;
    }

    if (new Date(startTime) < new Date()) {
      setError("Start time cannot be in the past.");
      setLoading(false);
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      setLoading(false);
      return;
    }

    // Build payload
    const payload = {
      name,
      description,
      type,
      startTime,
      endTime,
    };

    // If the optional fields exist, convert them to number
    if (minSpending) {
        payload.minSpending = Number(minSpending);
    }
    if (rate) {
        payload.rate = Number(rate);
    }
    if (points){
         payload.points = Number(points);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError("Failed to create promotion: " + msg);
        setLoading(false);
        return;
      }

      setSuccess("Promotion created successfully! ✨");

      // Reset the fields
      setName("");
      setDescription("");
      setType("automatic");
      setStartTime("");
      setEndTime("");
      setMinSpending("");
      setRate("");
      setPoints("");
      setLoading(false);
    } catch (err) {
      setError("Network error: " + err.message);
      setLoading(false);
    }
  };

  const message = error || success;
  const isSuccess = !!success && !error;

  return (
    <div className="create-promotion-page">
      <div className="create-promotion-header">
        <h1 className="create-promotion-title">Create Promotion 🎁</h1>
        <p className="create-promotion-subtitle">Set up a new promotion for your loyalty program</p>
      </div>

      <div className="create-promotion-card">
        <div className="create-promotion-icon">🎉</div>

        <form onSubmit={handleCreate}>
          <Input
            label="Promotion Name"
            placeholder="Enter promotion name"
            value={name}
            onChange={setName}
            required
          />

          {/* Description Textarea */}
          <div className="input-wrapper">
            <label className="input-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Enter promotion description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ 
                resize: "vertical",
                minHeight: "100px",
                fontFamily: "var(--font-sans)"
              }}
            />
          </div>

          {/* Type Select */}
          <div className="input-wrapper">
            <label className="input-label">
              Type <span className="required">*</span>
            </label>
            <select
              className="input-field"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="automatic">Automatic</option>
              <option value="one-time">One-Time</option>
            </select>
          </div>

          <Input
            label="Start Time"
            type="datetime-local"
            value={startTime}
            onChange={setStartTime}
            required
          />

          <Input
            label="End Time"
            type="datetime-local"
            value={endTime}
            onChange={setEndTime}
            required
          />

          <Input
            label="Min Spending (Optional)"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter minimum spending amount"
            value={minSpending}
            onChange={setMinSpending}
          />

          <Input
            label="Rate (Optional)"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter rate"
            value={rate}
            onChange={setRate}
          />

          <Input
            label="Points (Optional)"
            type="number"
            min="0"
            placeholder="Enter points"
            value={points}
            onChange={setPoints}
          />

          {message && (
            <div className={`alert ${isSuccess ? "alert-success" : "alert-error"}`} style={{ marginTop: "1rem" }}>
              {message}
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? "Creating..." : "Create Promotion"}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}