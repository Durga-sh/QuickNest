import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth"; // Import useAuth
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import QuickNestLanding from "./pages/LandingPage";
import ProviderDashboard from "./pages/ProviderDashboardpage";
import CreateServicePage from "./pages/CreateServicePage";
import AllServicesPage from "./pages/serviceDetailsPage";
import UserBookings from "./pages/UserBooking";
import ProviderBookings from "./pages/ProviderbookingPage";
import SupportPage from "./pages/SupportPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ReviewsPage from "./pages/ReviewsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import TrackingTestPage from "./pages/TrackingTestPage";
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};
const ProviderRestrictedRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === "provider") {
    return <Navigate to="/" replace />;
  }
  return children;
};
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<QuickNestLanding />} />
      <Route
        path="/create-service"
        element={
          <ProtectedRoute>
            <CreateServicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider-dashboard"
        element={
          <ProtectedRoute>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider-bookings"
        element={
          <ProtectedRoute requiredRole="provider">
            <ProviderBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <UserBookings />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/service"
        element={
          <ProviderRestrictedRoute>
            <AllServicesPage />
          </ProviderRestrictedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProviderRestrictedRoute>
            <AllServicesPage />
          </ProviderRestrictedRoute>
        }
      />
      {}
      <Route path="/support" element={<SupportPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/tracking-test" element={<TrackingTestPage />} />
    </Routes>
  );
};
export default AppRoutes;
