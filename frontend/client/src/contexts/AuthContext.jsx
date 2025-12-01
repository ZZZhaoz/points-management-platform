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

  return (
    <AuthContext.Provider value={{ user, login, logout, createTransaction, processRedemption }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
