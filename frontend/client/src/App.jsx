import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
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
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
