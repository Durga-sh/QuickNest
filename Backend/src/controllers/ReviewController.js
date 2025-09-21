const Review = require("../model/Review");
const Provider = require("../model/Provider");
const User = require("../model/User");
const mongoose = require("mongoose");
exports.submitReview = async (req, res) => {
  try {
    const { bookingId, providerId, rating, comment } = req.body;
    const userId = req.user.id;
    if (!bookingId || !providerId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Booking ID, Provider ID, and rating are required",
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Review already exists for this booking",
      });
    }
    const review = new Review({
      userId,
      providerId,
      bookingId,
      rating,
      comment: comment || "",
    });
    await review.save();
    await updateProviderRating(providerId);
    const populatedReview = await Review.findById(review._id)
      .populate("userId", "name email")
      .populate("providerId", "userId");
    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Submit review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    const reviews = await Review.find({ providerId })
      .populate("userId", "name email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const totalReviews = await Review.countDocuments({ providerId });
    const totalPages = Math.ceil(totalReviews / limit);
    const ratingStats = await Review.aggregate([
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
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingDistribution.forEach((rating) => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
    }
    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats: {
        averageRating:
          ratingStats.length > 0 ? ratingStats[0].averageRating : 0,
        totalReviews: ratingStats.length > 0 ? ratingStats[0].totalReviews : 0,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Get provider reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getReviewByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const review = await Review.findOne({ bookingId })
      .populate("userId", "name email")
      .populate("providerId", "userId");
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found for this booking",
      });
    }
    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Get review by booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }
    const oldRating = review.rating;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();
    if (rating !== undefined && rating !== oldRating) {
      await updateProviderRating(review.providerId);
    }
    const updatedReview = await Review.findById(reviewId)
      .populate("userId", "name email")
      .populate("providerId", "userId");
    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    const user = await User.findById(userId);
    if (review.userId.toString() !== userId && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }
    const providerId = review.providerId;
    await Review.findByIdAndDelete(reviewId);
    await updateProviderRating(providerId);
    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ userId })
      .populate("providerId", "userId skills location")
      .populate({
        path: "providerId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const totalReviews = await Review.countDocuments({ userId });
    const totalPages = Math.ceil(totalReviews / limit);
    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
async function updateProviderRating(providerId) {
  try {
    const ratingStats = await Review.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);
    const provider = await Provider.findById(providerId);
    if (provider && ratingStats.length > 0) {
      provider.rating = Math.round(ratingStats[0].averageRating * 10) / 10; // Round to 1 decimal
      provider.totalReviews = ratingStats[0].totalReviews;
    } else if (provider) {
      provider.rating = 0;
      provider.totalReviews = 0;
    }
    if (provider) {
      await provider.save();
    }
    return ratingStats.length > 0
      ? ratingStats[0]
      : { averageRating: 0, totalReviews: 0 };
  } catch (error) {
    console.error("Error updating provider rating:", error);
    throw error;
  }
}
