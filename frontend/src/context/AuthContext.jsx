import React, { createContext, useState, useEffect } from "react";
import { verifyToken } from "../api/auth";
import { setToken, removeToken, setAuthHeader } from "../utils/tokenManager";
import axios from "axios";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        setAuthHeader(axios);
        const data = await verifyToken();
        if (data) {
          setUser(data);
        }
      } catch (err) {
        console.error("Auth verification error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
    const handleGoogleAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      if (token && window.location.pathname.includes("/auth/google/callback")) {
        setToken(token);
        setAuthHeader(axios);
        try {
          const data = await verifyToken();
          if (data) {
            setUser(data);
            window.history.replaceState({}, document.title, "/");
          }
        } catch (err) {
          console.error("Google auth error:", err);
          setError("Failed to authenticate with Google");
        }
      }
    };
    handleGoogleAuth();
  }, []);
  const loginUser = (userData, token) => {
    setToken(token);
    setAuthHeader(axios);
    setUser(userData);
  };
  const logoutUser = () => {
    removeToken();
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        loginUser,
        logoutUser,
        isAuthenticated: !!user,
        isProvider: user?.role === "provider",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
