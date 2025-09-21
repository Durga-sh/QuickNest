const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const bookingController = require("../controllers/bookingController");
router.use((req, res, next) => {
  console.log(`Booking Route: ${req.method} ${req.originalUrl}`);
  console.log(`Body:`, req.body);
  next();
});
router.post("/create-order", isAuthenticated, bookingController.createOrder);
router.post(
  "/verify-payment",
  isAuthenticated,
  bookingController.verifyPayment
);
router.get("/user", isAuthenticated, bookingController.getUserBookings);
router.get("/provider", isAuthenticated, bookingController.getProviderBookings);
router.get("/:bookingId", isAuthenticated, bookingController.getBookingById);
router.put(
  "/:bookingId/status",
  isAuthenticated,
  bookingController.updateBookingStatus
);
module.exports = router;
