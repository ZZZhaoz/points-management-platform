import { createContext, useContext } from "react";

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  // --------------------------
  // Create Transaction
  // --------------------------
  const createTransaction = async (utorid, type, spent, promotionIds, remark) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return { error: "Not authenticated" };

      const res = await fetch(`${BACKEND_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ utorid, type, spent, promotionIds, remark }),
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to create transaction" };
      }

      const data = await res.json();
      return { data };

    } catch (err) {
      return { error: "Network error" };
    }
  };

  // --------------------------
  // Process Redemption
  // --------------------------
  const processRedemption = async (transactionId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return { error: "Not authenticated" };

      const res = await fetch(
        `${BACKEND_URL}/transactions/${transactionId}/processed`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ processed: true }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to process transaction" };
      }

      const data = await res.json();
      return { data };

    } catch (err) {
      return { error: "Network error" };
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        createTransaction,
        processRedemption,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

// Hook for components to use context
export function useTransactions() {
  return useContext(TransactionContext);
}
