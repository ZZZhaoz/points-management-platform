import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import "./UserQRPage.css";

export default function UserQRPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError("");
        } else {
          setError("Failed to load user information.");
        }
      })
      .catch(() => {
        setError("Network error. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [BACKEND_URL, token]);

  if (loading) {
    return (
      <div className="qr-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading QR code...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="qr-page">
        <div className="error-container">
          <div className="error-message">{error || "Failed to load user."}</div>
        </div>
      </div>
    );
  }

  const qrValue = JSON.stringify({
    type: "user",
    utorid: user.utorid,
    id: user.id,
  });

  return (
    <div className="qr-page">
      <div className="qr-page-header">
        <h1 className="qr-page-title">Your QR Code</h1>
        <p className="qr-page-subtitle">Share this QR code with cashiers to start transactions</p>
      </div>

      <div className="qr-card">
        <div className="qr-container">
          <div className="qr-code-wrapper">
            <QRCode value={qrValue} size={256} />
          </div>
        </div>

        <div className="user-info">
          <div className="user-info-label">Your UTORid</div>
          <div className="user-info-value">{user.utorid}</div>
        </div>

        <div className="instructions">
          <div className="instructions-title">How to use:</div>
          <p className="instructions-text">
            Cashiers can scan this QR code to quickly start a transaction for you. 
            Keep this page open or save the QR code for easy access.
          </p>
        </div>
      </div>
    </div>
  );
}
