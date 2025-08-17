// Backend/src/routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const reviewController = require("../controllers/ReviewController");

// Protected routes (require authentication)
router.post("/submit", isAuthenticated, reviewController.submitReview);
router.get("/my-reviews", isAuthenticated, reviewController.getUserReviews);
router.put("/:reviewId", isAuthenticated, reviewController.updateReview);
router.delete("/:reviewId", isAuthenticated, reviewController.deleteReview);

// Public routes
router.get("/provider/:providerId", reviewController.getProviderReviews);
router.get("/booking/:bookingId", reviewController.getReviewByBooking);

module.exports = router;
