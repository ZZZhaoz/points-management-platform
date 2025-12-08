import { useState, useEffect } from "react";
import { useEvents } from "../../contexts/EventContext";
import { Card } from "../../components/global/Card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./OrganizerStatistics.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function OrganizerStatistics() {
  const { getMyEvents } = useEvents();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    const result = await getMyEvents();

    if (result.error) {
      setError(result.error);
    } else {
      setEvents(result.data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="organizer-statistics">
        <div className="error-container">
          <div className="error-message">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="organizer-statistics">
        <div className="statistics-header">
          <h1 className="statistics-title">Event Statistics</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h2 className="empty-state-title">No Events Yet</h2>
          <p className="empty-state-text">You are not organizing any events yet.</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  // Chart 1: Participants per event (Bar Chart)
  const participantsData = events.map((event) => ({
    name: event.name.length > 15 ? event.name.substring(0, 15) + "..." : event.name,
    participants: event.numGuests || 0,
    fullName: event.name,
  }));

  // Chart 2: Participants per event (Pie Chart)
  const pieData = events.map((event) => ({
    name: event.name.length > 20 ? event.name.substring(0, 20) + "..." : event.name,
    value: event.numGuests || 0,
    fullName: event.name,
  }));

  // Chart 3: Attendance trends for popular events (Line Chart)
  // Sort events by number of guests and take top 5
  const popularEvents = [...events]
    .sort((a, b) => (b.numGuests || 0) - (a.numGuests || 0))
    .slice(0, 5);

  // For line chart, we'll show participants over time (using event start time)
  const attendanceTrendsData = popularEvents.map((event) => ({
    name: event.name.length > 15 ? event.name.substring(0, 15) + "..." : event.name,
    participants: event.numGuests || 0,
    date: new Date(event.startTime).toLocaleDateString(),
    fullName: event.name,
  }));

  // Chart 4: Points awarded per event (Bar Chart)
  const pointsData = events.map((event) => ({
    name: event.name.length > 15 ? event.name.substring(0, 15) + "..." : event.name,
    pointsAwarded: event.pointsAwarded || 0,
    pointsRemaining: event.pointsRemain || 0,
    fullName: event.name,
  }));

  return (
    <div className="organizer-statistics">
      <div className="statistics-header">
        <h1 className="statistics-title">📊 Event Statistics</h1>
      </div>

      <div style={{ display: "grid", gap: "2rem" }}>
        {/* Chart 1: Participants per Event (Bar Chart) */}
        <Card className="chart-section">
          <h2 className="chart-title">
            Number of Participants per Event
          </h2>
          <div className="chart-container">
            <ResponsiveContainer>
            <BarChart data={participantsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, "Participants"]}
                labelFormatter={(label) => {
                  const event = participantsData.find((e) => e.name === label);
                  return event?.fullName || label;
                }}
              />
              <Legend />
              <Bar dataKey="participants" fill="#8884d8" name="Participants" />
            </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Participants Distribution (Pie Chart) */}
        <Card className="chart-section">
          <h2 className="chart-title">
            Participants Distribution (Pie Chart)
          </h2>
          <div className="chart-container">
            <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value, "Participants"]}
                labelFormatter={(label) => {
                  const event = pieData.find((e) => e.name === label);
                  return event?.fullName || label;
                }}
              />
            </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Attendance Trends (Line Chart) */}
        <Card className="chart-section">
          <h2 className="chart-title">
            Attendance Trends for Popular Events
          </h2>
          <div className="chart-container">
            <ResponsiveContainer>
            <LineChart data={attendanceTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => [value, "Participants"]}
                labelFormatter={(label) => {
                  const event = attendanceTrendsData.find((e) => e.name === label);
                  return `${event?.fullName || label} (${event?.date})`;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="participants"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Participants"
              />
            </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Points Awarded per Event */}
        <Card className="chart-section">
          <h2 className="chart-title">
            Points Awarded vs Remaining per Event
          </h2>
          <div className="chart-container">
            <ResponsiveContainer>
            <BarChart data={pointsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const event = pointsData.find((e) => e.name === label);
                    return (
                      <div
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "10px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
                          {event?.fullName || label}
                        </p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            style={{
                              color: entry.color,
                              margin: "3px 0",
                            }}
                          >
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="pointsAwarded"
                fill="#00C49F"
                name="Points Awarded"
              />
              <Bar
                dataKey="pointsRemaining"
                fill="#FF8042"
                name="Points Remaining"
              />
            </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Summary Statistics */}
        <Card className="chart-section">
          <h2 className="chart-title">Summary Statistics</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-value events">{events.length}</div>
              <div className="summary-label">Total Events</div>
            </div>
            <div className="summary-item">
              <div className="summary-value participants">
                {events.reduce((sum, e) => sum + (e.numGuests || 0), 0)}
              </div>
              <div className="summary-label">Total Participants</div>
            </div>
            <div className="summary-item">
              <div className="summary-value points">
                {events.reduce((sum, e) => sum + (e.pointsRemain || 0), 0)}
              </div>
              <div className="summary-label">Total Points Remaining</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

