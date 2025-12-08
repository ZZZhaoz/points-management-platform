import { BrowserRouter, Routes, Route } from "react-router-dom";

/* -----------------------------  Context Providers  ----------------------------- */
import { AuthProvider } from "./contexts/AuthContext";
import { EventProvider } from "./contexts/EventContext";
import { TransactionProvider } from "./contexts/TransactionContext";

/* -----------------------------  Global Components  ----------------------------- */
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/global/ProtectedRoute";
import OrganizerProtectedRoute from "./components/global/OrganizerProtectedRoute";
import DashboardWrapper from "./components/global/DashboardWrapper";

/* -----------------------------  Auth & Profile Pages  ----------------------------- */
import Login from "./pages/Login";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePassword";
import RegisterUser from "./pages/RegisterUser";

/* -----------------------------  Regular User Pages  ----------------------------- */
import UserQRPage from "./pages/regularuser/UserQRPage";
import TransferPage from "./pages/regularuser/TransferPage";
import RedemptionPage from "./pages/regularuser/RedemptionPage";
import PromotionsPage from "./pages/regularuser/PromotionsPage";
import EventsListPage from "./pages/regularuser/EventsListPage";
import EventDetailPage from "./pages/regularuser/EventDetailPage";
import TransactionsListPage from "./pages/regularuser/TransactionsListPage";
import RedemptionQRPage from "./pages/regularuser/RedemptionQRPage";
import StatisticsPage from "./pages/regularuser/StatisticsPage";

/* -----------------------------  Cashier Pages  ----------------------------- */
import Transactions from "./pages/cashier/transactions";
import RedemptionTransaction from "./pages/cashier/RedemptionTransaction";

/* -----------------------------  Manager Pages  ----------------------------- */
import UsersList from "./pages/manager/UsersList";
import UsersUpdate from "./pages/manager/UsersUpdate";
import TransactionsList from "./pages/manager/TransactionsList";
import TransactionsUpdate from "./pages/manager/TransactionsUpdate";
import PromotionCreate from "./pages/manager/PromotionCreate";
import PromotionList from "./pages/manager/PromotionList";
import PromotionUpdate from "./pages/manager/PromotionUpdate";
import EventCreate from "./pages/manager/EventCreate";
import EventList from "./pages/manager/EventList";
import EventUpdate from "./pages/manager/EventUpdate";
import ManagerStatistics from "./pages/manager/ManagerStatistics";

/* -----------------------------  Organizer Pages  ----------------------------- */
import Events from "./pages/organizer/Events";
import EventDetail from "./pages/organizer/EventDetail";
import EventEdit from "./pages/organizer/EventEdit";
import AwardPoints from "./pages/organizer/AwardPoints";
import OrganizerStatistics from "./pages/organizer/OrganizerStatistics";

/* -----------------------------  Superuser Pages  ----------------------------- */
import UserPromotion from "./pages/superuser/UserPromotion";

export default function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <TransactionProvider>
          <BrowserRouter>
            <Routes>

              {/* Public */}
              <Route element={<Layout />}>
                <Route path="/" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset/:token" element={<ResetPasswordPage />} />

                {/* Profile pages (authenticated but not role-protected) */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />

                {/* Protected */}
                <Route
                  element={
                    <ProtectedRoute roles={["regular", "cashier", "manager", "superuser"]} />
                  }
                >
                  <Route path="/dashboard" element={<DashboardWrapper />} />
                  {/* Regular */}
                  {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                  {/* <Route path="/dashboard" element={<DashboardWrapper />} /> */}
                  <Route path="/user/qr" element={<UserQRPage />} />
                  <Route path="/transfer" element={<TransferPage />} />
                  <Route path="/redeem" element={<RedemptionPage />} />
                  <Route path="/promotions" element={<PromotionsPage />} />
                  <Route path="/events" element={<EventsListPage />} />
                  <Route path="/events/:eventId" element={<EventDetailPage />} />
                  <Route path="/transactions/my" element={<TransactionsListPage />} />
                  <Route path="/redeem/qr/:transactionId" element={<RedemptionQRPage />} />
                  <Route path="/statistics" element={<StatisticsPage />} />

                  {/* Cashier */}
                  {/* <Route path="/dashboard" element={<DashboardWrapper />} /> */}
                  <Route path="/cashier/transactions" element={<Transactions />} />
                  <Route path="/cashier/redemption" element={<RedemptionTransaction />} />
                  <Route path="/register" element={<RegisterUser />} />

                  {/* Manager */}
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
                  <Route path="/manager/statistics" element={<ManagerStatistics/>} />

                  {/* Organizer */}
                  <Route element={<OrganizerProtectedRoute />}>
                    <Route path="/organizer/events" element={<Events />} />
                    <Route path="/organizer/events/:eventId" element={<EventDetail />} />
                    <Route path="/organizer/events/:eventId/edit" element={<EventEdit />} />
                    <Route path="/organizer/events/:eventId/award-points" element={<AwardPoints />} />
                    <Route path="/organizer/statistics" element={<OrganizerStatistics />} />
                  </Route>

                  {/* Superuser */}
                  <Route path="/superuser/user-promotion" element={<UserPromotion />} />
                  <Route path="/superuser/statistics" element={<ManagerStatistics />} />
                </Route>
              </Route>

            </Routes>
          </BrowserRouter>
        </TransactionProvider>
      </EventProvider>
    </AuthProvider>
  );
}

