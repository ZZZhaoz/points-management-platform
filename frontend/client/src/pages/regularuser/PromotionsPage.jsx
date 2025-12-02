import { useEffect, useState } from "react";
import Input from "../../components/global/Input";
import PromotionAvatar from "../../components/promotions/PromotionAvatar";
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

      {/* Search box */}
      <div style={{ maxWidth: "300px", marginTop: "20px" }}>
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
          {promotions.map((promo) => (
            <PromotionAvatar
              key={promo.id}
              promotion={promo}
              onClick={() => setSelectedPromo(promo)}
            />
          ))}
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
      {totalPages > 1 && (
        <div className="promotions-pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="pagination-button"
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}