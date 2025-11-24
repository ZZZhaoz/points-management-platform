import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "../../components/global/Card";

export default function PromotionsPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);

    fetch(`${BACKEND_URL}/promotions?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Failed to load promotions.");
          return;
        }

        setTotalCount(data.count);
        setPromotions(data.results); // backend always uses results[]
      })
      .catch(() => setMessage("Network error."))
      .finally(() => setLoading(false));
  }, [BACKEND_URL, token, page, limit]);

  if (loading) return <p>Loading promotions...</p>;
  if (message) return <p style={{ color: "red" }}>{message}</p>;

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <h2>Available Promotions</h2>
      <p>Here are all currently published promotions:</p>

      <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
        {promotions.map((promo) => (
          <PromotionCard key={promo.id} promo={promo} />
        ))}
      </div>

      {/* Pagination Controls */}
      <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function PromotionCard({ promo }) {
  const color = promo.type === "automatic" ? "#2196f3" : "#4caf50";

  return (
    <Card
      style={{
        borderLeft: `6px solid ${color}`,
        padding: "16px",
        background: "#f9f9f9",
      }}
    >
      <CardHeader>
        <CardTitle>{promo.name}</CardTitle>
        <CardSubtitle>{promo.description}</CardSubtitle>
      </CardHeader>

      <CardContent>
        <p><strong>Type:</strong> {promo.type}</p>

        {promo.minSpending !== null && <p><strong>Min Spending:</strong> ${promo.minSpending}</p>}
        {promo.rate !== null && <p><strong>Rate Bonus:</strong> {promo.rate * 100}%</p>}
        {promo.points !== null && promo.points > 0 && <p><strong>Bonus Points:</strong> {promo.points}</p>}

        <p style={{ marginTop: "10px", color: "#555" }}>
          <strong>Valid:</strong> {promo.startTime?.slice(0, 10)} → {promo.endTime?.slice(0, 10)}
        </p>
      </CardContent>
    </Card>
  );
}
