const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const path = require("path");

console.log("🟡 Starting app.js...");

// Import routes
const authRoutes = require("./routes/auth");
console.log("✅ Auth routes loaded");

let providerRoutes;
try {
  providerRoutes = require("./routes/providerRoutes");
  console.log("✅ Provider routes imported");
} catch (err) {
  console.error("❌ Failed to import providerRoute.js:", err);
}

let bookingRoutes;
try {
  bookingRoutes = require("./routes/bookingRoute");
  console.log("✅ Booking routes imported");
} catch (err) {
  console.error("❌ Failed to import bookingRoutes.js:", err);
}

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: "*", // Allows all origins — useful during development
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies/headers from client
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport
app.use(passport.initialize());
require("./config/passport");

// Global logger
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
console.log("✅ Mounted /api/auth");

if (providerRoutes) {
  app.use("/api/provider", providerRoutes);
  console.log("✅ Mounted /api/provider");
} else {
  console.warn("⚠️ providerRoutes not mounted");
}

if (bookingRoutes) {
  app.use("/api/booking", bookingRoutes);
  console.log("✅ Mounted /api/booking");
} else {
  console.warn("⚠️ bookingRoutes not mounted");
}

let reviewRoutes;
try {
  reviewRoutes = require("./routes/reviewRoutes");
  console.log("✅ review routes imported");
} catch (err) {
  console.error("❌ Failed to import reviewRoutes.js:", err);
}

if (reviewRoutes) {
  app.use("/api/reviews", reviewRoutes);
  console.log("✅ Mounted /api/review");
} else {
  console.warn("⚠️ reviewRoutes not mounted");
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
