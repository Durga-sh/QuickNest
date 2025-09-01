const Booking = require("../model/Booking");
const Provider = require("../model/Provider");

// Start tracking for a booking
exports.startTracking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;

    // Find provider using userId field
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // Find booking and verify ownership
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.provider.toString() !== provider._id.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied - not your booking" });
    }

    // Ensure booking is in progress
    if (booking.status !== "in-progress") {
      return res.status(400).json({
        message: "Tracking can only be started for bookings in progress",
      });
    }

    // Start tracking
    booking.tracking = {
      isActive: true,
      startedAt: new Date(),
      currentLocation: {
        latitude,
        longitude,
        timestamp: new Date(),
      },
      locationHistory: [
        {
          latitude,
          longitude,
          timestamp: new Date(),
        },
      ],
    };

    await booking.save();

    // Get Socket.io instance and emit tracking started
    const io = req.app.get("io");
    if (io) {
      io.to(`tracking_${bookingId}`).emit("trackingStarted", {
        bookingId,
        providerId: provider._id,
        initialLocation: {
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        },
      });
    }

    console.log(`🟢 Tracking started for booking ${bookingId}`);

    res.json({
      success: true,
      message: "Tracking started successfully",
      tracking: booking.tracking,
    });
  } catch (error) {
    console.error("Start tracking error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update provider location
exports.updateLocation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    // Find provider using userId field
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // Find booking and verify ownership
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.provider.toString() !== provider._id.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied - not your booking" });
    }

    // Ensure tracking is active
    if (!booking.tracking || !booking.tracking.isActive) {
      return res.status(400).json({
        message: "Tracking is not active for this booking",
      });
    }

    // Update location
    const newLocation = {
      latitude,
      longitude,
      timestamp: new Date(),
    };

    booking.tracking.currentLocation = newLocation;
    booking.tracking.locationHistory.push(newLocation);

    // Keep only last 100 location points to prevent document from getting too large
    if (booking.tracking.locationHistory.length > 100) {
      booking.tracking.locationHistory =
        booking.tracking.locationHistory.slice(-100);
    }

    await booking.save();

    // Emit location update via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(`tracking_${bookingId}`).emit("locationReceived", {
        bookingId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: "Location updated successfully",
      location: newLocation,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Stop tracking for a booking
exports.stopTracking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find provider using userId field
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // Find booking and verify ownership
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.provider.toString() !== provider._id.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied - not your booking" });
    }

    // Stop tracking
    if (booking.tracking) {
      booking.tracking.isActive = false;
      booking.tracking.endedAt = new Date();
    }

    await booking.save();

    // Emit tracking stopped via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(`tracking_${bookingId}`).emit("trackingStopped", {
        bookingId,
        providerId: provider._id,
        endedAt: new Date().toISOString(),
      });
    }

    console.log(`🔴 Tracking stopped for booking ${bookingId}`);

    res.json({
      success: true,
      message: "Tracking stopped successfully",
      tracking: booking.tracking,
    });
  } catch (error) {
    console.error("Stop tracking error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current tracking status for a booking
exports.getTrackingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate("provider", "businessName contactPhone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user has permission to view tracking
    const isUser = booking.user._id.toString() === req.user.id;
    const provider = await Provider.findOne({ userId: req.user.id });
    const isProvider =
      provider && booking.provider._id.toString() === provider._id.toString();

    if (!isUser && !isProvider) {
      return res.status(403).json({
        message: "Access denied - not authorized to view this tracking",
      });
    }

    // Initialize tracking object if it doesn't exist
    if (!booking.tracking) {
      booking.tracking = {
        isActive: false,
        startedAt: null,
        endedAt: null,
        currentLocation: null,
        locationHistory: [],
      };
    }

    res.json({
      success: true,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        tracking: booking.tracking,
        user: booking.user,
        provider: booking.provider,
        address: booking.address,
        coordinates: booking.coordinates,
      },
    });
  } catch (error) {
    console.error("Get tracking status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all tracking data for provider's bookings
exports.getProviderTrackingBookings = async (req, res) => {
  try {
    // Find provider using userId field
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // Get all bookings for this provider with tracking data
    const bookings = await Booking.find({ provider: provider._id })
      .populate("user", "name email")
      .select(
        "bookingId status tracking address coordinates bookingDate timeSlot"
      )
      .sort({ createdAt: -1 });

    // Filter bookings that have tracking data or are in progress
    const trackingBookings = bookings.filter(
      (booking) =>
        booking.tracking ||
        booking.status === "in-progress" ||
        booking.status === "confirmed"
    );

    res.json({
      success: true,
      bookings: trackingBookings.map((booking) => ({
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        tracking: booking.tracking || {
          isActive: false,
          startedAt: null,
          endedAt: null,
          currentLocation: null,
          locationHistory: [],
        },
        user: booking.user,
        address: booking.address,
        coordinates: booking.coordinates,
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
      })),
    });
  } catch (error) {
    console.error("Get provider tracking bookings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
