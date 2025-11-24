import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RedemptionPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState(null);
  const [transactionId, setTransactionId] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!amount) {
      setMessage("Amount is required.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/users/me/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "redemption",
          amount: Number(amount),
          remark: remark || "",
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMessage("Redemption request created successfully!");
        setTransactionId(data.id);   

        return;
      }

      if (res.status === 400) {
        setMessage("Not enough points to redeem that amount.");
        return;
      }

      if (res.status === 403) {
        setMessage("Your account is not verified. Redemption forbidden.");
        return;
      }

      setMessage(data.error || "Redemption failed.");

    } catch (err) {
      console.error(err);
      setMessage("Network error.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Redeem Points</h2>
      <p>Request to redeem points. A cashier will process the redemption.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Amount</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Remark (optional)</label>
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. For gifts"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 15px",
            background: "#28a745",
            color: "white",
            border: "none",
            width: "100%",
            borderRadius: "5px",
          }}
        >
          Submit Redemption Request
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", fontWeight: "bold" }}>
          {message}
        </p>
      )}

      {transactionId && (
        <button
          onClick={() => navigate(`/redeem/qr/${transactionId}`)}
          style={{
            marginTop: "15px",
            padding: "10px 15px",
            background: "#007bff",
            color: "white",
            border: "none",
            width: "100%",
            borderRadius: "5px",
          }}
        >
          Open QR Code Page
        </button>
      )}
    </div>
  );
}
