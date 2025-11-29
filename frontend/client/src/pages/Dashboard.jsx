import { useEffect, useState } from "react";

export default function Dashboard() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          return;
        }
        const data = await res.json();
        setPoints(data.points);
      })
      .finally(() => setLoading(false));
  }, [BACKEND_URL, token]);

  if (loading) return <p>Loading...</p>;
  if (points === null) return <p>Not logged in.</p>;

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>Your Points</h1>

      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          display: "inline-block",
          minWidth: "200px",
        }}
      >
        <p style={{ fontSize: "40px", fontWeight: "bold", margin: 0 }}>
          {points}
        </p>
        <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>points</p>
      </div>
    </div>
  );
}
