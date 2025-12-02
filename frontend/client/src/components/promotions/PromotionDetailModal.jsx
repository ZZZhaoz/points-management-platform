import Button from "../global/Button";
import "./PromotionDetailModal.css";

export default function PromotionDetailModal({ promotion, onClose }) {
  if (!promotion) return null;

  const color = promotion.type === "automatic" ? "#2196F3" : "#4CAF50";
  const endDate = new Date(promotion.endTime);
  const startDate = new Date(promotion.startTime);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

  return (
    <div className="promotion-modal-overlay" onClick={onClose}>
      <div className="promotion-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="promotion-modal-header">
          <h2 style={{ margin: 0, color: "#212121" }}>{promotion.name}</h2>
          <button
            className="promotion-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="promotion-modal-body">
          {promotion.description && (
            <p style={{ fontSize: "16px", color: "#555", marginBottom: "24px" }}>
              {promotion.description}
            </p>
          )}

          <div className="promotion-modal-details">
            <div className="promotion-detail-row">
              <strong>Type:</strong>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  background: color,
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {promotion.type === "automatic" ? "Automatic" : "One-time"}
              </span>
            </div>

            {promotion.points && (
              <div className="promotion-detail-row">
                <strong>Bonus Points:</strong>
                <span style={{ fontSize: "18px", fontWeight: "bold", color: color }}>
                  {promotion.points} pts
                </span>
              </div>
            )}

            {promotion.rate && (
              <div className="promotion-detail-row">
                <strong>Rate Bonus:</strong>
                <span style={{ fontSize: "18px", fontWeight: "bold", color: color }}>
                  {promotion.rate * 100}%
                </span>
              </div>
            )}

            {promotion.minSpending && (
              <div className="promotion-detail-row">
                <strong>Minimum Spending:</strong>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                  ${promotion.minSpending}
                </span>
              </div>
            )}

            <div className="promotion-detail-row">
              <strong>Valid From:</strong>
              <span>{startDate.toLocaleDateString()}</span>
            </div>

            <div className="promotion-detail-row">
              <strong>Valid Until:</strong>
              <span>{endDate.toLocaleDateString()}</span>
            </div>

            <div className="promotion-detail-row">
              <strong>Time Remaining:</strong>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: daysRemaining < 3 ? "#F44336" : daysRemaining < 7 ? "#FF9800" : "#4CAF50",
                }}
              >
                {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
        </div>

        <div className="promotion-modal-footer">
          <Button onClick={onClose} variant="primary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

