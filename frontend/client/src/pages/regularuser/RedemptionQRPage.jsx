import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";

export default function RedemptionQRPage() {
  const { transactionId } = useParams();

  const qrValue = JSON.stringify({
    type: "redemption",
    transactionId: Number(transactionId),
  });

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Redemption QR Code</h2>
      <p>Show this QR code to a cashier to process your redemption.</p>

      <div style={{ background: "#eee", padding: "16px", display: "inline-block" }}>
        <QRCode value={qrValue} size={220} />
      </div>

      <p style={{ marginTop: "10px" }}>
        <strong>Transaction ID:</strong> {transactionId}
      </p>

      <p style={{ marginTop: "20px", color: "#666" }}>
        Cashier will scan this code to finalize your redemption.
      </p>
    </div>
  );
}
