import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/cashier/transactions";
import RedemptionTransaction from "./pages/cashier/RedemptionTransaction";
import Events from "./pages/organizer/Events";
import EventDetail from "./pages/organizer/EventDetail";
import EventEdit from "./pages/organizer/EventEdit";
import ProtectedRoute from "./components/global/ProtectedRoute";
import Layout from "./components/layout/Layout";
import AwardPoints from "./pages/organizer/AwardPoints";
import UserPromotion from "./pages/superuser/UserPromotion";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected wrapper */}
        <Route element={<ProtectedRoute roles={["regular", "cashier", "manager", "superuser"]} />}>
          
          {/* Layout wrapper for logged-in pages */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* future pages */}
            {/* <Route path="/promotions" element={<PromotionList />} /> */}
            {/* <Route path="/events" element={<EventList />} /> */}
            {/* <Route path="/transactions/my" element={<UserTransactions />} /> */}

            {/* cashier pages */}
            <Route path="/cashier/transactions" element={<Transactions />} />
            <Route path="/cashier/redemption" element={<RedemptionTransaction />} />

            {/* organizer pages */}
            <Route path="/organizer/events" element={<Events />} />
            <Route path="/organizer/events/:eventId" element={<EventDetail />} />
            <Route path="/organizer/events/:eventId/edit" element={<EventEdit />} /> 
            <Route path="/organizer/events/:eventId/award-points" element={<AwardPoints />} />

            {/* superuser pages */}
            <Route path="/superuser/user-promotion" element={<UserPromotion />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
