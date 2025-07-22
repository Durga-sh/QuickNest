const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const path = require("path");
const authRoutes = require("./routes/auth");

console.log("✅ Auth routes loaded");

let providerRoutes;
try {
  providerRoutes = require("./routes/providerRoutes"); // ✅ FIXED
  console.log("✅ Provider routes imported");
} catch (err) {
  console.error("❌ Failed to import providerRoute.js:", err);
}


const app = express();

connectDB();

// Middleware
app.use(
  cors({
    origin: "*", 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport
app.use(passport.initialize());
require("./config/passport");


// Routes
app.use("/api/auth", authRoutes);
console.log("✅ Mounted /api/auth");

if (providerRoutes) {
  app.use("/api/provider", providerRoutes);
  console.log("✅ Mounted /api/provider");
} else {
  console.warn("⚠️ providerRoutes not mounted");
}
// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

module.exports = app;
