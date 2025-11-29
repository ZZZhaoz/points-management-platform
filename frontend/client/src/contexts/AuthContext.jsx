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

      if (!res.ok) {
        const err = await res.json();
        return err.error || "Login failed";
      }

      const { token } = await res.json();

      localStorage.setItem("token", token);

      // Fetch profile
      const me = await fetch(`${BACKEND_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const meData = await me.json();
      setUser(meData);

      localStorage.setItem("role", meData.role);
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
  // Create Transaction
  // --------------------------
  const createTransaction = async (utorid, type, spent, promotionIds, remark) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return "Not authenticated";
      }

      const res = await fetch(`${BACKEND_URL}/transactions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ utorid, type, spent, promotionIds, remark }),
      });

      if (!res.ok) {
        const err = await res.json();
        return err.error || "Create transaction failed";
      }

      return null;
    } catch (err) {
      return "Network error";
    }
  };

  // --------------------------
  // Process Redemption
  // --------------------------
  const processRedemption = async(transactionId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return "Not authenticated";
      }

      const res = await fetch(`${BACKEND_URL}/transactions/${transactionId}/processed`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ processed: true }),
      });

      if (!res.ok) {
        const err = await res.json();
        return err.error || "Failed to process transaction";
      }

      return null;
    } catch (err) {
      return "Network error";
    }
  }

  // --------------------------
  // Get My Events (as organizer)
  // --------------------------
  const getMyEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { error: "Not authenticated" };
      }

      const res = await fetch(`${BACKEND_URL}/events/organized/me`, {
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to get events" };
      }

      const data = await res.json();
      return { data: data || [] };
    } catch (err) {
      return { error: "Network error" };
    }
  };

  // --------------------------
  // Get Event By ID
  // --------------------------
  const getEventById = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { error: "Not authenticated" };
      }

      const res = await fetch(`${BACKEND_URL}/events/${eventId}`, {
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to get event" };
      }

      const data = await res.json();
      return { data };
    } catch (err) {
      return { error: "Network error" };
    }
  };

  // --------------------------
  // Update Event
  // --------------------------
  const updateEvent = async (eventId, eventData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { error: "Not authenticated" };
      }

      const res = await fetch(`${BACKEND_URL}/events/${eventId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to update event" };
      }

      const data = await res.json();
      return { data };
    } catch (err) {
      return { error: "Network error" };
    }
  };


  // --------------------------
  // Add a guest to the event
  // --------------------------
  const addGuest = async (eventId, eventData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { error: "Not authenticated" };
      }

      const res = await fetch(`${BACKEND_URL}/events/${eventId}/guests`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to update event" };
      }

      const data = await res.json();
      return { data };
    } catch (err) {
      return { error: "Network error" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, createTransaction, processRedemption, getMyEvents, getEventById, updateEvent, addGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
