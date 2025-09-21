const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const providerController = require("../controllers/ProviderController");
router.post("/register", isAuthenticated, providerController.registerProvider);
router.post("/add-services", isAuthenticated, providerController.addServices);
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
router.get("/all", providerController.getAllProviders);
router.get("/skills", providerController.getAvailableSkills);
router.get("/search", providerController.searchProviders);
router.get("/:providerId", providerController.getProviderById);
module.exports = router;
