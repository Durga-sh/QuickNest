const Booking = require("../model/Booking");
const Provider = require("../model/Provider");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay with error handling
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("❌ Missing Razorpay credentials in environment variables");
    throw new Error("Razorpay credentials not configured");
  }

  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Razorpay:", error);
}

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    console.log("🔄 Creating order with data:", req.body);

    if (!razorpay) {
      console.error("❌ Razorpay not initialized");
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

    // Validate required fields
    if (
      !providerId ||
      !service ||
      !servicePrice ||
      !bookingDate ||
      !timeSlot ||
      !address ||
      !contactPhone
    ) {
      console.error("❌ Missing required fields:", {
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

    // Validate provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      console.error("❌ Provider not found:", providerId);
      return res.status(404).json({ message: "Provider not found" });
    }

    // Validate user is authenticated
    if (!req.user || !req.user.id) {
      console.error("❌ User not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Create Razorpay order
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

    console.log("✅ Razorpay order created:", razorpayOrder.id);

    // Create booking with pending payment and generated bookingId
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
      // Generate a unique bookingId
      bookingId: `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Unique ID format
    });

    await booking.save();
    console.log("✅ Booking created:", booking.bookingId);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount,
      currency: "INR",
      bookingId: booking._id, // Note: This is still using _id, consider using bookingId if needed
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({
      message: "Server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Verify payment and update booking
exports.verifyPayment = async (req, res) => {
  try {
    console.log("🔄 Verifying payment:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // Validate required fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      console.error("❌ Missing payment verification fields");
      return res.status(400).json({
        message: "Missing payment verification data",
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Invalid payment signature");
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update booking with payment details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error("❌ Booking not found:", bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      console.error("❌ Unauthorized access to booking:", bookingId);
      return res.status(403).json({ message: "Access denied" });
    }

    booking.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    booking.paymentDetails.razorpaySignature = razorpay_signature;
    booking.paymentDetails.status = "completed";
    booking.status = "confirmed";

    await booking.save();
    console.log("✅ Payment verified and booking updated:", booking.bookingId);

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
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      message: "Server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter = { user: userId };
    if (status && status !== "all") {
      filter.status = status;
    }

    // Get bookings with populated provider and user data - FIXED populate paths
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

    // Check which bookings have reviews
    const Review = require("../model/Review");
    const bookingIds = bookings.map((booking) => booking._id);
    const existingReviews = await Review.find({
      bookingId: { $in: bookingIds },
    });

    // Create a map of booking IDs to review status
    const reviewMap = {};
    existingReviews.forEach((review) => {
      reviewMap[review.bookingId.toString()] = true;
    });

    // Add hasReview field to each booking and fix provider.user structure
    const bookingsWithReviewStatus = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      bookingObj.hasReview = reviewMap[booking._id.toString()] || false;

      // Fix provider.user structure for frontend compatibility
      if (bookingObj.provider && bookingObj.provider.userId) {
        bookingObj.provider.user = {
          name: bookingObj.provider.userId.name,
          email: bookingObj.provider.userId.email,
          phone: bookingObj.provider.userId.phone,
        };
      }

      return bookingObj;
    });

    // Get total count for pagination
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

// Get provider bookings - FIXED
exports.getProviderBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Find provider profile
    const Provider = require("../model/Provider");
    const provider = await Provider.findOne({ userId });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    // Build filter
    const filter = { provider: provider._id };
    if (status && status !== "all") {
      filter.status = status;
    }

    // Get bookings with populated user data - FIXED populate paths
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

    // Check which bookings have reviews
    const Review = require("../model/Review");
    const bookingIds = bookings.map((booking) => booking._id);
    const existingReviews = await Review.find({
      bookingId: { $in: bookingIds },
    });

    // Create a map of booking IDs to review data
    const reviewMap = {};
    existingReviews.forEach((review) => {
      reviewMap[review.bookingId.toString()] = {
        hasReview: true,
        rating: review.rating,
        comment: review.comment,
        reviewId: review._id,
      };
    });

    // Add review information to each booking and fix provider.user structure
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

      // Fix provider.user structure for frontend compatibility
      if (bookingObj.provider && bookingObj.provider.userId) {
        bookingObj.provider.user = {
          name: bookingObj.provider.userId.name,
          email: bookingObj.provider.userId.email,
          phone: bookingObj.provider.userId.phone,
        };
      }

      return bookingObj;
    });

    // Get total count for pagination
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

// Alternative approach: If you want to keep the populate simple and handle structure in code
exports.getUserBookingsAlternative = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter = { user: userId };
    if (status && status !== "all") {
      filter.status = status;
    }

    // Get bookings with simple populate
    const bookings = await Booking.find(filter)
      .populate("provider")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get provider user details separately
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

    // Check which bookings have reviews
    const Review = require("../model/Review");
    const bookingIds = bookings.map((booking) => booking._id);
    const existingReviews = await Review.find({
      bookingId: { $in: bookingIds },
    });

    // Create a map of booking IDs to review status
    const reviewMap = {};
    existingReviews.forEach((review) => {
      reviewMap[review.bookingId.toString()] = true;
    });

    // Add hasReview field to each booking
    const bookingsWithReviewStatus = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      bookingObj.hasReview = reviewMap[booking._id.toString()] || false;
      return bookingObj;
    });

    // Get total count for pagination
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
// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("provider", "user skills location rating")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking or is the provider
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

// Update booking status (for providers) - ENHANCED
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { bookingId } = req.params;

    console.log(`🔄 Updating booking ${bookingId} to status: ${status}`);

    // Validate status
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

    // Find provider using userId field
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // Find booking and verify ownership
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

    // Additional validation for completing bookings
    if (status === "completed") {
      const today = new Date();
      const bookingDate = new Date(booking.bookingDate);

      // Set both dates to midnight for date-only comparison
      today.setHours(0, 0, 0, 0);
      bookingDate.setHours(0, 0, 0, 0);

      if (today.getTime() < bookingDate.getTime()) {
        return res.status(400).json({
          message: "Cannot complete booking before the booking date",
        });
      }
    }

    // Update booking status
    booking.status = status;
    if (status === "completed") {
      booking.completedAt = new Date();
    }

    await booking.save();

    console.log(`✅ Booking ${bookingId} status updated to: ${status}`);

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        completedAt: booking.completedAt,
        user: booking.user,
      },
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
