const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const providerController = require("../controllers/ProviderController");

// Provider routes (protected)
router.post("/register", isAuthenticated, providerController.registerProvider);
router.put(
  "/profile",
  isAuthenticated,
  providerController.updateProviderProfile
);
router.get("/profile", isAuthenticated, providerController.getProviderProfile);

// Public route to get provider by ID
router.get("/:providerId", providerController.getProviderById);

// Admin route to approve/reject provider
router.post(
  "/approve-reject",
  isAuthenticated,
  providerController.approveOrRejectProvider
);

module.exports = router;
