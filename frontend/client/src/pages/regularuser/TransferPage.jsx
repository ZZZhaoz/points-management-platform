import { useState } from "react";

export default function TransferPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [recipientUtorid, setRecipientUtorid] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!recipientUtorid || !amount) {
      setMessage("Please fill in recipient and amount.");
      return;
    }

    try {
      // -----------------------------
      // STEP 1: lookup recipient userId
      // -----------------------------
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
        return;
      }

      const lookupData = await lookupRes.json();
      const recipientId = lookupData.id; // numeric userId

      // -----------------------------
      // STEP 2: send transfer request
      // POST /users/:userId/transactions
      // -----------------------------
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
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Transfer Points</h2>
      <p>Enter a user's UTORID to transfer points.</p>

      <form onSubmit={handleSubmit}>
        {/* Recipient UTORID */}
        <div style={{ marginBottom: "10px" }}>
          <label>Recipient UTORID</label>
          <input
            type="text"
            value={recipientUtorid}
            onChange={(e) => setRecipientUtorid(e.target.value)}
            placeholder="e.g., johndoe1"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: "10px" }}>
          <label>Amount of Points</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        {/* Remark */}
        <div style={{ marginBottom: "10px" }}>
          <label>Remark (optional)</label>
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g., Birthday gift"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 15px",
            background: "#007bff",
            color: "white",
            border: "none",
            width: "100%",
            borderRadius: "5px",
          }}
        >
          Submit Transfer
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", color: "red", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
}
