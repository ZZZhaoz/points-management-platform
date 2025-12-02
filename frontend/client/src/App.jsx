import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePassword";  
import { Dashboard, UserQRPage, TransferPage, RedemptionPage, 
  PromotionsPage, EventsListPage, EventDetailPage, TransactionsListPage, RedemptionQRPage } from "./pages/regularuser";
import ProtectedRoute from "./components/global/ProtectedRoute";
import Layout from "./components/layout/Layout";
import AwardPoints from "./pages/organizer/AwardPoints";
import UserPromotion from "./pages/superuser/UserPromotion";
import Transactions from "./pages/cashier/transactions";
import RedemptionTransaction from "./pages/cashier/RedemptionTransaction";
import Events from "./pages/organizer/Events";
import EventDetail from "./pages/organizer/EventDetail";
import EventEdit from "./pages/organizer/EventEdit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route element={<Layout />}>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset/:token" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Protected wrapper */}
        <Route element={<ProtectedRoute roles={["regular", "cashier", "manager", "superuser"]} />}>
          
          {/* Layout wrapper for logged-in pages */}
          
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="user/qr" element={<UserQRPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/redeem" element={<RedemptionPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/transactions/my" element={<TransactionsListPage />} />
            <Route path="/redeem/qr/:transactionId" element={<RedemptionQRPage />} />



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
