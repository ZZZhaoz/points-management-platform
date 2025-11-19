export default function Dashboard() {
  const role = localStorage.getItem("role");

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Your role: {role}</p>
    </div>
  );
}
