const Provider = require("../model/Provider");
const User = require("../model/User");

// Register a new provider profile
exports.registerProvider = async (req, res) => {
  try {
    const { userId, skills, location, pricing, availability } = req.body;

    // Check if user exists and has Provider role
    const user = await User.findById(userId);
    if (!user || user.role !== "Provider") {
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

    const provider = new Provider({
      userId,
      skills,
      location: {
        type: "Point",
        coordinates: location.coordinates,
        address: location.address,
      },
      pricing,
      availability,
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
    if (!user || user.role !== "Provider") {
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
    if (availability) provider.availability = availability;

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

    // Check if user is a provider
    const user = await User.findById(userId);
    if (!user || user.role !== "Provider") {
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

// Admin: Approve or reject provider
exports.approveOrRejectProvider = async (req, res) => {
  try {
    const { providerId, status } = req.body;
    const userId = req.user.id;

    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "User is not authorized as admin" });
    }

    // Find provider
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    provider.status = status;
    await provider.save();

    res.status(200).json({
      success: true,
      message: `Provider ${status} successfully`,
      provider: {
        id: provider._id,
        userId: provider.userId,
        status: provider.status,
      },
    });
  } catch (error) {
    console.error("Approve/reject provider error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
