const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const path = require("path");
const authRoutes = require("./routes/auth");
let providerRoutes;
try {
  providerRoutes = require("./routes/providerRoutes");
  console.log(" Provider routes imported");
} catch (err) {
  console.error(" Failed to import providerRoute.js:", err);
}
let bookingRoutes;
try {
  bookingRoutes = require("./routes/bookingRoute");
} catch (err) {
  console.error("Failed to import bookingRoutes.js:", err);
}
const app = express();
connectDB();
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
app.use(passport.initialize());
require("./config/passport");
app.use((req, res, next) => {
  next();
});
app.use("/api/auth", authRoutes);
if (providerRoutes) {
  app.use("/api/provider", providerRoutes);
} else {
  console.warn(" providerRoutes not mounted");
}
if (bookingRoutes) {
  app.use("/api/booking", bookingRoutes);
} else {
  console.warn(" bookingRoutes not mounted");
}
let reviewRoutes;
try {
  reviewRoutes = require("./routes/reviewRoutes");
} catch (err) {
  console.error("Failed to import reviewRoutes.js:", err);
}
if (reviewRoutes) {
  app.use("/api/reviews", reviewRoutes);
} else {
  console.warn(" reviewRoutes not mounted");
}
let chatbotRoutes;
try {
  chatbotRoutes = require("./routes/chatbotRoutes");
} catch (err) {
  console.error("Failed to import chatbotRoutes.js:", err);
}
if (chatbotRoutes) {
  app.use("/api/chatbot", chatbotRoutes);
} else {
  console.warn(" chatbotRoutes not mounted");
}
let voiceRoutes;
try {
  voiceRoutes = require("./routes/voiceRoutes");
} catch (err) {
  console.error(" Failed to import voiceRoutes.js:", err);
}
if (voiceRoutes) {
  app.use("/api/voice", voiceRoutes);
} else {
  console.warn(" voiceRoutes not mounted");
}
let trackingRoutes;
try {
  trackingRoutes = require("./routes/trackingRoutes");
} catch (err) {
  console.error(" Failed to import trackingRoutes.js:", err);
}
if (trackingRoutes) {
  app.use("/api/tracking", trackingRoutes);
} else {
  console.warn(" trackingRoutes not mounted");
}
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});
module.exports = app;
