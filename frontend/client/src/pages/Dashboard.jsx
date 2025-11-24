import { useEffect, useState } from "react";

export default function Dashboard() {
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
        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      })
      .finally(() => setLoading(false));
  }, [BACKEND_URL, token]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Not logged in.</p>;

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}!</h1>

      <div className="card">
        <h3>Account Information</h3>
        <p><strong>UTorID:</strong> {user.utorid}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Verified:</strong> {user.verified ? "Yes" : "No"}</p>
      </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <h3>Your Points</h3>
        <p style={{ fontSize: "24px", fontWeight: "bold" }}>
          {user.points} pts
        </p>
      </div>
    </div>
  );
}
