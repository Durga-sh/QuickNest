const Booking = require("../model/Booking");
const Provider = require("../model/Provider");
const Razorpay = require("razorpay");
const crypto = require("crypto");
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("âŒ Missing Razorpay credentials in environment variables");
    throw new Error("Razorpay credentials not configured");
  }
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("âœ… Razorpay initialized successfully");
} catch (error) {
  console.error("âŒ Failed to initialize Razorpay:", error);
}
exports.createOrder = async (req, res) => {
  try {
    console.log("ðŸ”„ Creating order with data:", req.body);
    if (!razorpay) {
      console.error("âŒ Razorpay not initialized");
      return res.status(500).json({
        message: "Payment service not configured properly",
      });
    }
    const {
      providerId,
      service,
      servicePrice,
      bookingDate,
      timeSlot,
      address,
      coordinates,
      contactPhone,
      specialInstructions,
    } = req.body;
    if (
      !providerId ||
      !service ||
      !servicePrice ||
      !bookingDate ||
      !timeSlot ||
      !address ||
      !contactPhone
    ) {
      console.error("âŒ Missing required fields:", {
        providerId: !!providerId,
        service: !!service,
        servicePrice: !!servicePrice,
        bookingDate: !!bookingDate,
        timeSlot: !!timeSlot,
        address: !!address,
        contactPhone: !!contactPhone,
      });
      return res.status(400).json({
        message: "Missing required fields",
      });
    }
    const provider = await Provider.findById(providerId);
    if (!provider) {
      console.error("âŒ Provider not found:", providerId);
      return res.status(404).json({ message: "Provider not found" });
    }
    if (!req.user || !req.user.id) {
      console.error("âŒ User not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }
    const amount = Math.round(servicePrice * 100); // Convert to paise and ensure integer
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: {
        service,
        providerId,
        userId: req.user.id,
      },
    });
    console.log("âœ… Razorpay order created:", razorpayOrder.id);
    const booking = new Booking({
      user: req.user.id,
      provider: providerId,
      service,
      servicePrice,
      bookingDate: new Date(bookingDate),
      timeSlot: {
        start: timeSlot.start,
        end: timeSlot.end,
      },
      address,
      coordinates: coordinates || {},
      contactPhone,
      specialInstructions: specialInstructions || "",
      paymentDetails: {
        razorpayOrderId: razorpayOrder.id,
        amount,
        status: "pending",
      },
      bookingId: `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Unique ID format
    });
    await booking.save();
    console.log("âœ… Booking created:", booking.bookingId);
    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount,
      currency: "INR",
      bookingId: booking._id, // Note: This is still using _id, consider using bookingId if needed
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("âŒ Create order error:", error);
    res.status(500).json({
      message: "Server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};
exports.verifyPayment = async (req, res) => {
  try {
    console.log("ðŸ”„ Verifying payment:", req.body);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      console.error("âŒ Missing payment verification fields");
      return res.status(400).json({
        message: "Missing payment verification data",
      });
    }
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    if (expectedSignature !== razorpay_signature) {
      console.error("âŒ Invalid payment signature");
      return res.status(400).json({ message: "Invalid payment signature" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error("âŒ Booking not found:", bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.user.toString() !== req.user.id) {
      console.error("âŒ Unauthorized access to booking:", bookingId);
      return res.status(403).json({ message: "Access denied" });
    }
    booking.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    booking.paymentDetails.razorpaySignature = razorpay_signature;
    booking.paymentDetails.status = "completed";
    booking.status = "confirmed";
    await booking.save();
    console.log("âœ… Payment verified and booking updated:", booking.bookingId);
    res.json({
      success: true,
      message: "Payment verified successfully",
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("âŒ Payment verification error:", error);
    res.status(500).json({
      message: "Server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: userId };
    if (status && status !== "all") {
      filter.status = status;
    }
    const bookings = await Booking.find(filter)
      .populate({
        path: "provider",
        populate: {
          path: "userId", // Changed from "user" to "userId"
          select: "name email phone",
        },
      })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const Review = require("../model/Review");
    const bookingIds = bookings.map((booking) => booking._id);
    const existingReviews = await Review.find({
      bookingId: { $in: bookingIds },
    });
    const reviewMap = {};
    existingReviews.forEach((review) => {
      reviewMap[review.bookingId.toString()] = true;
    });
    const bookingsWithReviewStatus = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      bookingObj.hasReview = reviewMap[booking._id.toString()] || false;
      if (bookingObj.provider && bookingObj.provider.userId) {
        bookingObj.provider.user = {
          name: bookingObj.provider.userId.name,
          email: bookingObj.provider.userId.email,
          phone: bookingObj.provider.userId.phone,
        };
      }
      return bookingObj;
    });
    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / limit);
    res.status(200).json({
      success: true,
      bookings: bookingsWithReviewStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBookings,
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getProviderBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const Provider = require("../model/Provider");
    const provider = await Provider.findOne({ userId });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }
    const filter = { provider: provider._id };
    if (status && status !== "all") {
      filter.status = status;
    }
    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate({
        path: "provider",
        populate: {
          path: "userId", // Changed from "user" to "userId"
          select: "name email phone",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const Review = require("../model/Review");
    const bookingIds = bookings.map((booking) => booking._id);
    const existingReviews = await Review.find({
      bookingId: { $in: bookingIds },
    });
    const reviewMap = {};
    existingReviews.forEach((review) => {
      reviewMap[review.bookingId.toString()] = {
        hasReview: true,
        rating: review.rating,
        comment: review.comment,
        reviewId: review._id,
      };
    });
    const bookingsWithReviewStatus = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      const reviewInfo = reviewMap[booking._id.toString()];
      bookingObj.hasReview = reviewInfo?.hasReview || false;
      if (reviewInfo) {
        bookingObj.review = {
          rating: reviewInfo.rating,
          comment: reviewInfo.comment,
          reviewId: reviewInfo.reviewId,
        };
      }
      if (bookingObj.provider && bookingObj.provider.userId) {
        bookingObj.provider.user = {
          name: bookingObj.provider.userId.name,
          email: bookingObj.provider.userId.email,
          phone: bookingObj.provider.userId.phone,
        };
      }
      return bookingObj;
    });
    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / limit);
    res.status(200).json({
      success: true,
      bookings: bookingsWithReviewStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBookings,
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get provider bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getUserBookingsAlternative = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: userId };
    if (status && status !== "all") {
      filter.status = status;
    }
    const bookings = await Booking.find(filter)
      .populate("provider")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const Provider = require("../model/Provider");
    const User = require("../model/User");
    for (let booking of bookings) {
      if (booking.provider && booking.provider.userId) {
        const providerUser = await User.findById(
          booking.provider.userId
        ).select("name email phone");
        if (providerUser) {
          booking.provider = booking.provider.toObject();
          booking.provider.user = {
            name: providerUser.name,
            email: providerUser.email,
            phone: providerUser.phone,
          };
        }
      }
    }
    const Review = require("../model/Review");
    const bookingIds = bookings.map((booking) => booking._id);
    const existingReviews = await Review.find({
      bookingId: { $in: bookingIds },
    });
    const reviewMap = {};
    existingReviews.forEach((review) => {
      reviewMap[review.bookingId.toString()] = true;
    });
    const bookingsWithReviewStatus = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      bookingObj.hasReview = reviewMap[booking._id.toString()] || false;
      return bookingObj;
    });
    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / limit);
    res.status(200).json({
      success: true,
      bookings: bookingsWithReviewStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBookings,
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("provider", "user skills location rating")
      .populate("user", "name email");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const provider = await Provider.findOne({ userId: req.user.id });
    if (
      booking.user._id.toString() !== req.user.id &&
      (!provider || booking.provider._id.toString() !== provider._id.toString())
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { bookingId } = req.params;
    console.log(`ðŸ”„ Updating booking ${bookingId} to status: ${status}`);
    const validStatuses = [
      "pending",
      "confirmed",
      "in-progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Valid statuses are: " + validStatuses.join(", "),
      });
    }
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }
    const booking = await Booking.findById(bookingId).populate(
      "user",
      "name email"
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.provider.toString() !== provider._id.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied - not your booking" });
    }
    if (status === "completed") {
      const today = new Date();
      const bookingDate = new Date(booking.bookingDate);
      today.setHours(0, 0, 0, 0);
      bookingDate.setHours(0, 0, 0, 0);
      if (today.getTime() < bookingDate.getTime()) {
        return res.status(400).json({
          message: "Cannot complete booking before the booking date",
        });
      }
    }
    booking.status = status;
    if (status === "completed") {
      booking.completedAt = new Date();
      if (booking.tracking && booking.tracking.isActive) {
        booking.tracking.isActive = false;
        booking.tracking.endedAt = new Date();
      }
    } else if (status === "in-progress") {
      if (!booking.tracking) {
        booking.tracking = {
          isActive: false,
          startedAt: null,
          endedAt: null,
          currentLocation: null,
          locationHistory: [],
        };
      }
    }
    await booking.save();
    const io = req.app.get("io");
    if (io) {
      io.to(`tracking_${bookingId}`).emit("serviceStatusReceived", {
        bookingId,
        status,
        message: `Booking ${status} successfully`,
        timestamp: new Date().toISOString(),
      });
      if (status === "completed") {
        io.to(`tracking_${bookingId}`).emit("trackingStopped", {
          bookingId,
          providerId: provider._id,
          endedAt: new Date().toISOString(),
        });
      }
    }
    console.log(`âœ… Booking ${bookingId} status updated to: ${status}`);
    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        completedAt: booking.completedAt,
        user: booking.user,
        tracking: booking.tracking,
      },
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
