const Provider = require("../model/Provider");
const User = require("../model/User");

// Register a new provider profile
exports.registerProvider = async (req, res) => {
  try {
    const { userId, skills, location, pricing, availability } = req.body;

    // Check if user exists and has Provider role
    const user = await User.findById(userId);
    if (!user || user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "User is not authorized as a provider" });
    }

    // Check if provider profile already exists
    const existingProvider = await Provider.findOne({ userId });
    if (existingProvider) {
      return res
        .status(400)
        .json({ message: "Provider profile already exists" });
    }

    // Validate location
    if (!location || !location.coordinates || !location.address) {
      return res.status(400).json({ message: "Location details are required" });
    }

    // Transform availability structure to match schema
    const transformedAvailability = availability.map((slot) => ({
      day: slot.day,
      timeSlots: [
        {
          start: slot.from,
          end: slot.to,
        },
      ],
    }));

    const provider = new Provider({
      userId,
      skills,
      location: {
        type: "Point",
        coordinates: location.coordinates,
        address: location.address,
      },
      pricing,
      availability: transformedAvailability,
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

// Update provider profile
exports.updateProviderProfile = async (req, res) => {
  try {
    const { skills, location, pricing, availability } = req.body;
    const userId = req.user.id;

    // Check if user is a provider
    const user = await User.findById(userId);
    if (!user || user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "User is not authorized as a provider" });
    }

    // Find provider profile
    let provider = await Provider.findOne({ userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // Update fields
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
      // Transform availability structure to match schema
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

// Get provider profile
exports.getProviderProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a provider - FIXED: changed "Provider" to "provider"
    const user = await User.findById(userId);
    if (!user || user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "User is not authorized as a provider" });
    }

    // Find provider profile
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

// Get provider profile by ID (for users or admin)
exports.getProviderById = async (req, res) => {
  try {
    const { providerId } = req.params;

    const provider = await Provider.findById(providerId).populate(
      "userId",
      "name email"
    );
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
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
    console.error("Get provider by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    const {
      skill,
      location,
      radius = 50, // Default radius in km
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {
      status: "approved",
      isActive: true,
    };

    // Enhanced skill filter - support partial matches and case-insensitive search
    if (skill) {
      // Create a case-insensitive regex for partial matching
      const skillRegex = new RegExp(
        skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      filter.skills = { $in: [skillRegex] };
    }

    // Add price filter if provided
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter["pricing.price"] = priceFilter;
    }

    // Build aggregation pipeline
    let aggregationPipeline = [{ $match: filter }];

    // Add location-based filtering if coordinates provided
    if (location) {
      const coordinates = location
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      if (
        coordinates.length === 2 &&
        !isNaN(coordinates[0]) &&
        !isNaN(coordinates[1])
      ) {
        aggregationPipeline.unshift({
          $geoNear: {
            near: {
              type: "Point",
              coordinates: coordinates, // [longitude, latitude]
            },
            distanceField: "distance",
            maxDistance: radius * 1000, // Convert km to meters
            spherical: true,
          },
        });
      }
    }

    // Add population and projection
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
          status: 1,
          distance: { $ifNull: ["$distance", null] },
          user: {
            name: "$user.name",
            email: "$user.email",
          },
        },
      }
    );

    // Add sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    aggregationPipeline.push({ $sort: sortOptions });

    // Execute aggregation
    const providers = await Provider.aggregate(aggregationPipeline);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProviders = providers.slice(startIndex, endIndex);

    // Get total count for pagination
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
        radius,
        minPrice,
        maxPrice,
      },
    });
  } catch (error) {
    console.error("Get all providers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all unique skills from approved providers
exports.getAvailableSkills = async (req, res) => {
  try {
    const skills = await Provider.aggregate([
      {
        $match: {
          status: "approved",
          isActive: true,
        },
      },
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
      },
    ]);

    res.status(200).json({
      success: true,
      skills,
    });
  } catch (error) {
    console.error("Get available skills error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Enhanced search providers by text with better matching
exports.searchProviders = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Create case-insensitive regex for search
    const searchRegex = new RegExp(
      query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );

    const providers = await Provider.find({
      status: "approved",
      isActive: true,
      $or: [
        { skills: { $in: [searchRegex] } },
        { "location.address": searchRegex },
        { "pricing.service": searchRegex },
      ],
    })
      .populate("userId", "name email")
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalProviders = await Provider.countDocuments({
      status: "approved",
      isActive: true,
      $or: [
        { skills: { $in: [searchRegex] } },
        { "location.address": searchRegex },
        { "pricing.service": searchRegex },
      ],
    });

    const totalPages = Math.ceil(totalProviders / limit);

    res.status(200).json({
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
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProviders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      searchQuery: query,
    });
  } catch (error) {
    console.error("Search providers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get providers by specific skill/service type (new method for better service type filtering)
exports.getProvidersBySkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const {
      location,
      radius = 50,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = "rating",
      sortOrder = "desc",
    } = req.query;

    if (!skill) {
      return res.status(400).json({ message: "Skill parameter is required" });
    }

    // Build filter for exact skill match (case-insensitive)
    const filter = {
      status: "approved",
      isActive: true,
      skills: { $regex: new RegExp(`^${skill}$`, "i") }, // Exact match, case-insensitive
    };

    // Add price filter if provided
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter["pricing.price"] = priceFilter;
    }

    let aggregationPipeline = [{ $match: filter }];

    // Add location-based filtering if coordinates provided
    if (location) {
      const coordinates = location
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      if (
        coordinates.length === 2 &&
        !isNaN(coordinates[0]) &&
        !isNaN(coordinates[1])
      ) {
        aggregationPipeline.unshift({
          $geoNear: {
            near: {
              type: "Point",
              coordinates: coordinates,
            },
            distanceField: "distance",
            maxDistance: radius * 1000,
            spherical: true,
          },
        });
      }
    }

    // Add population and projection
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
          distance: { $ifNull: ["$distance", null] },
          user: {
            name: "$user.name",
            email: "$user.email",
          },
        },
      }
    );

    // Add sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    aggregationPipeline.push({ $sort: sortOptions });

    // Execute aggregation
    const providers = await Provider.aggregate(aggregationPipeline);

    // Apply pagination
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
      skill: skill,
      filters: {
        location,
        radius,
        minPrice,
        maxPrice,
      },
    });
  } catch (error) {
    console.error("Get providers by skill error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
