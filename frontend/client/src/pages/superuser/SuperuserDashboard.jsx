import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* Functions used to get user info*/

async function fetchAllUsers(BACKEND_URL, token, limit = 50) {
  let allUsers = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${BACKEND_URL}/users?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    const users = data.results || [];

    allUsers = allUsers.concat(users);

    if (allUsers.length >= (data.count || 0) || users.length === 0) {
      break;
    }

    page += 1;
  }

  return allUsers;
}

function computeUserStats(users) {
  let total = users.length;

  let regular = 0;
  let cashier = 0;
  let manager = 0;
  let superuser = 0;

  let verified = 0;
  let unverified = 0;

  users.forEach((u) => {
    switch (u.role) {
      case "regular":
        regular++;
        break;
      case "cashier":
        cashier++;
        break;
      case "manager":
        manager++;
        break;
      case "superuser":
        superuser++;
        break;
      default:
        break;
    }

    if (u.verified) verified++;
    else unverified++;
  });

  return {
    total,
    regular,
    cashier,
    manager,
    superuser,
    verified,
    unverified,
  };
}




function UserCard({ stats}) {
  return (
    <div
    >
      <h2 >Users</h2>

      <p><strong>Total Users:</strong> {stats.total}</p>
      <p><strong>Regular:</strong> {stats.regular}</p>
      <p><strong>Cashiers:</strong> {stats.cashier}</p>
      <p><strong>Managers:</strong> {stats.manager}</p>
      <p><strong>Superusers:</strong> {stats.superuser}</p>
      <p><strong>Verified:</strong> {stats.verified}</p>
      <p><strong>Not Verified:</strong> {stats.unverified}</p>

    </div>
  );
}


/* Functions used to get Transaction info*/

async function fetchAllTransactions(BACKEND_URL, token) {
  let all = [];
  let page = 1;
  const limit = 50;

  while (true) {
    const res = await fetch(
      `${BACKEND_URL}/transactions?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    const results = data.results || [];

    all = all.concat(results);

    if (all.length >= (data.count || 0) || results.length === 0) break;

    page++;
  }

  return all;
}




function computeTransactionStats(transactions) {
  const stats = {
    total: transactions.length,
    purchase: 0,
    adjustment: 0,
    redemption: 0,
    transfer: 0,
    event: 0,
    suspicious: 0,
    nonSuspicious: 0,
  };

  transactions.forEach((t) => {
    if (stats[t.type] !== undefined) stats[t.type]++;

    if (t.suspicious) stats.suspicious++;
    else stats.nonSuspicious++;
  });

  return stats;
}


function TransactionCard({ stats}) {
  return (
    <div
    >
      <h2>Transactions</h2>

      <p><strong>Total:</strong> {stats.total}</p>
      <p><strong>Purchase:</strong> {stats.purchase}</p>
      <p><strong>Adjustment:</strong> {stats.adjustment}</p>
      <p><strong>Redemption:</strong> {stats.redemption}</p>
      <p><strong>Transfer:</strong> {stats.transfer}</p>
      <p><strong>Event:</strong> {stats.event}</p>
      <p><strong>Suspicious:</strong> {stats.suspicious}</p>
      <p><strong>Not Suspicious:</strong> {stats.nonSuspicious}</p>

      <Link to="/manager/transactions">

      </Link>
    </div>
  );
}


/* Helper functions to get the event info */
async function fetchAllEvents(BACKEND_URL, token) {
  let allEvents = [];
  let page = 1;
  const limit = 50;

  while (true) {
    const res = await fetch(
      `${BACKEND_URL}/events?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    const events = data.results || [];

    allEvents = allEvents.concat(events);

    if (allEvents.length >= (data.count || 0) || events.length === 0) {
      break;
    }

    page++;
  }

  return allEvents;
}


function computeEventStats(events) {
  const stats = {
    total: events.length,
    published: 0,
    unpublished: 0,
    started: 0,
    notStarted: 0,
    ended: 0,
    notEnded: 0,
    full: 0,
    notFull: 0,
  };

  const now = new Date();

  events.forEach((ev) => {
    // Published
    ev.published ? stats.published++ : stats.unpublished++;

    // Started / ended logic
    const start = new Date(ev.startTime);
    const end = new Date(ev.endTime);

    if (now >= start) stats.started++;
    else stats.notStarted++;

    if (now >= end) stats.ended++;
    else stats.notEnded++;

    // Full event check
    if (ev.capacity !== null && ev.numGuests >= ev.capacity) {
      stats.full++;
    } else {
      stats.notFull++;
    }
  });

  return stats;
}


function EventCard({ stats }) {
  return (
    <div>
      <h2>Events</h2>

      <p><strong>Total Events:</strong> {stats.total}</p>
      <p><strong>Published:</strong> {stats.published}</p>
      <p><strong>Unpublished:</strong> {stats.unpublished}</p>

      <p><strong>Started:</strong> {stats.started}</p>
      <p><strong>Not Started:</strong> {stats.notStarted}</p>

      <p><strong>Ended:</strong> {stats.ended}</p>
      <p><strong>Not Ended:</strong> {stats.notEnded}</p>

      <p><strong>Full Events:</strong> {stats.full}</p>
      <p><strong>Not Full:</strong> {stats.notFull}</p>

    </div>
  );
}



export async function fetchAllPromotions(BACKEND_URL, token) {
  let allPromotions = [];
  let page = 1;
  const limit = 50;

  while (true) {
    const res = await fetch(
      `${BACKEND_URL}/promotions?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    const promos = data.results || [];

    allPromotions = allPromotions.concat(promos);

    if (allPromotions.length >= (data.count || 0) || promos.length === 0) {
      break;
    }

    page += 1;
  }

  return allPromotions;
}


export function computePromotionStats(promotions) {
  const now = new Date();

  let automatic = 0;
  let onetime = 0;

  let expired = 0;
  let expiredAutomatic = 0;
  let expiredOnetime = 0;

  promotions.forEach((p) => {
    const isAutomatic = p.type === "automatic";

    if (isAutomatic) automatic++;
    else onetime++;


    const isExpired = p.endTime && new Date(p.endTime) < now;

    if (isExpired) {
      expired++;

      if (isAutomatic) expiredAutomatic++;
      else expiredOnetime++;
    }
  });

  return {
    total: promotions.length,
    automatic,
    onetime,
    expired,
    expiredAutomatic,
    expiredOnetime,
  };
}


function PromotionCard({ stats }) {
  return (



    <div
    >
      <h2>Promotions</h2>

      <p><strong>Total Promotions:</strong> {stats.total}</p>
      <p><strong>Automatic:</strong> {stats.automatic}</p>
      <p><strong>One-Time:</strong> {stats.onetime}</p>
      <p><strong>Expired:</strong> {stats.expired}</p>
      <p><strong>Automatic Expired:</strong> {stats.expiredAutomatic}</p>
      <p><strong>One-Time Expired:</strong> {stats.expiredOnetime}</p>

    </div>
  );
}



const cardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  transition: "0.2s ease",
};

const cardHover = {
  transform: "translateY(-3px)",
  boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
};

const linkReset = {
  textDecoration: "none",
  color: "inherit",
  display: "block",
};

export default function SuperuserDashboard() {
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [userStats, setUserStats] = useState({
    total: 0,
    regular: 0,
    cashier: 0,
    manager: 0,
    superuser: 0,
    verified: 0,
    unverified: 0,
  });

  const [promoStats, setPromoStats] = useState({
      total: 0,
      automatic: 0,
      onetime: 0,
      expired: 0,
    });
  const [transactionStats, setTransactionStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUserStats() {
      try {
        const allUsers = await fetchAllUsers(BACKEND_URL, token);
        if (cancelled) return;

        const stats = computeUserStats(allUsers);
        setUserStats(stats);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUserStats();



    return () => {
      cancelled = true;
    };
  }, [BACKEND_URL, token]);

    useEffect(() => {
      async function load() {
        const allTx = await fetchAllTransactions(BACKEND_URL, token);
        setTransactionStats(computeTransactionStats(allTx));
      }
      load();
    }, [BACKEND_URL, token]);


    useEffect(() => {
      async function load() {
        const allEvents = await fetchAllEvents(BACKEND_URL, token);
        setEventStats(computeEventStats(allEvents));
      }
      load();
    }, [BACKEND_URL, token]);



    useEffect(() => {
      let cancelled = false;

      async function loadPromotions() {
        const allPromos = await fetchAllPromotions(BACKEND_URL, token);
        if (cancelled) return;

        const stats = computePromotionStats(allPromos);
        setPromoStats(stats);
      }

  loadPromotions();
  return () => { cancelled = true; };
}, [BACKEND_URL, token]);


  if (loading) return <p>Loading dashboard...</p>;

  return (
      <div style={{ padding: "30px" }}>
        <h1>Superuser Dashboard</h1>

        {/* 2×2 GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            maxWidth: "1100px",
            margin: "0 auto",
            marginTop: "30px",
          }}
        >
          {/* USERS */}
          <Link
            to="/manager/users"
            style={{...cardStyle, ...linkReset}}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <UserCard stats={userStats} />
          </Link>

          {/* TRANSACTIONS */}
          {transactionStats && (
            <Link
              to="/manager/transactions"
              style={{...cardStyle, ...linkReset}}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, cardHover)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, cardStyle)
              }
            >
              <TransactionCard stats={transactionStats} />
            </Link>
          )}

          {/* EVENTS */}
          {eventStats && (
            <Link
              to="/manager/events"
              style={{...cardStyle, ...linkReset}}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, cardHover)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, cardStyle)
              }
            >
              <EventCard stats={eventStats} />
            </Link>
          )}

          {/* PROMOTIONS */}
          {promoStats && (
            <Link
              to="/manager/promotions"
              style={{...cardStyle, ...linkReset}}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, cardHover)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, cardStyle)
              }
            >
              <PromotionCard stats={promoStats} />
            </Link>
          )}
        </div>
      </div>

    




  );
}