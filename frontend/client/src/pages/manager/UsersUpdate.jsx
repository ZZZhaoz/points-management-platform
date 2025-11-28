import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function UsersUpdate() {
  const { userId } = useParams();    
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // For editable fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [verified, setVerified] = useState(false);
  const [suspicious, setSuspicious] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("User not found");
          return;
        }
        const data = await res.json();

        setUser(data);
        setName(data.name ?? "");
        setRole(data.role ?? "");
        setVerified(data.verified ?? false);
        setSuspicious(data.suspicious ?? false);

      })
      .finally(() => setLoading(false));
  }, [userId, BACKEND_URL, token]);

  if (loading) return <p>Loading user...</p>;
  if (!user) return <p>User not found.</p>;

  // Handle submit
  const handleUpdate = (e) => {
    e.preventDefault();

    fetch(`${BACKEND_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        role,
        verified,
        suspicious
      })
    })

    
    .then(async (res) => {
    if (!res.ok) {
        alert("Can't update user info!");
        return;
    }
    alert("User updated!");
    navigate("/manager/users");
    });
  };

  return (
    <div>
      <h1>Update User Info</h1>

      <form onSubmit={handleUpdate}>

        {/* Name */}
        <div>
          <label>Name: </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Role Change the to being manager or supervisor*/}
        <div>
          <label>Role: </label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="regular">Regular</option>
            <option value="cashier">Cashier</option>
          </select>
        </div>

        {/* Set whether the user is verifiend or not*/}
        <div>
          <label>Verified: </label>
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
          />
        </div>


        {/*Set the user to suspicious*/}
        <div>
            <label>Suspicious: </label>
            <input
                type="checkbox"
                checked={suspicious}
                onChange={(e) => setSuspicious(e.target.checked)}
            />
        </div>

        <br />
        <button type="submit">Update User</button>
        <button type="button" onClick={() => navigate("/manager/users")}>
          Cancel
        </button>

      </form>
    </div>
  );
}