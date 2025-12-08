import { useEffect, useState } from "react";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import PromotionDetailModal from "../../components/promotions/PromotionDetailModal";
import "./PromotionsPage.css";

export default function PromotionsPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchName(searchName);
    }, 500);  

    return () => clearTimeout(timer);  
  }, [searchName]);

  useEffect(() => {
    setLoading(true);

    const queryName =
      debouncedSearchName.trim() !== "" 
        ? `&name=${encodeURIComponent(debouncedSearchName)}` 
        : "";

    fetch(`${BACKEND_URL}/promotions?page=${page}&limit=${limit}${queryName}`, {
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
        setPromotions(data.results);
        setMessage(null);  
      })
      .catch(() => setMessage("Network error."))
      .finally(() => setLoading(false));
  }, [BACKEND_URL, token, debouncedSearchName, page, limit]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="promotions-container">
      <div className="promotions-header">
        <h1 className="promotions-title">Available Promotions 🎁</h1>
        <p className="promotions-subtitle">Discover amazing offers and rewards!</p>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-title">
          Search Promotions
        </div>
        <Input
          label="Search by name"
          placeholder="e.g. Summer Sale"
          value={searchName}
          onChange={(value) => { 
            setPage(1);  
            setSearchName(value);
          }}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading promotions...</p>
        </div>
      )}

      {/* Error message */}
      {message && (
        <div className="alert alert-error" style={{ marginTop: "1rem" }}>
          {message}
        </div>
      )}

      {/* Empty state */}
      {!loading && promotions.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🎁</div>
          <div className="empty-state-title">No promotions available</div>
          <div className="empty-state-text">Check back later for new offers!</div>
        </div>
      )}

      {!loading && promotions.length > 0 && (
        <div className="promotions-grid">
          {promotions.map((promo) => {
            const endDate = new Date(promo.endTime);
            const startDate = new Date(promo.startTime);
            const now = new Date();
            const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
            const isExpiringSoon = daysRemaining < 3;
            const isUrgent = daysRemaining < 7;
            
            return (
              <div
                key={promo.id}
                className={`promotion-card ${promo.type}`}
              >
                <div className="promotion-card-header">
                  <div>
                    <h3 className="promotion-name">{promo.name}</h3>
                    <div className="promotion-type-badge">
                      {promo.type === "automatic" ? (
                        <span className="badge badge-primary">∞ Automatic</span>
                      ) : (
                        <span className="badge badge-success">One-time</span>
                      )}
                    </div>
                  </div>
                  {isExpiringSoon && (
                    <div className="promotion-urgent-badge">
                      Expires Soon!
                    </div>
                  )}
                </div>

                {promo.description && (
                  <p className="promotion-description">{promo.description}</p>
                )}

                <div className="promotion-details">
                  {promo.points && (
                    <div className="promotion-detail">
                      <strong>Bonus Points:</strong>
                      <span className="promotion-value">{promo.points} pts</span>
                    </div>
                  )}

                  {promo.rate && (
                    <div className="promotion-detail">
                      <strong>Rate Bonus:</strong>
                      <span className="promotion-value">{Math.round(promo.rate * 100)}%</span>
                    </div>
                  )}

                  {promo.minSpending && (
                    <div className="promotion-detail">
                      <strong>Minimum Spending:</strong>
                      <span className="promotion-value">${promo.minSpending}</span>
                    </div>
                  )}

                  <div className="promotion-detail">
                    <strong>Valid Until:</strong>
                    <span>{endDate.toLocaleDateString()}</span>
                  </div>

                  <div className="promotion-detail">
                    <strong>Time Remaining:</strong>
                    <span className={isExpiringSoon ? "promotion-expiring" : isUrgent ? "promotion-urgent" : ""}>
                      {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedPromo(promo)}
                  variant="outline"
                  style={{ width: "100%", marginTop: "1rem" }}
                >
                  View Details →
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedPromo && (
        <PromotionDetailModal
          promotion={selectedPromo}
          onClose={() => setSelectedPromo(null)}
        />
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="promotions-pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="pagination-button"
          >
            ← Previous
          </button>

          <span className="pagination-info">
            Page {page} / {totalPages || 1}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="pagination-button"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}