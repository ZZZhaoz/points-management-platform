import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function UserQRPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      })
      .finally(() => setLoading(false));
  }, [BACKEND_URL, token]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Failed to load user.</p>;

  const qrValue = JSON.stringify({
    type: "user",
    utorid: user.utorid,
    id: user.id,
  });

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Your QR Code</h2>
      <p>Cashiers can scan this to start a transaction for you.</p>

      <div style={{ background: "#eee", padding: "16px", display: "inline-block" }}>

        <QRCode value={qrValue} size={200} />
      </div>

      <p style={{ marginTop: "10px" }}>
        <strong>UTorID:</strong> {user.utorid}
      </p>
    </div>
  );
}
