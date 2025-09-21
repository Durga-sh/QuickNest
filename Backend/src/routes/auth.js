const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const { isAuthenticated, generateToken } = require("../middleware/auth");
const { OAuth2Client } = require("google-auth-library");
const User = require("../model/User");
const config = require("../config/config");
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);
router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/verify-password-reset-otp",
  authController.verifyPasswordResetOTP
);
router.post("/reset-password", authController.resetPassword);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleCallback
);
router.post("/google/verify", async (req, res) => {
  try {
    console.log("Googleverification request received");
    const { credential } = req.body;
    if (!credential) {
      console.log("No credential provided");
      return res
        .status(400)
        .json({ message: "logging No credential provided" });
    }
    console.log("Verifying Google token");
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: config.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log("Google payload received:", {
      email: payload.email,
      name: payload.name,
    });
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      console.log("Creating new user from Google data");
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        isEmailVerified: true, // Google has already verified the email
      });
      await user.save();
    } else if (!user.googleId) {
      console.log("Linking Google account to existing user");
      user.googleId = payload.sub;
      user.avatar = user.avatar || payload.picture;
      if (!user.isEmailVerified) user.isEmailVerified = true;
      await user.save();
    }
    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.get("/me", isAuthenticated, authController.getCurrentUser);
module.exports = router;
