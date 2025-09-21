const Provider = require("../model/Provider");
const User = require("../model/User");
exports.registerProvider = async (req, res) => {
  try {
    const { userId, skills, location, pricing } = req.body;
    const user = await User.findById(userId);
    if (!user || user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "User is not authorized as a provider" });
    }
    const existingProvider = await Provider.findOne({ userId });
    if (existingProvider) {
      return this.addServicesToProvider(req, res, existingProvider);
    }
    if (!location || !location.coordinates || !location.address) {
      return res.status(400).json({ message: "Location details are required" });
    }
    const provider = new Provider({
      userId,
      skills,
      location: {
        type: "Point",
        coordinates: location.coordinates,
        address: location.address,
      },
      pricing,
      status: "pending",
    });
    await provider.save();
    res.status(201).json({
      success: true,
      message:
        "Provider profile registered successfully. Awaiting admin approval.",
      provider,
    });
  } catch (error) {
    console.error("Provider registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.addServicesToProvider = async (req, res, existingProvider = null) => {
  try {
    const { userId, skills, pricing } = req.body;
    let provider = existingProvider;
    if (!provider) {
      const user = await User.findById(userId);
      if (!user || user.role !== "provider") {
        return res
          .status(403)
          .json({ message: "User is not authorized as a provider" });
      }
      provider = await Provider.findOne({ userId });
      if (!provider) {
        return res.status(404).json({
          message:
            "Provider profile not found. Please create a provider profile first.",
        });
      }
    }
    if (skills && Array.isArray(skills)) {
      const newSkills = skills.filter(
        (skill) => !provider.skills.includes(skill)
      );
      provider.skills = [...provider.skills, ...newSkills];
    }
    if (pricing && Array.isArray(pricing)) {
      const newPricingServices = pricing.filter(
        (newService) =>
          !provider.pricing.some(
            (existingService) =>
              existingService.service.toLowerCase() ===
              newService.service.toLowerCase()
          )
      );
      provider.pricing = [...provider.pricing, ...newPricingServices];
    }
    await provider.save();
    res.status(200).json({
      success: true,
      message: "Services added to provider profile successfully.",
      provider: {
        id: provider._id,
        userId: provider.userId,
        skills: provider.skills,
        location: provider.location,
        pricing: provider.pricing,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Add services error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.addServices = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const { skills, pricing, availability } = req.body;
    const user = await User.findById(userId);
    if (!user || user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "User is not authorized as a provider" });
    }
    const provider = await Provider.findOne({ userId });
    if (!provider) {
      return res.status(404).json({
        message:
          "Provider profile not found. Please create a provider profile first.",
      });
    }
    req.body.userId = userId;
    return this.addServicesToProvider(req, res, provider);
  } catch (error) {
    console.error("Add services endpoint error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.removeService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceName } = req.params;
    const user = await User.findById(userId);
    if (!user || user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "User is not authorized as a provider" });
    }
    const provider = await Provider.findOne({ userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }
    const serviceIndex = provider.pricing.findIndex(
      (service) => service.service.toLowerCase() === serviceName.toLowerCase()
    );
    if (serviceIndex === -1) {
      return res.status(404).json({ message: "Service not found" });
    }
    provider.pricing.splice(serviceIndex, 1);
    const serviceSkill = provider.pricing.find(
      (service) => service.service.toLowerCase() === serviceName.toLowerCase()
    );
    if (!serviceSkill) {
      const skillIndex = provider.skills.findIndex(
        (skill) => skill.toLowerCase() === serviceName.toLowerCase()
      );
      if (skillIndex !== -1) {
        provider.skills.splice(skillIndex, 1);
      }
    }
    await provider.save();
    res.status(200).json({
      success: true,
      message: "Service removed successfully",
      provider: {
        id: provider._id,
        userId: provider.userId,
        skills: provider.skills,
        pricing: provider.pricing,
        availability: provider.availability,
      },
    });
  } catch (error) {
    console.error("Remove service error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.updateProviderProfile = async (req, res) => {
  try {
    const { skills, location, pricing, availability } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "User is not authorized as a provider" });
    }
    let provider = await Provider.findOne({ userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }
    if (skills) provider.skills = skills;
    if (location) {
      provider.location = {
        type: "Point",
        coordinates: location.coordinates,
        address: location.address,
      };
    }
    if (pricing) provider.pricing = pricing;
    if (availability) {
      provider.availability = availability.map((slot) => ({
        day: slot.day,
        timeSlots: [
          {
            start: slot.from || slot.start,
            end: slot.to || slot.end,
          },
        ],
      }));
    }
    await provider.save();
    res.status(200).json({
      success: true,
      message: "Provider profile updated successfully",
      provider: {
        id: provider._id,
        userId: provider.userId,
        skills: provider.skills,
        location: provider.location,
        pricing: provider.pricing,
        availability: provider.availability,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Provider profile update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getProviderProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "User is not authorized as a provider" });
    }
    const provider = await Provider.findOne({ userId }).populate(
      "userId",
      "name email"
    );
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }
    res.status(200).json({
      success: true,
      provider: {
        id: provider._id,
        user: {
          name: provider.userId.name,
          email: provider.userId.email,
        },
        skills: provider.skills,
        location: provider.location,
        pricing: provider.pricing,
        availability: provider.availability,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Get provider profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getProviderById = async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await Provider.findById(providerId).populate(
      "userId",
      "name email phone"
    );
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }
    const Review = require("../model/Review");
    const reviewStats = await Review.getProviderStats(providerId);
    const recentReviews = await Review.find({ providerId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json({
      success: true,
      provider: {
        id: provider._id,
        user: {
          name: provider.userId.name,
          email: provider.userId.email,
          phone: provider.userId.phone,
        },
        skills: provider.skills,
        location: provider.location,
        pricing: provider.pricing,
        availability: provider.availability,
        status: provider.status,
        rating: reviewStats.averageRating,
        totalReviews: reviewStats.totalReviews,
        reviewCount: reviewStats.totalReviews, // For backward compatibility
        ratingDistribution: reviewStats.ratingDistribution,
        recentReviews: recentReviews.map((review) => ({
          id: review._id,
          rating: review.rating,
          comment: review.comment,
          userName: review.userId.name,
          date: review.createdAt,
        })),
        yearsOfExperience: provider.yearsOfExperience || 0,
        bio: provider.bio || "",
        services: provider.pricing, // Map pricing to services for consistency
        serviceAreas: provider.serviceAreas || [],
        address: provider.location?.address,
        isActive: provider.isActive,
        totalJobs: provider.totalJobs || 0,
        createdAt: provider.createdAt,
      },
    });
  } catch (error) {
    console.error("Get provider by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getAllProviders = async (req, res) => {
  try {
    const {
      skill,
      location,
      radius = 50,
      minPrice,
      maxPrice,
      minRating = 0,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const filter = {
      status: "approved",
      isActive: true,
    };
    if (minRating > 0) {
      filter.rating = { $gte: parseFloat(minRating) };
    }
    if (skill) {
      const skillRegex = new RegExp(`^${skill}$`, "i");
      filter["pricing.service"] = skillRegex;
    }
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter["pricing.price"] = priceFilter;
    }
    let aggregationPipeline = [];
    if (location) {
      const coordinates = location
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      if (
        coordinates.length === 2 &&
        !isNaN(coordinates[0]) &&
        !isNaN(coordinates[1])
      ) {
        const [lng, lat] = coordinates;
        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          aggregationPipeline.push({
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [lng, lat],
              },
              distanceField: "distance",
              maxDistance: radius * 1000,
              spherical: true,
              query: filter,
            },
          });
        } else {
          aggregationPipeline.push({ $match: filter });
        }
      } else {
        aggregationPipeline.push({ $match: filter });
      }
    } else {
      aggregationPipeline.push({ $match: filter });
    }
    aggregationPipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "providerId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          skills: 1,
          location: 1,
          pricing: 1,
          availability: 1,
          rating: { $ifNull: ["$averageRating", "$rating"] },
          totalReviews: { $ifNull: ["$reviewCount", "$totalReviews"] },
          totalJobs: 1,
          createdAt: 1,
          status: 1,
          isActive: 1,
          distance: { $ifNull: ["$distance", null] },
          user: {
            name: "$user.name",
            email: "$user.email",
          },
        },
      }
    );
    const sortOptions = {};
    if (location && sortBy === "distance") {
      sortOptions.distance = 1;
    } else if (sortBy === "rating") {
      sortOptions.rating = sortOrder === "desc" ? -1 : 1;
    } else {
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    }
    aggregationPipeline.push({ $sort: sortOptions });
    const providers = await Provider.aggregate(aggregationPipeline);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProviders = providers.slice(startIndex, endIndex);
    const totalProviders = providers.length;
    const totalPages = Math.ceil(totalProviders / limit);
    res.status(200).json({
      success: true,
      data: paginatedProviders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProviders,
        hasNextPage: endIndex < totalProviders,
        hasPrevPage: startIndex > 0,
      },
      filters: {
        skill,
        location,
        radius: parseInt(radius),
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        minRating: minRating ? parseFloat(minRating) : 0,
        sortBy,
        sortOrder,
      },
      locationBased: !!location,
    });
  } catch (error) {
    console.error("Get all providers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getProviderStats = async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }
    const Review = require("../model/Review");
    const reviewStats = await Review.getProviderStats(providerId);
    const Booking = require("../model/Booking");
    const bookingStats = await Booking.aggregate([
      { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$servicePrice", 0],
            },
          },
        },
      },
    ]);
    const stats =
      bookingStats.length > 0
        ? bookingStats[0]
        : {
            totalBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            totalRevenue: 0,
          };
    const completionRate =
      stats.totalBookings > 0
        ? (stats.completedBookings / stats.totalBookings) * 100
        : 0;
    res.status(200).json({
      success: true,
      stats: {
        ...reviewStats,
        ...stats,
        completionRate: Math.round(completionRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Get provider stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getAvailableSkills = async (req, res) => {
  try {
    const { location, radius = 50 } = req.query;
    let aggregationPipeline = [];
    if (location) {
      const coordinates = location
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      if (
        coordinates.length === 2 &&
        !isNaN(coordinates[0]) &&
        !isNaN(coordinates[1])
      ) {
        const [lng, lat] = coordinates;
        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          aggregationPipeline.push({
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [lng, lat],
              },
              distanceField: "distance",
              maxDistance: radius * 1000,
              spherical: true,
              query: {
                status: "approved",
                isActive: true,
              },
            },
          });
        }
      }
    }
    if (aggregationPipeline.length === 0) {
      aggregationPipeline.push({
        $match: {
          status: "approved",
          isActive: true,
        },
      });
    }
    aggregationPipeline.push(
      {
        $unwind: "$skills",
      },
      {
        $group: {
          _id: "$skills",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          skill: "$_id",
          count: 1,
          _id: 0,
        },
      }
    );
    const skills = await Provider.aggregate(aggregationPipeline);
    res.status(200).json({
      success: true,
      skills,
      locationFiltered: !!location,
    });
  } catch (error) {
    console.error("Get available skills error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.searchProviders = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      location,
      radius = 50,
      minPrice,
      maxPrice,
    } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const searchRegex = new RegExp(
      query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );
    const baseFilter = {
      status: "approved",
      isActive: true,
      $or: [
        { skills: { $in: [searchRegex] } },
        { "location.address": searchRegex },
        { "pricing.service": searchRegex },
      ],
    };
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      baseFilter["pricing.price"] = priceFilter;
    }
    let aggregationPipeline = [];
    if (location) {
      const coordinates = location
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      if (
        coordinates.length === 2 &&
        !isNaN(coordinates[0]) &&
        !isNaN(coordinates[1])
      ) {
        const [lng, lat] = coordinates;
        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          aggregationPipeline.push({
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [lng, lat],
              },
              distanceField: "distance",
              maxDistance: radius * 1000,
              spherical: true,
              query: baseFilter,
            },
          });
        }
      }
    }
    if (aggregationPipeline.length === 0) {
      const providers = await Provider.find(baseFilter)
        .populate("userId", "name email")
        .sort({ rating: -1, totalReviews: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      const totalProviders = await Provider.countDocuments(baseFilter);
      const totalPages = Math.ceil(totalProviders / limit);
      return res.status(200).json({
        success: true,
        data: providers.map((provider) => ({
          id: provider._id,
          userId: provider.userId._id,
          user: {
            name: provider.userId.name,
            email: provider.userId.email,
          },
          skills: provider.skills,
          location: provider.location,
          pricing: provider.pricing,
          availability: provider.availability,
          rating: provider.rating,
          totalReviews: provider.totalReviews,
          totalJobs: provider.totalJobs,
          createdAt: provider.createdAt,
          distance: null,
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProviders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        searchQuery: query,
        locationBased: false,
      });
    }
    aggregationPipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          skills: 1,
          location: 1,
          pricing: 1,
          availability: 1,
          rating: 1,
          totalReviews: 1,
          totalJobs: 1,
          createdAt: 1,
          distance: 1,
          user: {
            name: "$user.name",
            email: "$user.email",
          },
        },
      },
      {
        $sort: { distance: 1, rating: -1 },
      }
    );
    const providers = await Provider.aggregate(aggregationPipeline);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProviders = providers.slice(startIndex, endIndex);
    const totalProviders = providers.length;
    const totalPages = Math.ceil(totalProviders / limit);
    res.status(200).json({
      success: true,
      data: paginatedProviders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProviders,
        hasNextPage: endIndex < totalProviders,
        hasPrevPage: startIndex > 0,
      },
      searchQuery: query,
      locationBased: true,
      filters: {
        location,
        radius: parseInt(radius),
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      },
    });
  } catch (error) {
    console.error("Search providers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
