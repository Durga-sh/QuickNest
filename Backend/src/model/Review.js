// Backend/src/model/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // Ensure one review per booking
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5",
      },
    },
    comment: {
      type: String,
      default: "",
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    isVerified: {
      type: Boolean,
      default: true, // Reviews are verified by default since they come from actual bookings
    },
    helpful: {
      type: Number,
      default: 0, // For future feature: users can mark reviews as helpful
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
reviewSchema.index({ providerId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ rating: 1 });

// Virtual for formatted date
reviewSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Instance method to check if review belongs to user
reviewSchema.methods.belongsToUser = function (userId) {
  return this.userId.toString() === userId.toString();
};

// Static method to get provider rating stats
reviewSchema.statics.getProviderStats = async function (providerId) {
  const stats = await this.aggregate([
    { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  stats[0].ratingDistribution.forEach((rating) => {
    ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    totalReviews: stats[0].totalReviews,
    ratingDistribution,
  };
};

// Pre-save middleware to validate that booking exists and is completed
reviewSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const Booking = mongoose.model("Booking");
      const booking = await Booking.findById(this.bookingId);

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== "completed") {
        throw new Error("Can only review completed bookings");
      }

      if (booking.user.toString() !== this.userId.toString()) {
        throw new Error("You can only review your own bookings");
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Review", reviewSchema);
