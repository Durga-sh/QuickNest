const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");
const rateLimit = require("express-rate-limit");
const chatbotRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    success: false,
    message: "Too many chat requests, please try again later.",
  },
});
router.post("/message", chatbotRateLimit, chatbotController.getChatResponse);
router.get("/suggestions", chatbotController.getChatSuggestions);
module.exports = router;
