import { createContext, useContext, useCallback } from "react";

const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  // ------------------------------------
  // Get Event by ID
  // ------------------------------------
  const getEventById = useCallback(async (eventId) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}`, {
      headers: authHeader(),
    });

    const data = await res.json();

    if (!res.ok) return { error: data.error || "Failed to load event" };
    return { data };
  }, []);

  // ------------------------------------
  // Award Points
  // ------------------------------------
  const awardPoints = useCallback(async (eventId, payload) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}/transactions`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) return { error: data.error || "Failed to award points" };
    return { data };
  }, []);

   // --------------------------
  // Get My Events (as organizer)
  // --------------------------
  const getMyEvents = async () => {
    try {
        const userId = localStorage.getItem("userId"); 
        const res = await fetch(`${BACKEND_URL}/events/organizer/events?userId=${userId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        });

        const data = await res.json();

        if (!res.ok) {
        return { error: data.error || "Failed to load organizer events" };
        }

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
    <EventContext.Provider value={{ getEventById, awardPoints, getMyEvents, updateEvent, addGuest }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
