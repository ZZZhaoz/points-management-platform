import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";
import "./ManagerStatistics.css";

async function fetchAllUsers(BACKEND_URL, token, limit = 50) {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${BACKEND_URL}/users?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const items = data.results || [];
    all = all.concat(items);
    if (all.length >= (data.count || 0) || items.length === 0) break;
    page++;
  }
  return all;
}

async function fetchAllEvents(BACKEND_URL, token, limit = 50) {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${BACKEND_URL}/events?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const items = data.results || [];
    all = all.concat(items);
    if (all.length >= (data.count || 0) || items.length === 0) break;
    page++;
  }
  return all;
}

async function fetchAllPromotions(BACKEND_URL, token, limit = 50) {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${BACKEND_URL}/promotions?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const items = data.results || [];
    all = all.concat(items);
    if (all.length >= (data.count || 0) || items.length === 0) break;
    page++;
  }
  return all;
}

async function fetchAllTransactions(BACKEND_URL, token, limit = 50) {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${BACKEND_URL}/transactions?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const items = data.results || [];
    all = all.concat(items);
    if (all.length >= (data.count || 0) || items.length === 0) break;
    page++;
  }
  return all;
}

function getSnapshotDate(range) {
  const now = new Date();
  console.log(now)
  let snapshot = new Date();
  switch (range) {
    case "day": return now;
    case "week": snapshot.setDate(now.getDate() - 7); break;
    case "month": snapshot.setMonth(now.getMonth() - 1); break;
    case "year": snapshot.setFullYear(now.getFullYear() - 1); break;
    case "5years": snapshot.setFullYear(now.getFullYear() - 5); break;
  }
  return snapshot;
}

function userSnapshot(users, time) {
  const roles = {
    total: 0,
    regular: 0,
    cashier: 0,
    manager: 0,
    superuser: 0,
  };
  users.forEach((u) => {
    const d = new Date(u.createdAt);
    if (d <= time) {
      roles.total++;
      roles[u.role] = (roles[u.role] || 0) + 1;
    }
  });
  return roles;
}

function eventSnapshot(events, time) {
  return events.filter((e) => new Date(e.startTime) <= time).length;
}

function promotionSnapshot(promos, time) {
  let auto = 0;
  let one = 0;
  promos.forEach((p) => {
    const d = new Date(p.startTime);
    if (d <= time) {
      p.type === "automatic" ? auto++ : one++;
    }
  });
  return [
    { name: "Automatic", value: auto, fill: "#4f8ef7" },
    { name: "onetime", value: one, fill: "#ff3b30" },
  ];
}

function transactionSnapshot(txs, time) {
  const types = {
    purchase: 0,
    redemption: 0,
    adjustment: 0,
    transfer: 0,
    event: 0,
  };
  txs.forEach((t) => {
    if (new Date(t.createdAt) <= time) types[t.type]++;
  });
  return Object.entries(types).map(([name, value]) => ({
    name,
    value,
    fill: "#aa46be",
  }));
}

const ROLE_COLORS = {
  total: "#000000",
  regular: "#4f8ef7",
  cashier: "#ff8b3d",
  manager: "#4cd964",
  superuser: "#aa46be",
};

export default function ManagerStatistics() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [category, setCategory] = useState("users");
  const [range, setRange] = useState("month");
  const [extraStats, setExtraStats] = useState({});

  const [rawUsers, setRawUsers] = useState([]);
  const [rawEvents, setRawEvents] = useState([]);
  const [rawPromos, setRawPromos] = useState([]);
  const [rawTxs, setRawTxs] = useState([]);

  const snapshot = getSnapshotDate(range);

  const [graphData, setGraphData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      setRawUsers(await fetchAllUsers(BACKEND_URL, token));
      setRawEvents(await fetchAllEvents(BACKEND_URL, token));
      setRawPromos(await fetchAllPromotions(BACKEND_URL, token));
      setRawTxs(await fetchAllTransactions(BACKEND_URL, token));
    })();
  }, []);

  useEffect(() => {
    if (category === "users") {
      const d = userSnapshot(rawUsers, snapshot);
      setTotal(d.total);
      setGraphData([
        { role: "total", count: d.total, fill: ROLE_COLORS.total },
        { role: "regular", count: d.regular, fill: ROLE_COLORS.regular },
        { role: "cashier", count: d.cashier, fill: ROLE_COLORS.cashier },
        { role: "manager", count: d.manager, fill: ROLE_COLORS.manager },
        { role: "superuser", count: d.superuser, fill: ROLE_COLORS.superuser },
      ]);
    }

    if (category === "events") {
      const now = new Date();

      const started = rawEvents.filter(e => new Date(e.startTime) <= now).length;
      const notStarted = rawEvents.length - started;

      const ended = rawEvents.filter(e => new Date(e.endTime) <= now).length;
      const notEnded = rawEvents.length - ended;

      const full = rawEvents.filter(e => e.numGuests >= e.capacity).length;
      const notFull = rawEvents.length - full;

      const published = rawEvents.filter(e => e.published).length;
      const unpublished = rawEvents.length - published;

      setTotal(rawEvents.length);

      // Graph for the bar chart
      setGraphData([
        { name: "Total", count: rawEvents.length, fill: "#000000" },
        { name: "Started", count: started, fill: "#4f8ef7" },
        { name: "Not Started", count: notStarted, fill: "#ff8b3d" },
        { name: "Ended", count: ended, fill: "#aa46be" },
        { name: "Not Ended", count: notEnded, fill: "#4cd964" },
      ]);

      // Extra stats for the pie charts
      setExtraStats({
        full,
        notFull,
        published,
        unpublished,
      });
    }


    if (category === "promotions") {
      const now = new Date();

      const started = rawPromos.filter(p => new Date(p.startTime) <= now).length;
      const notStarted = rawPromos.length - started;

      const ended = rawPromos.filter(p => new Date(p.endTime) <= now).length;
      const notEnded = rawPromos.length - ended;

      const automatic = rawPromos.filter(p => p.type === "automatic").length;
      const oneTime = rawPromos.filter(p => p.type === "onetime").length;

      setTotal(rawPromos.length);

      // Bar chart data (timeline)
      setGraphData([
        { name: "Total", count: rawPromos.length, fill: "#000000" },
        { name: "Started", count: started, fill: "#4f8ef7" },
        { name: "Not Started", count: notStarted, fill: "#ff8b3d" },
        { name: "Ended", count: ended, fill: "#aa46be" },
        { name: "Not Ended", count: notEnded, fill: "#4cd964" },
      ]);

      // Extra stats for pie chart
      setExtraStats({
        automatic,
        oneTime,
      });
    }

    if (category === "transactions") {
      const now = new Date();

      // Count each type
      const purchase = rawTxs.filter(t => t.type === "purchase").length;
      const adjustment = rawTxs.filter(t => t.type === "adjustment").length;
      const redemption = rawTxs.filter(t => t.type === "redemption").length;
      const transfer = rawTxs.filter(t => t.type === "transfer").length;
      const eventTx = rawTxs.filter(t => t.type === "event").length;

      const suspicious = rawTxs.filter(t => t.suspicious).length;
      const notSuspicious = rawTxs.length - suspicious;

      setTotal(rawTxs.length);

      // EXACT SAME FORMAT AS EVENTS + PROMOTIONS
      setGraphData([
        { name: "Total", count: rawTxs.length, fill: "#000000" },
        { name: "Purchase", count: purchase, fill: "#4f8ef7" },
        { name: "Adjustment", count: adjustment, fill: "#ff8b3d" },
        { name: "Redemption", count: redemption, fill: "#aa46be" },
        { name: "Transfer", count: transfer, fill: "#4cd964" },
        { name: "Event", count: eventTx, fill: "#f7d13b" },
      ]);

      setExtraStats({
        suspicious,
        notSuspicious,
      });
    }

  }, [category, range, rawUsers, rawEvents, rawPromos, rawTxs]);

  return (
    <div className="manager-statistics">
      <div className="statistics-header">
        <h1 className="statistics-title">Statistics</h1>
        <p className="statistics-subtitle">
          View historical totals and distributions for users, events, promotions, and transactions.
        </p>
      </div>

      <div className="controls-container">
        <div className="control-group">
          <label className="control-label">Category</label>
          <select 
            className="control-select"
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="users">Users</option>
            <option value="events">Events</option>
            <option value="promotions">Promotions</option>
            <option value="transactions">Transactions</option>
          </select>
        </div>

        {category === "users" && (
          <div className="control-group">
            <label className="control-label">Time Range</label>
            <select 
              className="control-select"
              value={range} 
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="day">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
              <option value="5years">Past 5 Years</option>
            </select>
          </div>
        )}
      </div>

      <div className="total-display">Total: {total}</div>

      <div>
        {category === "users" && (
          <div>
            {/* MAIN USER DISTRIBUTION BAR CHART */}
            <div className="chart-section">
              <h3 className="chart-title">User Distribution by Role</h3>
              <div className="chart-container">
                <ResponsiveContainer>
            <BarChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count">
                {graphData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                ))}
                </Bar>
                </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ---------- SNAPSHOT FILTERED USERS ---------- */}
            {(() => {
            const snapshotUsers = rawUsers.filter(
                (u) => new Date(u.createdAt) <= snapshot
            );

            const suspiciousCount = snapshotUsers.filter((u) => u.suspicious).length;
            const normalCount = snapshotUsers.length - suspiciousCount;

            const verifiedCount = snapshotUsers.filter((u) => u.verified).length;
            const unverifiedCount = snapshotUsers.length - verifiedCount;

            return (
                <>
                {/* ---------- VERIFIED PIE CHART ---------- */}
                <div className="chart-section">
                  <h3 className="chart-title">Verified Accounts (at selected time)</h3>
                  <div className="chart-container pie">
                    <ResponsiveContainer>
                    <PieChart>
                    <Pie
                        data={[
                        { name: "Verified", value: verifiedCount, fill: "#4f8ef7" },
                        { name: "Unverified", value: unverifiedCount, fill: "#ff8b3d" },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={110}
                        label
                    >
                        <Cell fill="#4f8ef7" />
                        <Cell fill="#ff8b3d" />
                    </Pie>
                    <Legend />
                    <Tooltip />
                    </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                </>
            );
            })()}
          </div>
        )}

        

      {category === "events" && (
        <>
          {/* ---- BAR CHART: Started / Not Started / Ended / Not Ended ---- */}
          <div className="chart-section">
            <h3 className="chart-title">Event Timeline Status</h3>
            <div className="chart-container">
              <ResponsiveContainer>
            <BarChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count">
                {graphData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ---- PIE CHART: Full vs Not Full ---- */}
          <div className="chart-section">
            <h3 className="chart-title">Event Capacity</h3>
            <div className="chart-container pie">
              <ResponsiveContainer>
            <PieChart>
              <Pie
                data={[
                  { name: "Full", value: extraStats.full, fill: "#ff3b30" },
                  { name: "Not Full", value: extraStats.notFull, fill: "#4cd964" },
                ]}
                dataKey="value"
                outerRadius={120}
                label
              />
              <Legend />
              <Tooltip />
              </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ---- PIE CHART: Published vs Unpublished ---- */}
          <div className="chart-section">
            <h3 className="chart-title">Publication Status</h3>
            <div className="chart-container pie">
              <ResponsiveContainer>
            <PieChart>
              <Pie
                data={[
                  { name: "Published", value: extraStats.published, fill: "#4f8ef7" },
                  { name: "Unpublished", value: extraStats.unpublished, fill: "#ff8b3d" },
                ]}
                dataKey="value"
                outerRadius={120}
                label
              />
              <Legend />
              <Tooltip />
              </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {category === "promotions" && (
        <>
          {/* ---- BAR CHART: Started / Not Started / Ended / Not Ended ---- */}
          <div className="chart-section">
            <h3 className="chart-title">Promotion Timeline Status</h3>
            <div className="chart-container">
              <ResponsiveContainer>
            <BarChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count">
                {graphData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ---- PIE CHART: Automatic vs onetime ---- */}
          <div className="chart-section">
            <h3 className="chart-title">Promotion Types</h3>
            <div className="chart-container pie">
              <ResponsiveContainer>
            <PieChart>
              <Pie
                data={[
                  { name: "Automatic", value: extraStats.automatic, fill: "#4f8ef7" },
                  { name: "OneTime", value: extraStats.oneTime, fill: "#ff3b30" },
                ]}
                dataKey="value"
                outerRadius={120}
                label={({ value, x, y }) => (
                  <text
                    x={x}
                    y={y}
                    fill="#000"
                    fontSize={14}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {value}
                  </text>
                )}
              />
              <Legend />
              <Tooltip />
              </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}


    {category === "transactions" && (
      <>
        {/* ---- BAR CHART: Transaction Types ---- */}
        <div className="chart-section">
          <h3 className="chart-title">Transaction Type Breakdown</h3>
          <div className="chart-container">
            <ResponsiveContainer>
          <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count">
              {graphData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
            </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---- PIE CHART: Suspicious vs Not Suspicious ---- */}
        <div className="chart-section">
          <h3 className="chart-title">Suspicious Transactions</h3>
          <div className="chart-container pie">
            <ResponsiveContainer>
          <PieChart>
            <Pie
              data={[
                { name: "Suspicious", value: extraStats.suspicious, fill: "#ff3b30" },
                { name: "Not Suspicious", value: extraStats.notSuspicious, fill: "#4cd964" },
              ]}
              dataKey="value"
              outerRadius={120}
              label={({ value, x, y }) => (
                <text
                  x={x}
                  y={y}
                  fill="#000"
                  fontSize={14}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {value}
                </text>
              )}
            />
            <Legend />
            <Tooltip />
            </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    )}
      </div>
    </div>
  );
}