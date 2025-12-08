import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditPage.css";



export default function TransactionsUpdate() {
  const { transactionId } = useParams();    
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);


  const [form, setForm] = useState({
    suspicious: false,
  });


  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  const [adjustment, setAdjustment] = useState({
    utorid: "",
    type: "adjustment",
    amount: "",
    relatedId: "",
    promotionIds: "",
    remark: "",
  });

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

        setForm({
          suspicious: data.suspicious ?? false,
        });

        setAdjustment((prev) => ({
          ...prev,
          utorid: data.utorid,
          type: "adjustment",
          relatedId: data.id,
        }));

      })
      .finally(() => setLoading(false));
  }, [transactionId, BACKEND_URL, token]);

  if (loading) {
    return (
      <div className="edit-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="edit-page">
        <div className="alert alert-error">Transaction not found.</div>
      </div>
    );
  }

  


  const handleCreateAdjustment = async (e) => {
      e.preventDefault();

      if (adjustment.amount === "") {
        setError("Adjustment amount is required");
        setSuccess("");
        return;
      }

      const promoIds =
        adjustment.promotionIds.trim() === ""
          ? []
          : adjustment.promotionIds
              .split(",")
              .map((id) => Number(id.trim()))
              .filter((n) => !Number.isNaN(n));

      const payload = {
        utorid: adjustment.utorid,
        type: "adjustment",
        amount: Number(adjustment.amount),
        relatedId: Number(adjustment.relatedId),
        promotionIds: promoIds,
        remark: adjustment.remark || "",
      };

      const res = await fetch(`${BACKEND_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError("Failed to create adjustment transaction");
        setSuccess("");
        return;
      }

      const data = await res.json();
      setSuccess(`Adjustment transaction created with id ${data.id}`);
      setError("");

      // optional: clear input-only fields
      setAdjustment((prev) => ({
        ...prev,
        amount: "",
        promotionIds: "",
        remark: "",
      }));
    };
  
  
  // Handle update suspicious
  const handleUpdate = (e) => {
    e.preventDefault();

    fetch(`${BACKEND_URL}/transactions/${transactionId}/suspicious`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        suspicious: form.suspicious,
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
    <div className="edit-page">
      <div className="edit-page-header">
        <h1 className="edit-page-title">Update Transaction #{transactionId}</h1>
        <p className="edit-page-subtitle">View and update transaction details</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="read-only-section">
        <div className="read-only-field">
          <span className="read-only-label">UtorID:</span>
          <span className="read-only-value">{transaction.utorid}</span>
        </div>
        <div className="read-only-field">
          <span className="read-only-label">Type:</span>
          <span className="read-only-value">{transaction.type}</span>
        </div>
        <div className="read-only-field">
          <span className="read-only-label">Created By:</span>
          <span className="read-only-value">{transaction.createdBy}</span>
        </div>
        <div className="read-only-field">
          <span className="read-only-label">Spent:</span>
          <span className="read-only-value">{transaction.spent}</span>
        </div>
        <div className="read-only-field">
          <span className="read-only-label">Promotion IDs:</span>
          <span className="read-only-value">
            {transaction.promotionIds && transaction.promotionIds.length > 0
              ? transaction.promotionIds.join(", ")
              : "None"}
          </span>
        </div>
      </div>

      <form onSubmit={handleUpdate}>
        <div className="edit-form-card">
          <div className="field-group">
            <label className="field-label">Suspicious</label>
            <div className="checkbox-group">
              <input
                type="checkbox"
                className="field-checkbox"
                checked={form.suspicious}
                onChange={(e) =>
                  setForm({ ...form, suspicious: e.target.checked })
                }
                id="suspicious"
              />
              <label htmlFor="suspicious" className="checkbox-label">
                Mark this transaction as suspicious
              </label>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button
            type="button"
            className="action-button secondary"
            onClick={() => setShowAdjustmentForm((prev) => !prev)}
          >
            {showAdjustmentForm
              ? "Hide Adjustment Form"
              : "Create Adjustment Transaction"}
          </button>
        </div>

        {/* Adjustment form (only visible when toggled) */}
        {showAdjustmentForm && (
          <div className="adjustment-form">
            <h3 className="adjustment-form-title">Adjustment Details</h3>

            <div className="field-group">
              <label className="field-label">UtorID</label>
              <input
                type="text"
                className="field-input"
                value={adjustment.utorid}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, utorid: e.target.value })
                }
                placeholder="Enter UTORid"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Type</label>
              <select className="field-select" value="adjustment" disabled>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Amount (points)</label>
              <input
                type="number"
                className="field-input"
                value={adjustment.amount}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, amount: e.target.value })
                }
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Related ID</label>
              <input
                type="number"
                className="field-input"
                value={adjustment.relatedId}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, relatedId: e.target.value })
                }
                placeholder="Related transaction ID"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Promotion IDs (comma separated)</label>
              <input
                type="text"
                className="field-input"
                value={adjustment.promotionIds}
                onChange={(e) =>
                  setAdjustment({
                    ...adjustment,
                    promotionIds: e.target.value,
                  })
                }
                placeholder="e.g., 1, 2, 3"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Remark</label>
              <input
                type="text"
                className="field-input"
                value={adjustment.remark}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, remark: e.target.value })
                }
                placeholder="Optional remark"
              />
            </div>

            <div className="action-buttons">
              <button
                type="button"
                className="action-button primary"
                onClick={handleCreateAdjustment}
              >
                Submit Adjustment
              </button>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button
            type="button"
            className="action-button secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button type="submit" className="action-button primary">
            Update Transaction
          </button>
          <button
            type="button"
            className="action-button secondary"
            onClick={() => navigate("/manager/transactions")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}