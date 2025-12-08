import { useState } from "react";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import { useAuth } from "../../contexts/AuthContext";
import "./RedemptionTransaction.css";
import { useTransactions } from "../../contexts/TransactionContext";

export default function RedemptionTransaction() {
  const { processRedemption } = useTransactions();

  const [transactionId, setTransactionId] = useState("");
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);

    setError(null);
    setSuccess(null);

    const id = parseInt(transactionId, 10);
    if (isNaN(id) || id <= 0) {
      setMessage("Please enter a valid transaction ID greater than 0");
      return;
    }

    setSubmitting(true);
    const result = await processRedemption(id);
    setSubmitting(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    // Success
    setTransactionId("");
    setMessage("Redemption processed successfully! ✨");
  };

  const isSuccess = message && message.includes("successfully");

  return (
    <div className="process-redemption-page">
      <div className="process-redemption-header">
        <h1 className="process-redemption-title">Process Redemption 🎫</h1>
        <p className="process-redemption-subtitle">Enter a transaction ID to process a redemption request</p>
      </div>

      <div className="process-redemption-card">
        <div className="process-redemption-icon">✅</div>

        <form onSubmit={submit}>
          <Input
            label="Transaction ID"
            placeholder="Enter the redemption transaction ID"
            type="number"
            value={transactionId}
            onChange={setTransactionId}
            required
          />

          {message && (
            <div className={`alert ${isSuccess ? "alert-success" : "alert-error"}`} style={{ marginTop: "1rem" }}>
              {message}
            </div>
          )}

          <Button 
            type="submit" 
            variant="success"
            disabled={submitting}
            style={{ width: "100%", marginTop: "1.5rem" }}
          >
            {submitting ? "Processing..." : "Process Redemption"}
          </Button>
        </form>
      </div>
    </div>
  );
}
