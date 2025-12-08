import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./UsersList.css";

export function GetQuery(filters) {

  const params = new URLSearchParams();

  if (filters.name){
     params.set("name", filters.name);
    }

  if (filters.role) {
    params.set("role", filters.role);

  }

  if (filters.verified !== "") {
    params.set("verified", filters.verified);
  }
  if (filters.activated !== "") {
    params.set("activated", filters.activated);
  }

  params.set("page", filters.page);
  params.set("limit", filters.limit);

  return params.toString();
}



export function sortUsers(users, sortBy, sortOrder) {
  const sorted = [...users];

  sorted.sort((a, b) => {
    const x = a[sortBy];
    const y = b[sortBy];

    if (x < y) return sortOrder === "asc" ? -1 : 1;
    if (x > y) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}


export default function UsersList() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");


  // Use state for filtering
  const [filters, setFilters] = useState({
    name: "",
    role: "",
    verified: "",
    activated: "",
    page: 1,
    limit: 10,
  });

  // User state for sorting, pagination and user data
  const [sortBy, setSortBy] = useState("name");   
  const [sortOrder, setSortOrder] = useState("asc"); 
  const [totalCount, setTotalCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);


  // Send request to the backend
  useEffect(() => {

    console.log(GetQuery(filters));

    fetch(`${BACKEND_URL}/users?${GetQuery(filters)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("Failed to load users");
          return;
        }
        const data = await res.json();


        const usersArray = data.results || [];
        setTotalCount(data.count || 0);


      setUsers(usersArray);
      })
      .finally(() => setLoading(false));
  }, [filters, BACKEND_URL, token]);




  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  const sortedUsers = sortUsers(users, sortBy, sortOrder);
  const totalPages = Math.ceil(totalCount / filters.limit);

  return (
    <div className="users-list-page">
      <div className="users-list-header">
        <h1 className="users-list-title">👤 All Users</h1>
        <p className="users-list-subtitle">Manage and view all system users</p>
      </div>

      <div className="filters-card">
        <h2 className="filters-title">Filters & Search</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="name" className="filter-label">Search By Name</label>
            <input
              id="name"
              type="text"
              className="filter-input"
              value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value, page: 1 })}
              placeholder="Enter name..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="role" className="filter-label">Role</label>
            <select
              id="role"
              className="filter-select"
              value={filters.role}
              onChange={e => setFilters({ ...filters, role: e.target.value, page: 1 })}
            >
              <option value="">All Roles</option>
              <option value="regular">Regular</option>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="superuser">Superuser</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="verified" className="filter-label">Verified Status</label>
            <select
              id="verified"
              className="filter-select"
              value={filters.verified}
              onChange={e => setFilters({ ...filters, verified: e.target.value, page: 1 })}
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="activated" className="filter-label">Activated Status</label>
            <select
              id="activated"
              className="filter-select"
              value={filters.activated}
              onChange={e => setFilters({ ...filters, activated: e.target.value, page: 1 })}
            >
              <option value="">All</option>
              <option value="true">Activated</option>
              <option value="false">Not Activated</option>
            </select>
          </div>
        </div>

        <div className="sort-controls">
          <div className="sort-group">
            <label className="filter-label">Sort By:</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ minWidth: "150px" }}
            >
              <option value="name">Name</option>
              <option value="utorid">UtorID</option>
              <option value="role">Role</option>
            </select>
          </div>

          <div className="sort-group">
            <label className="filter-label">Order:</label>
            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="sort-group">
            <label className="filter-label">Items per page:</label>
            <select
              className="filter-select"
              value={filters.limit}
              onChange={(e) =>
                setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })
              }
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="25">25</option>
            </select>
          </div>
        </div>
      </div>

      {sortedUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-text">No Users Found. Try a Different Filter!</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>UtorID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Birthday</th>
                <th>Role</th>
                <th>Points</th>
                <th>Created At</th>
                <th>Last Login</th>
                <th>Verified</th>
                <th>Avatar</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.utorid}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.birthday ? u.birthday : "Not Provided"}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                  </td>
                  <td><strong>{u.points}</strong></td>
                  <td>{u.createdAt}</td>
                  <td>{u.lastLogin ? u.lastLogin : "Never"}</td>
                  <td>
                    <span className={`verified-badge ${u.verified ? "yes" : "no"}`}>
                      {u.verified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>{u.avatarUrl ? u.avatarUrl : "None"}</td>
                  <td>
                    <Link to={`/manager/users/${u.id}`} className="edit-link">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button
          className="pagination-button"
          disabled={filters.page === 1}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          Previous
        </button>

        <span className="pagination-info">
          Page {filters.page} of {totalPages || 1}
        </span>

        <button
          className="pagination-button"
          disabled={filters.page >= totalPages}
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
}