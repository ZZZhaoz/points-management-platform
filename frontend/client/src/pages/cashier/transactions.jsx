import { useState } from "react";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useTransactions } from "../../contexts/TransactionContext";
import "./transactions.css";

export default function Transactions() {
  const { createTransaction } = useTransactions();   
  
  const [utorid, setUtorid] = useState("");
  const [spent, setSpent] = useState("");
  const [promotionIds, setPromotionIds] = useState("");
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    
    const type = "purchase";
    
    const spentNum = parseFloat(spent);
    if (isNaN(spentNum) || spentNum <= 0) {
      setMessage("Please enter a valid amount greater than 0");
      setLoading(false);
      return;
    }
    
    // Convert promotionIds string to number array
    const promotionIdsNum = promotionIds
      ? promotionIds
          .split(",")
          .map(id => id.trim())
          .filter(id => id !== "")
          .map(id => parseInt(id, 10))
          .filter(id => !isNaN(id))
      : [];
    
    setSubmitting(true);

    const result = await createTransaction(
      utorid,
      type,
      spentNum,
      promotionIdsNum,
      remark
    );

    setSubmitting(false);

    if (result.error){
        setMessage(result.error);
        setLoading(false);
        return;
    }

    setUtorid("");
    setSpent("");
    setPromotionIds("");
    setRemark("");
    setMessage("Transaction created successfully!");
    setLoading(false);
  };

  const isSuccess = message && message.includes("successfully");

  return (
    <div className="create-transaction-page">
      <div className="create-transaction-header">
        <h1 className="create-transaction-title">Create Transaction 🛒</h1>
        <p className="create-transaction-subtitle">Record a purchase transaction for a user</p>
      </div>

      <div className="create-transaction-card">
        <div className="create-transaction-icon">💳</div>

        <form onSubmit={submit}>
          <Input
            label="Customer UTORid"
            placeholder="Enter customer's UTORid"
            value={utorid}
            onChange={setUtorid}
            required
          />

          <Input
            label="Amount Spent"
            placeholder="Enter the amount spent"
            type="number"
            step="0.01"
            min="0.01"
            value={spent}
            onChange={setSpent}
            required
          />

          <Input
            label="Promotion IDs (Optional)"
            placeholder="Enter promotion IDs separated by commas (e.g., 1, 2, 3)"
            value={promotionIds}
            onChange={setPromotionIds}
          />

          <Input
            label="Remark (Optional)"
            placeholder="Enter a remark"
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
            {loading ? "Creating..." : "Create Transaction"}
          </Button>
        </form>
      </div>
    </div>
  );
}
