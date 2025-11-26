import { useState } from "react";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import { useAuth } from "../../contexts/AuthContext";

export default function RedemptionTransaction() {
  const { processRedemption } = useAuth();

  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    const id = parseInt(transactionId, 10);
    if (isNaN(id) || id <= 0) {
      alert("Please enter a valid transaction ID greater than 0");
      return;
    }

    setSubmitting(true);
    const err = await processRedemption(id);
    setSubmitting(false);

    if (err) {
      alert(err);
      return;
    }

    setTransactionId("");
    alert("Redemption processed successfully!");
  };

  return (
    <form onSubmit={submit}>
      <h1>Process Redemption</h1>

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
  );
}
