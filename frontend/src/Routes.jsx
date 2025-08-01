import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";// Import useAuth

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import QuickNestLanding from "./pages/LandingPage";
import ProviderDashboard from "./pages/ProviderDashboardpage";
import CreateServicePage from "./pages/CreateServicePage";
import AllServicesPage from "./pages/serviceDetailsPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/service" element={<AllServicesPage/>} />
    </Routes>
  );
};

export default AppRoutes;
