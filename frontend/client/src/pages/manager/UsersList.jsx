import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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




  if (loading) return <p>Loading users...</p>;

  const sortedUsers = sortUsers(users, sortBy, sortOrder);
  const totalPages = Math.ceil(totalCount / filters.limit);



  return (
    <div>
      <h1>All Users</h1>

      
      <label htmlFor="name">Search By Name: </label>
      <input id="name"
        value={filters.name}
        onChange={e => setFilters({ ...filters, name: e.target.value, page: 1 })}
      /> 


      <br></br>

      <label htmlFor="role">Search By Role: </label>

      <select id="role"
        value={filters.role}
        onChange={e => setFilters({ ...filters, role: e.target.value, page: 1 })}
      >
        <option value="">All</option>
        <option value="regular">Regular</option>
        <option value="cashier">Cashier</option>
        <option value="manager">Manager</option>
        <option value="superuser">Superuser</option>
      </select>


      <br></br>
  
      
      <label>Sort By: </label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">Name</option>
        <option value="utorid">UtorID</option>
        <option value="role">Role</option>
      </select>

      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>


      <table border="1" >
        <thead>
          <tr>
            <th>UtorID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Birthday</th>
            <th>Role</th>
            <th>Verified</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sortedUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.utorid}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.birthday ? u.birthday: "Not Provided"}</td>
              <td>{u.role}</td>
              <td>{u.verified ? "Yes" : "No"}</td>
              <td>
                  {
 
                      <Link to={`/manager/users/${u.id}`}>Edit</Link>
                    
                  }

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      {/* Pagination implementation*/}
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