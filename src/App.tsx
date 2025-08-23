import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Import pages and components
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ItemDetailPage from './pages/ItemDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import AboutPage from './pages/AboutPage';
import CateringPage from './pages/CateringPage';
import GiftCardsPage from './pages/GiftCardsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSettings from './pages/admin/AdminSettings';
import KitchenDisplay from './pages/KitchenDisplay';
import ApiTestPage from './pages/ApiTestPage';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51234567890abcdef');

const AppContent: React.FC = () => {
  useAuth(); // Initialize auth state
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="item/:slug" element={<ItemDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order/:orderNo" element={<OrderTrackingPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="catering" element={<CateringPage />} />
            <Route path="gift-cards" element={<GiftCardsPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms-of-service" element={<TermsOfServicePage />} />
            <Route path="api-test" element={<ApiTestPage />} />
            <Route 
              path="account" 
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Auth pages without layout */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Admin routes */}
          <Route 
            path="admin" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/orders" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'staff']}>
                <AdminOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/menu" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <AdminMenu />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/customers" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <AdminCustomers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/settings" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />

          {/* Kitchen Display System */}
          <Route 
            path="kds" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'staff']}>
                <KitchenDisplay />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Elements stripe={stripePromise}>
          <AppContent />
        </Elements>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;