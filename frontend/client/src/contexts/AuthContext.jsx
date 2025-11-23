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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
