import { useState } from "react";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import { useTransactions } from "../../contexts/TransactionContext";  

export default function Transactions() {
  const { createTransaction } = useTransactions();   
  
  const [utorid, setUtorid] = useState("");
  const [spent, setSpent] = useState("");
  const [promotionIds, setPromotionIds] = useState([]);
  const [remark, setRemark] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    const type = "purchase";
    
    const spentNum = parseFloat(spent);
    if (isNaN(spentNum) || spentNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    
    const promotionIdsNum = promotionIds
      .map(id => id.trim())
      .filter(id => id !== "")
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));
    
    setSubmitting(true);

    const result = await createTransaction(
      utorid,
      type,
      spentNum,
      promotionIdsNum,
      remark
    );

    setSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setUtorid("");
    setSpent("");
    setPromotionIds([]);
    setRemark("");

    setSuccess("Transaction created successfully!");
  };

  return (
    <div style={{ maxWidth: "650px", margin: "0 auto" }}>

      <h1>Create Transaction</h1>

      {/* Error Box */}
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

      {/* Success Box */}
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
          label="UTORid"
          placeholder="Enter your UTORid"
          value={utorid}
          onChange={(value) => setUtorid(value)}
          required
        />

        <Input
          label="Amount Spent"
          placeholder="Enter the amount spent"
          type="number"
          step="0.01"
          value={spent}
          onChange={(value) => setSpent(value)}
          required
        />

        <Input
          label="Promotion IDs"
          placeholder="Enter promotion IDs (comma-separated)"
          value={promotionIds.join(",")}
          onChange={(value) => setPromotionIds(value ? value.split(",") : [])}
        />

        <Input
          label="Remark"
          placeholder="Enter remark"
          value={remark}
          onChange={(value) => setRemark(value)}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Transaction"}
        </Button>
      </form>
    </div>
  );
}
