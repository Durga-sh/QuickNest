const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");
const { authenticate } = require("../middleware/auth");
router.use(authenticate);
router.post("/:bookingId/start", trackingController.startTracking);
router.put("/:bookingId/location", trackingController.updateLocation);
router.post("/:bookingId/stop", trackingController.stopTracking);
router.get("/:bookingId/status", trackingController.getTrackingStatus);
router.get(
  "/provider/bookings",
  trackingController.getProviderTrackingBookings
);
module.exports = router;
