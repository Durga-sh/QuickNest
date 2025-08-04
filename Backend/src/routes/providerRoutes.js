const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const providerController = require("../controllers/ProviderController");

// Provider routes (protected)
router.post("/register", isAuthenticated, providerController.registerProvider);

// New route for adding services to existing provider
router.post("/add-services", isAuthenticated, providerController.addServices);

// Route for removing a specific service
router.delete(
  "/service/:serviceName",
  isAuthenticated,
  providerController.removeService
);

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

// New route for getting providers by specific skill
router.get("/skill/:skill", providerController.getProvidersBySkill);

// Keep this last to avoid conflicts with other routes
router.get("/:providerId", providerController.getProviderById);

module.exports = router;
