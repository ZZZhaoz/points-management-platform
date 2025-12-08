import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import "./RedemptionPage.css";

export default function RedemptionPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!amount) {
      setMessage("Amount is required.");
      setLoading(false);
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
        setAmount("");
        setRemark("");
        setLoading(false);
        return;
      }

      if (res.status === 400) {
        setMessage("Not enough points to redeem that amount.");
        setLoading(false);
        return;
      }

      if (res.status === 403) {
        setMessage("Your account is not verified. Redemption forbidden.");
        setLoading(false);
        return;
      }

      setMessage(data.error || "Redemption failed.");
      setLoading(false);

    } catch (err) {
      console.error(err);
      setMessage("Network error.");
      setLoading(false);
    }
  };

  const isSuccess = message && message.includes("successfully");

  return (
    <div className="redemption-page">
      <div className="redemption-header">
        <h1 className="redemption-title">Redeem Points 🎫</h1>
        <p className="redemption-subtitle">Request to redeem your points. A cashier will process it.</p>
      </div>

      <div className="redemption-card">
        <div className="redemption-icon">💰</div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Amount to Redeem"
            type="number"
            min="1"
            placeholder="Enter amount"
            value={amount}
            onChange={setAmount}
            required
          />

          <Input
            label="Remark (Optional)"
            placeholder="e.g., For gifts"
            value={remark}
            onChange={setRemark}
          />

          {message && (
            <div className={`alert ${isSuccess ? "alert-success" : "alert-error"}`} style={{ marginTop: "1rem" }}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            variant="success"
            disabled={loading}
            style={{ width: "100%", marginTop: "1.5rem" }}
          >
            {loading ? "Processing..." : "Submit Redemption Request"}
          </Button>
        </form>

        {transactionId && (
          <div className="success-actions">
            <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
              Your redemption request has been created! Show the QR code to a cashier.
            </p>
            <Button
              onClick={() => navigate(`/redeem/qr/${transactionId}`)}
              variant="primary"
              style={{ width: "100%" }}
            >
              View QR Code
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
