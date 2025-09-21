const User = require("../model/User");
const { generateToken } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This should be your Gmail App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
});
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});
const tempUsers = new Map();
const passwordResetOTPs = new Map();
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "QuickNest - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">QuickNest - Password Reset</h2>
        <p>Your OTP for password reset is:</p>
        <h1 style="background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 4px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const otp = generateOTP();
    const tempUserId = crypto.randomUUID();
    tempUsers.set(tempUserId, {
      name,
      email,
      password,
      role,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    await sendOTPEmail(email, otp);
    res.status(200).json({
      success: true,
      message:
        "OTP sent to your email. Please verify to complete registration.",
      tempUserId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.verifyOTP = async (req, res) => {
  try {
    const { tempUserId, otp } = req.body;
    const tempUserData = tempUsers.get(tempUserId);
    if (!tempUserData) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification session" });
    }
    if (new Date() > tempUserData.expiresAt) {
      tempUsers.delete(tempUserId);
      return res
        .status(400)
        .json({ message: "OTP has expired. Please register again." });
    }
    if (tempUserData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const user = new User({
      name: tempUserData.name,
      email: tempUserData.email,
      password: tempUserData.password,
      role: tempUserData.role,
      isEmailVerified: true,
    });
    await user.save();
    tempUsers.delete(tempUserId);
    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: "Registration completed successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.resendOTP = async (req, res) => {
  try {
    const { tempUserId } = req.body;
    const tempUserData = tempUsers.get(tempUserId);
    if (!tempUserData) {
      return res.status(400).json({ message: "Invalid verification session" });
    }
    const newOTP = generateOTP();
    tempUsers.set(tempUserId, {
      ...tempUserData,
      otp: newOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Reset expiry to 10 minutes
    });
    await sendOTPEmail(tempUserData.email, newOTP);
    res.status(200).json({
      success: true,
      message: "New OTP sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }
    if (!user.password) {
      return res.status(400).json({
        message:
          "This account was created with Google. Please login with Google.",
      });
    }
    const otp = generateOTP();
    const tempResetId = crypto.randomUUID();
    passwordResetOTPs.set(tempResetId, {
      userId: user._id,
      email: user.email,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    console.log("Sending OTP email for password reset to:", email, "OTP:", otp);
    await sendOTPEmail(email, otp);
    res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
      tempResetId,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.verifyPasswordResetOTP = async (req, res) => {
  try {
    const { tempResetId, otp } = req.body;
    const otpData = passwordResetOTPs.get(tempResetId);
    if (!otpData) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP session" });
    }
    if (new Date() > otpData.expiresAt) {
      passwordResetOTPs.delete(tempResetId);
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }
    if (otpData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      tempResetId,
      email: otpData.email,
    });
  } catch (error) {
    console.error("Verify password reset OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { tempResetId, newPassword } = req.body;
    const otpData = passwordResetOTPs.get(tempResetId);
    if (!otpData) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP session" });
    }
    if (new Date() > otpData.expiresAt) {
      passwordResetOTPs.delete(tempResetId);
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }
    const user = await User.findById(otpData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = newPassword;
    await user.save();
    passwordResetOTPs.delete(tempResetId);
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (!user.password) {
      return res.status(400).json({ message: "Please login with Google" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.googleCallback = (req, res) => {
  try {
    const token = generateToken(req.user);
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`
    );
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/login?error=authentication_failed`
    );
  }
};
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
