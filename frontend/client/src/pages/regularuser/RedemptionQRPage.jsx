import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import "./RedemptionQRPage.css";

export default function RedemptionQRPage() {
  const { transactionId } = useParams();

  const qrValue = JSON.stringify({
    type: "redemption",
    transactionId: Number(transactionId),
  });

  return (
    <div className="qr-page">
      <div className="qr-header">
        <h1 className="qr-title">Redemption QR Code</h1>
        <p className="qr-subtitle">Show this QR code to a cashier to process your redemption</p>
      </div>

      <div className="qr-card">
        <div className="qr-container">
          <QRCode value={qrValue} size={280} />
        </div>

        <div className="qr-info">
          <div className="transaction-id-badge">
            Transaction ID: #{transactionId}
          </div>

          <div className="qr-instructions">
            <strong>Instructions:</strong>
            <p style={{ margin: 0, fontSize: "0.9375rem" }}>
              Present this QR code to a cashier. They will scan it to process your redemption request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
