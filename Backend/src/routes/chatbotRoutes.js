// Backend/src/routes/chatbotRoutes.js

const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

// Rate limiting middleware (optional but recommended)
const rateLimit = require("express-rate-limit");

const chatbotRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    success: false,
    message: "Too many chat requests, please try again later.",
  },
});

// Routes
router.post("/message", chatbotRateLimit, chatbotController.getChatResponse);
router.get("/suggestions", chatbotController.getChatSuggestions);

module.exports = router;
