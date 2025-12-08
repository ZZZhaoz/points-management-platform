import { useState } from "react";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import "./TransferPage.css";

export default function TransferPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [recipientUtorid, setRecipientUtorid] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!recipientUtorid || !amount) {
      setMessage("Please fill in recipient and amount.");
      setLoading(false);
      return;
    }

    try {
      //lookup recipient userId
      const lookupRes = await fetch(
        `${BACKEND_URL}/users/lookup/${recipientUtorid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!lookupRes.ok) {
        setMessage("User not found.");
        setLoading(false);
        return;
      }

      const lookupData = await lookupRes.json();
      const recipientId = lookupData.id; 

      // POST /users/:userId/transactions
      const res = await fetch(
        `${BACKEND_URL}/users/${recipientId}/transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "transfer",
            amount: Number(amount),
            remark: remark || "",
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(
          `Successfully transferred ${amount} points to ${recipientUtorid}!`
        );
        setRecipientUtorid("");
        setAmount("");
        setRemark("");
      } else {
        setMessage(data.error || "Transfer failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message && message.includes("Successfully");

  return (
    <div className="transfer-page">
      <div className="transfer-header">
        <h1 className="transfer-title">Transfer Points 💸</h1>
        <p className="transfer-subtitle">Send points to another user</p>
      </div>

      <div className="transfer-card">
        <div className="transfer-icon">🔄</div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Recipient UTORid"
            placeholder="e.g., johndoe1"
            value={recipientUtorid}
            onChange={setRecipientUtorid}
            required
          />

          <Input
            label="Amount of Points"
            type="number"
            min="1"
            placeholder="Enter amount"
            value={amount}
            onChange={setAmount}
            required
          />

          <Input
            label="Remark (Optional)"
            placeholder="e.g., Birthday gift"
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
            variant="primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "1.5rem" }}
          >
            {loading ? "Transferring..." : "Transfer Points"}
          </Button>
        </form>
      </div>
    </div>
  );
}
