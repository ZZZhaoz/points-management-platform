import { useState } from "react";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import { useTransactions } from "../../contexts/TransactionContext";

export default function RedemptionTransaction() {
  const { processRedemption } = useTransactions();

  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    const id = parseInt(transactionId, 10);
    if (isNaN(id) || id <= 0) {
      setError("Please enter a valid transaction ID greater than 0");
      return;
    }

    setSubmitting(true);
    const result = await processRedemption(id);
    setSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    // Success
    setTransactionId("");
    setSuccess("Redemption processed successfully!");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>Process Redemption</h1>

      {/* ----- Error Box ----- */}
      {error && (
        <div
          style={{
            background: "#ffe5e5",
            color: "#b00000",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontWeight: "600",
          }}
        >
          {error}
        </div>
      )}

      {/* ----- Success Box ----- */}
      {success && (
        <div
          style={{
            background: "#e5ffe5",
            color: "#007700",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontWeight: "600",
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={submit}>
        <Input
          label="Transaction ID"
          placeholder="Enter the transaction ID"
          value={transactionId}
          onChange={(value) => setTransactionId(value)}
          required
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? "Processing..." : "Process Redemption"}
        </Button>
      </form>
    </div>
  );
}
