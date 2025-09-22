const Booking = require("../model/Booking");
const Provider = require("../model/Provider");
exports.startTracking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.provider.toString() !== provider._id.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied - not your booking" });
    }
    if (booking.status !== "in-progress") {
      return res.status(400).json({
        message: "Tracking can only be started for bookings in progress",
      });
    }

    console.log(`Starting tracking for booking ${bookingId}`);

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
    console.log(`Tracking started for booking ${bookingId}`);
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
exports.updateLocation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.provider.toString() !== provider._id.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied - not your booking" });
    }
    if (!booking.tracking || !booking.tracking.isActive) {
      return res.status(400).json({
        message: "Tracking is not active for this booking",
      });
    }
    const newLocation = {
      latitude,
      longitude,
      timestamp: new Date(),
    };
    booking.tracking.currentLocation = newLocation;
    booking.tracking.locationHistory.push(newLocation);
    if (booking.tracking.locationHistory.length > 100) {
      booking.tracking.locationHistory =
        booking.tracking.locationHistory.slice(-100);
    }
    await booking.save();
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
exports.stopTracking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.provider.toString() !== provider._id.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied - not your booking" });
    }
    if (booking.tracking) {
      booking.tracking.isActive = false;
      booking.tracking.endedAt = new Date();
    }
    await booking.save();
    const io = req.app.get("io");
    if (io) {
      io.to(`tracking_${bookingId}`).emit("trackingStopped", {
        bookingId,
        providerId: provider._id,
        endedAt: new Date().toISOString(),
      });
    }
    console.log(`ðŸ”´ Tracking stopped for booking ${bookingId}`);
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
exports.getTrackingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Optimized query with lean() for better performance
    const booking = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate("provider", "businessName contactPhone")
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isUser = booking.user._id.toString() === req.user.id;
    const provider = await Provider.findOne({ userId: req.user.id }).lean();
    const isProvider =
      provider && booking.provider._id.toString() === provider._id.toString();

    if (!isUser && !isProvider) {
      return res.status(403).json({
        message: "Access denied - not authorized to view this tracking",
      });
    }

    // Ensure tracking data exists
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
exports.getProviderTrackingBookings = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id }).lean();
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // Optimized query with limited fields and indexing
    const bookings = await Booking.find({
      provider: provider._id,
      status: { $in: ["confirmed", "in-progress"] }, // Only fetch relevant bookings
    })
      .populate("user", "name email")
      .select(
        "bookingId status tracking address coordinates bookingDate timeSlot createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(20) // Limit results for performance
      .lean(); // Use lean() for better performance

    // Filter and format efficiently
    const trackingBookings = bookings
      .filter(
        (booking) =>
          booking.tracking ||
          booking.status === "in-progress" ||
          booking.status === "confirmed"
      )
      .map((booking) => ({
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
      }));

    res.json({
      success: true,
      bookings: trackingBookings,
    });
  } catch (error) {
    console.error("Get provider tracking bookings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
