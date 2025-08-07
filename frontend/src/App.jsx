// In your App.js file, add this to debug
import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppRoutes from "./Routes.jsx";

import "./index.css";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Add this for debugging
  useEffect(() => {
    console.log("Google Client ID:", googleClientId);
  }, [googleClientId]);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <Header/>
          <div className="w-full min-h-screen">
            <main className="main-content">
              <AppRoutes />
            </main>
          </div>
          <Footer/>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
