const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  skills: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "At least one skill is required",
    },
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v) {
          return (
            v.length === 2 &&
            v[0] >= -180 &&
            v[0] <= 180 && // longitude
            v[1] >= -90 &&
            v[1] <= 90
          ); // latitude
        },
        message: "Coordinates must be [longitude, latitude] with valid ranges",
      },
    },
    address: {
      type: String,
      required: true,
    },
  },
  pricing: {
    type: [
      {
        service: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    required: true,
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "At least one service with price is required",
    },
  },
  availability: {
    type: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
        timeSlots: [
          {
            start: {
              type: String,
              required: true,
              match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
            },
            end: {
              type: String,
              required: true,
              match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            },
          },
        ],
      },
    ],
    required: true,
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "At least one availability slot is required",
    },
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalJobs: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
ProviderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create 2dsphere index for geospatial queries
ProviderSchema.index({ location: "2dsphere" });

// Create compound index for common queries
ProviderSchema.index({ status: 1, isActive: 1 });
ProviderSchema.index({ skills: 1, status: 1 });

module.exports = mongoose.model("Provider", ProviderSchema);
