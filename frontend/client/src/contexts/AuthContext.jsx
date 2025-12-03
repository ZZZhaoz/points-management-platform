import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  const [user, setUser] = useState(null);

  // --------------------------
  // Load user after refresh
  // --------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      localStorage.removeItem("role");
      return;
    }

    fetch(`${BACKEND_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
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

        // store role for ProtectedRoute
        localStorage.setItem("role", data.role);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setUser(null);
      });
  }, [BACKEND_URL]);

  // --------------------------
  // Login
  // --------------------------
  const login = async (utorid, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utorid, password }),
      });

      const data = await res.json();  

      if (!res.ok) {
        return data.error || "Login failed";
      }

      localStorage.setItem("token", data.token);

      const me = await fetch(`${BACKEND_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      const meData = await me.json();

      localStorage.setItem("role", meData.role);
      localStorage.setItem("userId", meData.id);
      localStorage.setItem("utorid", meData.utorid);
      localStorage.setItem("avatarUrl", meData.avatarUrl || "");
      localStorage.setItem("isOrganizer", meData.isOrganizer ? "true" : "false");

      setUser(meData);  

      return null;

    } catch (err) {
      return "Network error";
    }
  };



  // --------------------------
  // Logout
  // --------------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };


  // --------------------------
  // Get User By ID
  // --------------------------
  const getUserById = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { error: "Not authenticated" };
      }

      const res = await fetch(`${BACKEND_URL}/users/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to get user" };
      }

      const data = await res.json();
      return { data };
    } catch (err) {
      return { error: "Network error" };
    }
  };

  // --------------------------
  // Update User Role
  // --------------------------
  const updateUserRole = async (userId, role) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { error: "Not authenticated" };
      }

      const res = await fetch(`${BACKEND_URL}/users/${userId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to update user role" };
      }

      const data = await res.json();
      return { data };
    } catch (err) {
      return { error: "Network error" };
    }
  };

  const isOrganizerOf = (event) => {
    if (!user || !event || !Array.isArray(event.organizers)) return false;
    return event.organizers.some((org) => org.id === user.id);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getUserById, updateUserRole, isOrganizerOf }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
