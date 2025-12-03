import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TransactionsUpdate() {
  const { transactionId } = useParams();    
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);

  // Editable fields
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [suspicious, setSuspicious] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`${BACKEND_URL}/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("Transaction not found");
          return;
        }

        const data = await res.json();

        setTransaction(data);

        // Fill editable fields
        setAmount(data.amount);
        setStatus(data.status);
        setSuspicious(data.suspicious);
      })
      .finally(() => setLoading(false));
  }, [transactionId, BACKEND_URL, token]);

  if (loading) return <p>Loading transaction...</p>;
  if (!transaction) return <p>Transaction not found.</p>;

  // Handle update
  const handleUpdate = (e) => {
    e.preventDefault();

    fetch(`${BACKEND_URL}/transactions/${transactionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: Number(amount),
        status,
        suspicious
      })
    })
    .then(async (res) => {

      if (!res.ok) {
        setError("Can't update transaction!");
        setSuccess("");
        return;
      }

      setSuccess("Transaction updated!");
      setError("");

    });
  };

  return (
    <div>
      <h1>Update Transaction #{transactionId}</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleUpdate}>

        {/* READ-ONLY FIELDS */}
        <p><strong>Type:</strong> {transaction.type}</p>
        <p><strong>Created By:</strong> {transaction.createdBy}</p>
        <p><strong>Date:</strong> {transaction.createdAt}</p>
        <p><strong>To User:</strong> {transaction.toUser}</p>

        {/* Amount */}
        <div>
          <label>Amount: </label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        {/* Status */}
        <div>
          <label>Status: </label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Suspicious */}
        <div>
          <label>Suspicious: </label>
          <input
            type="checkbox"
            checked={suspicious}
            onChange={(e) => setSuspicious(e.target.checked)}
          />
        </div>

        <br />
        <button type="submit">Update Transaction</button>
        <button type="button" onClick={() => navigate("/manager/transactions")}>
          Cancel
        </button>

      </form>
    </div>
  );
}