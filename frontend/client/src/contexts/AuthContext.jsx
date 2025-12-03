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
      localStorage.setItem("utorid", meData.utorid);
      localStorage.setItem("avatarUrl", meData.avatarUrl || "");

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

  // --------------------------
  // Award points to a guest or all guests
  // --------------------------
  const awardPoints = async (eventId, { type, utorid, amount, remark }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { error: "Not authenticated" };
      }

      const body = { type, amount };
      if (utorid) {
        body.utorid = utorid;
      }
      if (remark) {
        body.remark = remark;
      }

      const res = await fetch(`${BACKEND_URL}/events/${eventId}/transactions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to award points" };
      }

      const data = await res.json();
      return { data };
    } catch (err) {
      return { error: "Network error" };
    }
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
    <AuthContext.Provider value={{ user, login, logout, createTransaction, processRedemption, getMyEvents, getEventById, updateEvent, addGuest, awardPoints, getUserById, updateUserRole, isOrganizerOf }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
