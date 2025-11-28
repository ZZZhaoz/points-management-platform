import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function getQuery(filters) {
  const params = new URLSearchParams();

  if (filters.name.trim() !== "") params.set("name", filters.name);
  if (filters.type && filters.type.trim() !== ""){
                params.set("type", filters.type);
  }

  params.set("page", filters.page);
  params.set("limit", filters.limit);

  return params.toString();
}

function sortPromotions(promos, sortBy, sortOrder) {
  const sorted = [...promos];

  sorted.sort((a, b) => {
    let x = a[sortBy];
    let y = b[sortBy];

    if (sortBy === "startTime" || sortBy === "endTime") {
      x = new Date(x);
      y = new Date(y);
    }

    if (x < y) return sortOrder === "asc" ? -1 : 1;
    if (x > y) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

export default function PromotionsList() {
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Use state for filters
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    page: 1,
    limit: 10,
  });

  // Use state for sorting
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Use state for pagination and data
  const [promotions, setPromotions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Use state to hold temporary name

  // FETCH
  useEffect(() => {

    console.log(getQuery(filters));
    fetch(`${BACKEND_URL}/promotions?${getQuery(filters)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("Failed to load promotions");
          return;
        }
        const data = await res.json();
        setPromotions(data.results || []);
        setTotalCount(data.count || 0);
      })
      .finally(() => setLoading(false));
  }, [filters, BACKEND_URL, token]);

  if (loading) return <p>Loading promotions...</p>;

  const sortedPromotions = sortPromotions(promotions, sortBy, sortOrder);
  const totalPages = Math.ceil(totalCount / filters.limit);

  return (
    <div>
      <h1>All Promotions</h1>

      <label>Search Name: </label>
      <input
      value={filters.name}
      onChange={(e) =>
          setFilters({ ...filters, name: e.target.value, page: 1 })
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
        <option value="automatic">Automatic</option>
        <option value="onetime">One-Time</option>
      </select>

      <br />
      <br />

      {/* SORTING */}
      <label>Sort By: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">Name</option>
        <option value="type">Type</option>
        <option value="startTime">Starting Date</option>
        <option value="endTime">Expiry Date</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
        </select>

        {/* TABLE */}
        <table border="1" style={{ marginTop: "20px" }}>
        <thead>
            <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Starting Date</th>
            <th>Expiry Date</th>
            <th>Min Spending</th>
            <th>Rate</th>
            <th>Points</th>
            <th>Actions</th>
            </tr>
        </thead>

        <tbody>
            {sortedPromotions.map((p) => (
            <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.type}</td>
                <td>{p.startTime}</td>
                <td>{p.endTime}</td>

                {/* OPTIONAL FIELDS — may be null */}
                <td>{p.minSpending !== null ? p.minSpending : "-"}</td>
                <td>{p.rate !== null ? p.rate : "-"}</td>
                <td>{p.points !== null ? p.points : "-"}</td>

                <td>
                <Link to={`/manager/promotions/${p.id}`}>Edit</Link>
                </td>
            </tr>
            ))}
        </tbody>
        </table>

      {/* PAGINATION */}
      <br />
      <div>
        <button
          disabled={filters.page === 1}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          Previous
        </button>

        <span>
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