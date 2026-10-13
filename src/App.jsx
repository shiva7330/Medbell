import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import useOnline from './hooks/useOnline';
import { EmptyState, Screen } from './components/ui';

import { Login, Onboarding, Otp, Splash } from './pages/Auth';
import { Home, MedicineDetail, MedicineForm, Reminders } from './pages/Reminders';
import { Cart, ProductDetail, Shop } from './pages/Shop';
import { AddAddress, Address, OrderSuccess, OrderTracking, Payment, PaymentFailed } from './pages/Checkout';
import { EditProfile, MyOrders, Notifications, Profile, SavedAddresses } from './pages/Account';

// Pages that need a logged-in user
function Protected() {
  const { auth } = useApp();
  return auth ? <Outlet /> : <Navigate to="/login" replace />;
}

function NoInternet() {
  return (
    <Screen>
      <EmptyState
        icon="wifiOff"
        tone="warn"
        title="No internet connection"
        text="Check your connection and try again. Your reminders still work offline."
        action="Try again"
        onAction={() => window.location.reload()}
      />
    </Screen>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <Screen>
      <EmptyState icon="alert" tone="warn" title="Page not found" text="That page does not exist." action="Go home" onAction={() => navigate('/home')} />
    </Screen>
  );
}

export default function App() {
  const { toast } = useApp();
  const online = useOnline();

  return (
    <div className="app">
      {!online && <div className="offline-banner">You are offline</div>}
      {/* Browse and reminders keep working offline; only checkout flows need the network */}
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<Otp />} />

        <Route element={<Protected />}>
          <Route path="/home" element={<Home />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/reminders/new" element={<MedicineForm />} />
          <Route path="/reminders/:id/edit" element={<MedicineForm />} />
          <Route path="/medicine/:id" element={<MedicineDetail />} />

          <Route path="/shop" element={online ? <Shop /> : <NoInternet />} />
          <Route path="/shop/:id" element={online ? <ProductDetail /> : <NoInternet />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/address" element={<Address />} />
          <Route path="/addresses/new" element={<AddAddress />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderTracking />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/addresses" element={<SavedAddresses />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
