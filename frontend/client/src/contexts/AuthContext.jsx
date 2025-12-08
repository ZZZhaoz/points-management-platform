import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [viewRole, setViewRole] = useState(
    localStorage.getItem("viewRole") || null
  );

  // --------------------------
  // Load user after refresh
  // --------------------------
 useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    setUser(null);
    setViewRole(null);
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
        localStorage.removeItem("viewRole");
        setUser(null);
        setViewRole(null);
        return;
      }

      const data = await res.json();
      setUser(data);

      localStorage.setItem("role", data.role);

      if (viewRole === null) {
        const savedRole = localStorage.getItem("viewRole");
        if (savedRole) {
          setViewRole(savedRole);
        } else {
          localStorage.setItem("viewRole", data.role);
          setViewRole(data.role);
        }
      }
    })
    .catch(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("viewRole");
      setUser(null);
      setViewRole(null);
    });
}, [BACKEND_URL, token]); 

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
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(meData);

      localStorage.setItem("viewRole", meData.role);
      setViewRole(meData.role);

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
    localStorage.removeItem("viewRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("utorid");
    localStorage.removeItem("avatarUrl");
    localStorage.removeItem("isOrganizer");

    setUser(null);
    setViewRole(null);
    setToken(null);
  };

  // --------------------------
  // Change Interface Role (Switch View)
  // --------------------------
  const changeViewRole = (role) => {
    localStorage.setItem("viewRole", role);
    setViewRole(role);
  };

  // --------------------------
  // Get User by ID
  // --------------------------
  const getUserById = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return { error: "Not authenticated" };

      const res = await fetch(`${BACKEND_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to get user" };
      }

      const data = await res.json();
      return { data };
    } catch {
      return { error: "Network error" };
    }
  };

  // Check if user is organizer for specific event
  const isOrganizerOf = (event) => {
    if (!user || !event?.organizers) return false;
    return event.organizers.some((org) => org.id === user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        getUserById,
        isOrganizerOf,
        updateUserRole: () => {}, // optional
        viewRole,
        changeViewRole,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
