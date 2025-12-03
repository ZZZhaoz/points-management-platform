import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function getQuery(filters) {
  const params = new URLSearchParams();

  if (filters.name) params.set("name", filters.name);
  if (filters.createdBy) params.set("createdBy", filters.createdBy);
  if (filters.suspicious !== "") params.set("suspicious", filters.suspicious);
  if (filters.promotionId) params.set("promotionId", filters.promotionId);
  if (filters.type) params.set("type", filters.type);
  if (filters.relatedId) params.set("relatedId", filters.relatedId);
  if (filters.amount) params.set("amount", filters.amount);
  if (filters.operator) params.set("operator", filters.operator);

  params.set("page", filters.page);
  params.set("limit", filters.limit);

  return params.toString();
}

function sortTransactions(transactions, sortBy, sortOrder) {
  const sorted = [...transactions];

  sorted.sort((a, b) => {
    const x = a[sortBy];
    const y = b[sortBy];

    if (x < y) return sortOrder === "asc" ? -1 : 1;
    if (x > y) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

export default function TransactionsList() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Filters (FIXED: no nulls)
  const [filters, setFilters] = useState({
    name: "",
    createdBy: "",
    suspicious: "",
    promotionId: "",
    type: "",
    relatedId: "",
    amount: "",
    operator: "",
    page: 1,
    limit: 10,
  });

  // Use state for sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Use state for pagination and getting data
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch from backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/transactions?${getQuery(filters)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
      if (!res.ok) {
        setTransactions([]);        
        setTotalCount(0);
        setError("Failed to load transactions");
        setSuccess("");
        return;
      }
        const data = await res.json();
        setTransactions(data.results || []);
        setTotalCount(data.count || 0);
      })
      .finally(() => setLoading(false));
  }, [filters, BACKEND_URL, token]);

  if (loading) return <p>Loading transactions...</p>;

  const sortedTransactions = sortTransactions(transactions, sortBy, sortOrder);
  const totalPages = Math.ceil(totalCount / filters.limit);

  return (
    <div>
      <h1>All Transactions</h1>

      {error && <p>{error}</p>}
      {success && <p >{success}</p>}

      <div>
        <label>Name: </label>
        <input
          value={filters.name}
          onChange={(e) =>
            setFilters({ ...filters, name: e.target.value, page: 1 })
          }
        />
        <br />

        <label>Created By (utorid): </label>
        <input
          value={filters.createdBy}
          onChange={(e) =>
            setFilters({ ...filters, createdBy: e.target.value, page: 1 })
          }
        />
        <br />

        <label>Suspicious: </label>
        <select
          value={filters.suspicious}
          onChange={(e) =>
            setFilters({ ...filters, suspicious: e.target.value, page: 1 })
          }
        >
          <option value="">All</option>
          <option value="true">Suspicious Only</option>
          <option value="false">Not Suspicious</option>
        </select>
        <br />

        <label>Promotion ID: </label>
        <input
          type="number"
          value={filters.promotionId}
          onChange={(e) =>
            setFilters({ ...filters, promotionId: e.target.value, page: 1 })
          }
        />
        <br />

        <label>Type: </label>
        <select
          value={filters.type}
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value, page: 1 })
          }
        >
          <option value="">All</option>
          <option value="purchase">Purchase</option>
          <option value="adjustment">Adjustment</option>
          <option value="redemption">Redemption</option>
          <option value="transfer">Transfer</option>
          <option value="event">Event</option>
        </select>
        <br />

        <label>Transaction ID: </label>
        <input
          type="number"
          value={filters.relatedId}
          onChange={(e) =>
            setFilters({ ...filters, relatedId: e.target.value, page: 1 })
          }
        />
        <br />

        <label>Amount: </label>
        <input
          type="number"
          value={filters.amount}
          onChange={(e) =>
            setFilters({ ...filters, amount: e.target.value, page: 1 })
          }
        />
        <br />

        
        <label>Operator: </label>
        <label>Operator: </label>
        <select
          value={filters.operator}
          onChange={(e) =>
            setFilters({ ...filters, operator: e.target.value, page: 1 })
          }
        >
          <option value="">All</option>
          <option value="gte">Greater Than or Equal</option>
          <option value="lte">Less Than or Equal</option>
        </select>

      </div>

      <br />

      {/* SORTING */}
      <div>
        <label>Sort By: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Created Date</option>
          <option value="amount">Amount</option>
          <option value="id">ID</option>
          <option value="type">Type</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
        
      <br></br>

      <label>Items per page: </label>
      <select
        value={filters.limit}
        onChange={(e) =>
          setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })
        }
      >
        <option value="5">5</option>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="25">25</option>
      </select>



      {sortedTransactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (

      
      <table border="1" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>UtorID</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Spent</th>
            <th>Created By</th>
            <th>Suspicious</th>
            <th>Promotion IDs</th>
            <th>Remark</th>
            <th>Edit</th>
      
          </tr>
        </thead>

        <tbody>
          {sortedTransactions.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <th>{t.utorid}</th>
              <td>{t.amount}</td>
              <td>{t.type}</td>
              <td>{t.spent}</td>
              <td>{t.createdBy}</td>
              <td>{t.suspicious ? "Yes" : "No"}</td>
              <td>
                {t.promotionIds && t.promotionIds.length > 0
                  ? t.promotionIds.join(", ")
                  : "None"}
              </td>
              <td>{t.remark ? t.remark : "No remarks"}</td>
              <td>
                <Link to={`/manager/transactions/${t.id}`}>Edit</Link>
            </td>
            </tr>
          ))}
        </tbody>
      </table>

        )}

      {/* PAGINATION */}
      <br />
      <div>
        <button
          disabled={filters.page === 1}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {filters.page} of {totalPages || 1}
        </span>

        <button
          disabled={filters.page >= totalPages}
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
}