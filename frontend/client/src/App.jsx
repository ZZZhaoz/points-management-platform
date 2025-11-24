import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { Dashboard, UserQRPage, TransferPage, RedemptionPage, 
  PromotionsPage, EventsListPage, EventDetailPage, TransactionsListPage } from "./pages/regularuser";
import ProtectedRoute from "./components/global/ProtectedRoute";
import Layout from "./components/layout/Layout";

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
            <Route path="user/qr" element={<UserQRPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/redeem" element={<RedemptionPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/transactions/my" element={<TransactionsListPage />} />


            {/* future pages */}
            {/* <Route path="/promotions" element={<PromotionList />} /> */}
            {/* <Route path="/events" element={<EventList />} /> */}
            {/* <Route path="/transactions/my" element={<UserTransactions />} /> */}
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
