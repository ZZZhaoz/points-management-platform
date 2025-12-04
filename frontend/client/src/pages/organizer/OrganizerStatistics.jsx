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
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ color: "red" }}>Error: {error}</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Event Statistics</h1>
        <p>You are not organizing any events yet.</p>
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
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>Event Statistics</h1>

      <div style={{ display: "grid", gap: "2rem" }}>
        {/* Chart 1: Participants per Event (Bar Chart) */}
        <Card style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>
            Number of Participants per Event
          </h2>
          <ResponsiveContainer width="100%" height={400}>
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
        </Card>

        {/* Chart 2: Participants Distribution (Pie Chart) */}
        <Card style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>
            Participants Distribution (Pie Chart)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
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
        </Card>

        {/* Chart 3: Attendance Trends (Line Chart) */}
        <Card style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>
            Attendance Trends for Popular Events
          </h2>
          <ResponsiveContainer width="100%" height={400}>
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
        </Card>

        {/* Chart 4: Points Awarded per Event */}
        <Card style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>
            Points Awarded vs Remaining per Event
          </h2>
          <ResponsiveContainer width="100%" height={400}>
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
                formatter={(value, name) => [
                  value,
                  name === "pointsAwarded" ? "Points Awarded" : "Points Remaining",
                ]}
                labelFormatter={(label) => {
                  const event = pointsData.find((e) => e.name === label);
                  return event?.fullName || label;
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
        </Card>

        {/* Summary Statistics */}
        <Card style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Summary Statistics</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#8884d8" }}>
                {events.length}
              </div>
              <div style={{ color: "#666" }}>Total Events</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#00C49F" }}>
                {events.reduce((sum, e) => sum + (e.numGuests || 0), 0)}
              </div>
              <div style={{ color: "#666" }}>Total Participants</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#FF8042" }}>
                {events.reduce((sum, e) => sum + (e.pointsAwarded || 0), 0)}
              </div>
              <div style={{ color: "#666" }}>Total Points Awarded</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#0088FE" }}>
                {events.reduce((sum, e) => sum + (e.pointsRemain || 0), 0)}
              </div>
              <div style={{ color: "#666" }}>Total Points Remaining</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

