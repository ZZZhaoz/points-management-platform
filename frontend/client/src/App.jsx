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
import UsersList from "./pages/manager/UsersList";
import UsersUpdate from "./pages/manager/UsersUpdate"
import TransactionsList from "./pages/manager/TransactionsList"
import TransactionsUpdate from "./pages/manager/TransactionsUpdate";
import PromotionCreate from "./pages/manager/PromotionCreate";
import PromotionList from "./pages/manager/PromotionList";
import PromotionUpdate from "./pages/manager/PromotionUpdate";
import EventCreate from "./pages/manager/EventCreate";
import EventList from "./pages/manager/EventList";
import EventUpdate  from "./pages/manager/EventUpdate";

import AwardPoints from "./pages/organizer/AwardPoints";
import UserPromotion from "./pages/superuser/UserPromotion";

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



             <Route path="/manager/users" element={<UsersList />} />
             <Route path="/manager/users/:userId" element={<UsersUpdate />} />
             <Route path="/manager/transactions" element={<TransactionsList />} />
             <Route path="/manager/transactions/:transactionId" element={<TransactionsUpdate />} />
             <Route path="/manager/promotions/create" element={<PromotionCreate />} />
             <Route path="/manager/promotions" element={<PromotionList />} />
             <Route path="/manager/promotions/:promotionId" element={<PromotionUpdate />} />
             <Route path="/manager/events/create" element={<EventCreate />} />
             <Route path="/manager/events" element={<EventList />} />
             <Route path="/manager/events/:eventId" element={<EventUpdate />} />




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
