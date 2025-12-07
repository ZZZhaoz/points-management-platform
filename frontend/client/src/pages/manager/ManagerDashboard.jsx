import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ManagerDashboard.css";

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
    <>
      <div className="stat-card-header">
        <span className="stat-card-icon">👤</span>
        <h2 className="stat-card-title">Users</h2>
      </div>
      <div className="stat-card-content">
        <div className="stat-item">
          <span className="stat-item-label">Total Users</span>
          <span className="stat-item-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Regular</span>
          <span className="stat-item-value">{stats.regular}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Cashiers</span>
          <span className="stat-item-value">{stats.cashier}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Managers</span>
          <span className="stat-item-value">{stats.manager}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Superusers</span>
          <span className="stat-item-value">{stats.superuser}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Verified</span>
          <span className="stat-item-value">{stats.verified}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Not Verified</span>
          <span className="stat-item-value">{stats.unverified}</span>
        </div>
      </div>
    </>
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
    <>
      <div className="stat-card-header">
        <span className="stat-card-icon">💸</span>
        <h2 className="stat-card-title">Transactions</h2>
      </div>
      <div className="stat-card-content">
        <div className="stat-item">
          <span className="stat-item-label">Total</span>
          <span className="stat-item-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Purchase</span>
          <span className="stat-item-value">{stats.purchase}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Adjustment</span>
          <span className="stat-item-value">{stats.adjustment}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Redemption</span>
          <span className="stat-item-value">{stats.redemption}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Transfer</span>
          <span className="stat-item-value">{stats.transfer}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Event</span>
          <span className="stat-item-value">{stats.event}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Suspicious</span>
          <span className="stat-item-value">{stats.suspicious}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Not Suspicious</span>
          <span className="stat-item-value">{stats.nonSuspicious}</span>
        </div>
      </div>
    </>
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
    <>
      <div className="stat-card-header">
        <span className="stat-card-icon">🎪</span>
        <h2 className="stat-card-title">Events</h2>
      </div>
      <div className="stat-card-content">
        <div className="stat-item">
          <span className="stat-item-label">Total Events</span>
          <span className="stat-item-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Published</span>
          <span className="stat-item-value">{stats.published}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Unpublished</span>
          <span className="stat-item-value">{stats.unpublished}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Started</span>
          <span className="stat-item-value">{stats.started}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Not Started</span>
          <span className="stat-item-value">{stats.notStarted}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Ended</span>
          <span className="stat-item-value">{stats.ended}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Not Ended</span>
          <span className="stat-item-value">{stats.notEnded}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Full Events</span>
          <span className="stat-item-value">{stats.full}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Not Full</span>
          <span className="stat-item-value">{stats.notFull}</span>
        </div>
      </div>
    </>
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
    <>
      <div className="stat-card-header">
        <span className="stat-card-icon">🎁</span>
        <h2 className="stat-card-title">Promotions</h2>
      </div>
      <div className="stat-card-content">
        <div className="stat-item">
          <span className="stat-item-label">Total Promotions</span>
          <span className="stat-item-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Automatic</span>
          <span className="stat-item-value">{stats.automatic}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">One-Time</span>
          <span className="stat-item-value">{stats.onetime}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Expired</span>
          <span className="stat-item-value">{stats.expired}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">Automatic Expired</span>
          <span className="stat-item-value">{stats.expiredAutomatic}</span>
        </div>
        <div className="stat-item">
          <span className="stat-item-label">One-Time Expired</span>
          <span className="stat-item-value">{stats.expiredOnetime}</span>
        </div>
      </div>
    </>
  );
}




export default function ManagerDashboard() {
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


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="manager-dashboard">
      <div className="manager-dashboard-header">
        <h1 className="manager-dashboard-title">👔 Manager Dashboard</h1>
        <p className="manager-dashboard-subtitle">Overview of users, transactions, events, and promotions</p>
      </div>

      <div className="stats-grid">
          {/* USERS */}
          <Link to="/manager/users" className="stat-card users">
            <UserCard stats={userStats} />
          </Link>

          {/* TRANSACTIONS */}
          {transactionStats && (
            <Link to="/manager/transactions" className="stat-card transactions">
              <TransactionCard stats={transactionStats} />
            </Link>
          )}

          {/* EVENTS */}
          {eventStats && (
            <Link to="/manager/events" className="stat-card events">
              <EventCard stats={eventStats} />
            </Link>
          )}

          {/* PROMOTIONS */}
          {promoStats && (
            <Link to="/manager/promotions" className="stat-card promotions">
              <PromotionCard stats={promoStats} />
            </Link>
          )}
        </div>
      </div>

    




  );
}