import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from "recharts";

function getDateRange(mode) {
  const now = new Date();
  let from = new Date();

  if (mode === "week") {
    from.setDate(now.getDate() - 6);
  } else if (mode === "month") {
    from.setDate(now.getDate() - 29);
  } else if (mode === "year") {
    from.setFullYear(now.getFullYear() - 1);
  }

  return { from, to: now };
}

function groupByDay(transactions, from, to) {
  const map = {};

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }

  transactions.forEach((tx) => {
    const day = tx.createdAt.slice(0, 10);
    if (map[day] !== undefined) {
      map[day] += Number(tx.amount);
    }
  });

  return Object.entries(map).map(([date, points]) => ({ date, points }));
}

function groupByMonth(transactions, from, to) {
  const map = {};

  for (let m = new Date(from); m <= to; m.setMonth(m.getMonth() + 1)) {
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    map[key] = 0;
  }

  transactions.forEach((tx) => {
    const d = new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (map[key] !== undefined) {
      map[key] += Number(tx.amount);
    }
  });

  return Object.entries(map).map(([month, points]) => ({ month, points }));
}


function countTypes(transactions) {
  const map = {
    purchase: 0,
    redemption: 0,
    adjustment: 0,
    transfer: 0,
    event: 0,
  };

  transactions.forEach((tx) => {
    if (map[tx.type] !== undefined) {
      map[tx.type] += 1;
    }
  });

  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function groupByDayCount(transactions, from, to) {
  const map = {};

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }

  transactions.forEach((tx) => {
    const day = tx.createdAt.slice(0, 10);
    if (map[day] !== undefined) {
      map[day] += 1;
    }
  });

  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

function groupByMonthCount(transactions, from, to) {
  const map = {};

  for (let m = new Date(from); m <= to; m.setMonth(m.getMonth() + 1)) {
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    map[key] = 0;
  }

  transactions.forEach((tx) => {
    const d = new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (map[key] !== undefined) {
      map[key] += 1;
    }
  });

  return Object.entries(map).map(([month, count]) => ({ month, count }));
}

const COLORS = ["#4f8ef7", "#ff8b3d", "#4cd964", "#ff3b30", "#aa46be"];

export default function StatisticsPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [mode, setMode] = useState("week");
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    loadData();
  }, [mode]);

  async function loadData() {
    const { from, to } = getDateRange(mode);

    const res = await fetch(
      `${BACKEND_URL}/users/me/transactions?from=${from.toISOString()}&to=${to.toISOString()}&limit=9999`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const json = await res.json();
    const tx = json.results || [];

    if (mode === "week" || mode === "month") {
      setLineData(groupByDay(tx, from, to));
      setBarData(groupByDayCount(tx, from, to));
    } else {
      setLineData(groupByMonth(tx, from, to));
      setBarData(groupByMonthCount(tx, from, to));
    }

    setPieData(countTypes(tx));

    console.log("mode:", mode);
    console.log("transactions received:", tx.length);
  }

  return (
    <div style={{ width: "100%" }}>
      
      {/* Mode Switch */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode("week")}>Week</button>
        <button onClick={() => setMode("month")}>Month</button>
        <button onClick={() => setMode("year")}>Year</button>
      </div>

      {/* ------------------ LINE CHART ------------------ */}
      <h3>Points Trend ({mode})</h3>
      <div style={{ width: "100%", height: 350, marginBottom: 40 }}>
        <ResponsiveContainer>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={mode === "year" ? "month" : "date"} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="points" stroke="#4f8ef7" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ------------------ PIE CHART ------------------ */}
      <h3>Transaction Type Distribution ({mode})</h3>
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120} label>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ------------------ BAR CHART ------------------ */}
      <h3>Transaction Volume ({mode})</h3>
      <div style={{ width: "100%", height: 350, marginTop: 40 }}>
        <ResponsiveContainer>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={mode === "year" ? "month" : "date"} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
