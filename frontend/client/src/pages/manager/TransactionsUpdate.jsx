
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";



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

  if (loading) return <p>Loading transaction...</p>;
  if (!transaction) return <p>Transaction not found.</p>;

  


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
    <div>
      <h1>Update Transaction #{transactionId}</h1>

      {error && <p >{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleUpdate}>

        {/* READ-ONLY FIELDS */}
        <p><strong>UtorID:</strong> {transaction.utorid}</p>
        <p><strong>Type:</strong> {transaction.type}</p>
        <p><strong>Created By:</strong> {transaction.createdBy}</p>
        <p><strong>Spent:</strong> {transaction.spent}</p>
        <p><strong>Promotion IDs: </strong>{transaction.promotionIds && 
                      transaction.promotionIds.length > 0
                        ? transaction.promotionIds.join(", ") : "None"}</p>

      
        <div>
          <label>Suspicious: </label>
          <input
            type="checkbox"
            checked={form.suspicious}
            onChange={(e) =>
              setForm({ ...form, suspicious: e.target.checked })
            }
          />
        </div>

        <br></br>



                <button
          type="button"
          onClick={() => setShowAdjustmentForm((prev) => !prev)}
        >
          {showAdjustmentForm
            ? "Hide adjustment form"
            : "Create adjustment transaction"}
        </button>

        {/* Adjustment form (only visible when toggled) */}
        {showAdjustmentForm && (
          <div style={{ marginTop: "10px" }}>
            <h3>Adjustment Details</h3>

            <div>
              <label>UtorID: </label>
              <input
                type="text"
                value={adjustment.utorid}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, utorid: e.target.value })
                }
              />
            </div>

            <div>
              <label>Type: </label>
              <select value="adjustment" disabled>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label>Amount (points): </label>
              <input
                type="number"
                value={adjustment.amount}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, amount: e.target.value })
                }
              />
            </div>

            <div>
              <label>Related ID: </label>
              <input
                type="number"
                value={adjustment.relatedId}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, relatedId: e.target.value })
                }
              />
            </div>

            <div>
              <label>Promotion IDs (comma separated): </label>
              <input
                type="text"
                value={adjustment.promotionIds}
                onChange={(e) =>
                  setAdjustment({
                    ...adjustment,
                    promotionIds: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label>Remark: </label>
              <input
                type="text"
                value={adjustment.remark}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, remark: e.target.value })
                }
              />
            </div>

            <button type="button" onClick={handleCreateAdjustment}>
              Submit Adjustment
            </button>
          </div>
        )}




            
        <br />
        <button type="button" onClick={() => navigate(-1)}> Back </button>
        <button type="submit">Update Transaction</button>
        <button type="button" onClick={() => navigate("/manager/transactions")}>
          Cancel
        </button>

      </form>
    </div>
  );
}