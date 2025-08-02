// Backend/src/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const bookingController = require("../controllers/bookingController");

// Add logging middleware for debugging
router.use((req, res, next) => {
  console.log(`📋 Booking Route: ${req.method} ${req.originalUrl}`);
  console.log(`📋 Body:`, req.body);
  next();
});

// Create Razorpay order - MAIN ENDPOINT
router.post("/create-order", isAuthenticated, bookingController.createOrder);

// Verify payment
router.post(
  "/verify-payment",
  isAuthenticated,
  bookingController.verifyPayment
);

// Get user bookings
router.get("/user", isAuthenticated, bookingController.getUserBookings);

// Get provider bookings
router.get("/provider", isAuthenticated, bookingController.getProviderBookings);

// Get booking by ID
router.get("/:bookingId", isAuthenticated, bookingController.getBookingById);

// Update booking status (for providers)
router.put(
  "/:bookingId/status",
  isAuthenticated,
  bookingController.updateBookingStatus
);

module.exports = router;
