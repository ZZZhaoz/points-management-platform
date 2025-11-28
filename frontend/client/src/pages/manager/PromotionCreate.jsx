import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const handleCreate = (e) => {
    // Prevent page reload
    e.preventDefault();
    setError("");


    if (!name.trim()) return setError("Name is required.");
    if (!description.trim()) return setError("Description is required.");
    if (!startTime) return setError("Start time is required.");
    if (!endTime) return setError("End time is required.");

    if (new Date(startTime) < new Date())
      return setError("Start time cannot be in the past.");

    if (new Date(endTime) <= new Date(startTime))
      return setError("End time must be after start time.");

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

    fetch(`${BACKEND_URL}/promotions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          setError("Failed to create promotion: " + msg);
          return;
        }

        setSuccess("Promotion created!");

        // Reset the fields
        setName("");
        setDescription("");
        setType("automatic");
        setStartTime("");
        setEndTime("");
        setMinSpending("");
        setRate("");
        setPoints("");

      })
      .catch((err) => setError("Network error: " + err.message));
  };

  return (
    <div>
      <h1>Create Promotion</h1>

      {error && (
        <p>{error}</p>
      )}

      {success && <p>{success}</p>}


      <form onSubmit={handleCreate}>

        {/* Promotion Name */}
        <div>
          <label>Name: </label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Promotion Description */}
        <div>
          <label>Description: </label><br />
          <textarea
            rows={3}
            style={{ width: "300px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Promotion Type */}
        <div>
          <label>Type: </label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="automatic">Automatic</option>
            <option value="one-time">One-Time</option>
          </select>
        </div>

        {/* Promotion Start Time */}
        <div>
          <label>Start Time: </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        {/* Promotion End Time */}
        <div>
          <label>End Time: </label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {/* OPTIONAL FIELDS */}

        <div>
          <label>Min Spending: </label>
          <input
            type="number"
            value={minSpending}
            onChange={(e) => setMinSpending(e.target.value)}
          />
        </div>

        <div>
          <label>Rate: </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>

        <div>
          <label>Points: </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Create Promotion</button>
        <button type="button" onClick={() => navigate("/dashboard")}>
          Cancel
        </button>

      </form>
    </div>
  );
}