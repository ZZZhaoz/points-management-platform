import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/global/ProtectedRoute";
import Layout from "./components/global/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Private routes (all require login) */}
        <Route
          element={
            <ProtectedRoute roles={["regular", "cashier", "manager", "superuser"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* All logged-in routes go here */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Add more: */}
          {/* <Route path="/promotions" element={<PromotionList />} /> */}
          {/* <Route path="/events" element={<EventList />} /> */}
          {/* <Route path="/transactions/my" element={<UserTransactions />} /> */}
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
