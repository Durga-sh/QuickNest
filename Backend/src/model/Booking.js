// Backend/src/model/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    servicePrice: {
      type: Number,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    specialInstructions: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      amount: Number,
      currency: {
        type: String,
        default: "INR",
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
    // Real-time tracking fields
    tracking: {
      isActive: {
        type: Boolean,
        default: false,
      },
      startedAt: {
        type: Date,
      },
      endedAt: {
        type: Date,
      },
      currentLocation: {
        latitude: Number,
        longitude: Number,
        timestamp: Date,
      },
      locationHistory: [
        {
          latitude: Number,
          longitude: Number,
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Generate booking ID before saving
bookingSchema.pre("save", async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model("Booking").countDocuments();
    this.bookingId = `BK${Date.now()}${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
