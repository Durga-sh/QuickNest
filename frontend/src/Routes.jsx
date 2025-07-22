import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import QuickNestLanding from "./pages/LandingPage";
// Protected Route Component

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<QuickNestLanding/>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
};

export default AppRoutes;
