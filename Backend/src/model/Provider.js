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
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create 2dsphere index for geospatial queries
ProviderSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Provider", ProviderSchema);
