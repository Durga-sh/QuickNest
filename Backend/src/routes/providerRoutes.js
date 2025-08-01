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

// Public routes for getting providers
router.get("/all", providerController.getAllProviders);
router.get("/skills", providerController.getAvailableSkills);
router.get("/search", providerController.searchProviders);
router.get("/:providerId", providerController.getProviderById);

module.exports = router;
