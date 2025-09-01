import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth"; // Import useAuth

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import QuickNestLanding from "./pages/LandingPage";
import ProviderDashboard from "./pages/ProviderDashboardpage";
import CreateServicePage from "./pages/CreateServicePage";
import AllServicesPage from "./pages/serviceDetailsPage";
import UserBookings from "./pages/UserBooking";
import ServicesPage from "./pages/servicesPage";
import ProviderBookings from "./pages/ProviderbookingPage";
// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified and user's role is not in the allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Provider Restricted Route Component - prevents providers from accessing certain pages
const ProviderRestrictedRoute = ({ children }) => {
  const { user } = useAuth();

  // If user is a provider, redirect to home
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
    </Routes>
  );
};

export default AppRoutes;
