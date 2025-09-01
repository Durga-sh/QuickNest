const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");
const { authenticate } = require("../middleware/auth");

// All tracking routes require authentication
router.use(authenticate);

// Start tracking for a booking (provider only)
router.post("/:bookingId/start", trackingController.startTracking);

// Update provider location (provider only)
router.put("/:bookingId/location", trackingController.updateLocation);

// Stop tracking for a booking (provider only)
router.post("/:bookingId/stop", trackingController.stopTracking);

// Get tracking status (user or provider)
router.get("/:bookingId/status", trackingController.getTrackingStatus);

// Get all tracking data for provider's bookings
router.get(
  "/provider/bookings",
  trackingController.getProviderTrackingBookings
);

module.exports = router;
