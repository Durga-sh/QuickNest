// Backend/src/routes/voiceRoutes.js
const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const Booking = require("../model/Booking");
const Provider = require("../model/Provider");

// Voice processing utilities
class VoiceBookingProcessor {
  constructor() {
    this.serviceKeywords = {
      electrician: [
        "electrician",
        "electrical",
        "electric",
        "wiring",
        "electrical work",
        "light",
        "power",
      ],
      plumber: [
        "plumber",
        "plumbing",
        "pipe",
        "water",
        "leak",
        "drain",
        "tap",
        "faucet",
        "toilet",
      ],
      cleaner: [
        "cleaner",
        "cleaning",
        "clean",
        "maid",
        "housekeeping",
        "sweep",
        "mop",
      ],
      carpenter: [
        "carpenter",
        "wood",
        "furniture",
        "repair",
        "cabinet",
        "door",
        "window",
      ],
      mechanic: [
        "mechanic",
        "car",
        "vehicle",
        "auto",
        "bike",
        "motorcycle",
        "repair",
      ],
      gardener: [
        "gardener",
        "garden",
        "lawn",
        "plant",
        "landscaping",
        "grass",
        "tree",
      ],
      painter: ["painter", "paint", "wall", "ceiling", "color", "brush"],
    };
  }

  processVoiceCommand(transcript, userId) {
    const normalizedText = transcript.toLowerCase().trim();

    const result = {
      userId,
      originalTranscript: transcript,
      processedAt: new Date(),
      extractedData: {
        service: this.extractService(normalizedText),
        urgency: this.extractUrgency(normalizedText),
        timePreference: this.extractTimePreference(normalizedText),
        datePreference: this.extractDatePreference(normalizedText),
        location: this.extractLocationHints(normalizedText),
      },
      confidence: 0,
      suggestions: [],
      autoBookingReady: false,
    };

    result.confidence = this.calculateConfidence(result.extractedData);
    result.suggestions = this.generateSuggestions(result.extractedData);
    result.autoBookingReady = this.isAutoBookingReady(
      result.extractedData,
      result.confidence
    );

    return result;
  }

  extractService(text) {
    for (const [service, keywords] of Object.entries(this.serviceKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return {
            type: service,
            confidence: this.calculateServiceConfidence(text, keywords),
            matchedKeyword: keyword,
          };
        }
      }
    }
    return null;
  }

  extractUrgency(text) {
    const urgentKeywords = [
      "urgent",
      "emergency",
      "asap",
      "immediately",
      "now",
      "quickly",
    ];
    const hasUrgency = urgentKeywords.some((keyword) => text.includes(keyword));

    return {
      isUrgent: hasUrgency,
      level: hasUrgency ? this.getUrgencyLevel(text) : "normal",
    };
  }

  extractTimePreference(text) {
    // Extract time patterns
    const timePatterns = [
      { pattern: /(\d{1,2})\s*(am|pm)/gi, type: "specific" },
      { pattern: /(\d{1,2}):(\d{2})\s*(am|pm)/gi, type: "specific" },
      { pattern: /morning/gi, type: "period", value: "morning" },
      { pattern: /afternoon/gi, type: "period", value: "afternoon" },
      { pattern: /evening/gi, type: "period", value: "evening" },
      { pattern: /night/gi, type: "period", value: "night" },
    ];

    for (const { pattern, type, value } of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          type,
          matched: match[0],
          value: value || match[0],
          confidence: 0.8,
        };
      }
    }

    return null;
  }

  extractDatePreference(text) {
    const datePatterns = [
      { pattern: /today/gi, type: "relative", days: 0, value: "today" },
      { pattern: /tomorrow/gi, type: "relative", days: 1, value: "tomorrow" },
      {
        pattern: /day after tomorrow/gi,
        type: "relative",
        days: 2,
        value: "day after tomorrow",
      },
      {
        pattern: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
        type: "weekday",
      },
      { pattern: /next week/gi, type: "relative", days: 7, value: "next week" },
      { pattern: /this week/gi, type: "relative", days: 3, value: "this week" },
    ];

    for (const { pattern, type, days, value } of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        let targetDate = null;

        if (type === "relative" && typeof days === "number") {
          targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + days);
        } else if (type === "weekday") {
          targetDate = this.getNextWeekday(match[0]);
        }

        return {
          type,
          matched: match[0],
          value: value || match[0],
          targetDate,
          confidence: 0.9,
        };
      }
    }

    return null;
  }

  extractLocationHints(text) {
    const locationKeywords = [
      "home",
      "house",
      "office",
      "workplace",
      "apartment",
    ];
    const foundKeywords = locationKeywords.filter((keyword) =>
      text.includes(keyword)
    );

    return foundKeywords.length > 0
      ? {
          hints: foundKeywords,
          confidence: 0.6,
        }
      : null;
  }

  calculateServiceConfidence(text, keywords) {
    const matchCount = keywords.filter((keyword) =>
      text.includes(keyword)
    ).length;
    return Math.min(0.3 + matchCount * 0.2, 1.0);
  }

  getUrgencyLevel(text) {
    if (text.includes("emergency")) return "emergency";
    if (text.includes("urgent") || text.includes("asap")) return "urgent";
    if (text.includes("quickly") || text.includes("soon")) return "high";
    return "normal";
  }

  calculateConfidence(extractedData) {
    let confidence = 0;

    if (extractedData.service) confidence += 0.4;
    if (extractedData.timePreference) confidence += 0.25;
    if (extractedData.datePreference) confidence += 0.25;
    if (extractedData.location) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  isAutoBookingReady(extractedData, confidence) {
    return (
      confidence >= 0.6 && extractedData.service && extractedData.datePreference
    );
  }

  generateSuggestions(extractedData) {
    const suggestions = [];

    if (!extractedData.service) {
      suggestions.push(
        "Please specify which service you need (e.g., electrician, plumber, cleaner)"
      );
    }

    if (!extractedData.datePreference) {
      suggestions.push(
        "When would you like to schedule the service? (e.g., today, tomorrow, Monday)"
      );
    }

    if (!extractedData.timePreference) {
      suggestions.push(
        "What time would work best? (e.g., 10 AM, morning, afternoon)"
      );
    }

    return suggestions;
  }

  getNextWeekday(dayName) {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const targetDayIndex = days.indexOf(dayName.toLowerCase());
    const today = new Date();
    const currentDayIndex = today.getDay();

    let daysUntilTarget = targetDayIndex - currentDayIndex;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate;
  }

  // Generate booking data from voice command
  generateBookingData(extractedData) {
    const bookingData = {
      service: extractedData.service?.type || "",
      serviceDisplay: extractedData.service?.type
        ? extractedData.service.type.charAt(0).toUpperCase() +
          extractedData.service.type.slice(1)
        : "",
      bookingDate: null,
      timeSlot: null,
      urgent: extractedData.urgency?.isUrgent || false,
      location: extractedData.location?.hints?.[0] || "home",
    };

    // Set booking date
    if (extractedData.datePreference?.targetDate) {
      bookingData.bookingDate = extractedData.datePreference.targetDate;
      bookingData.dateDisplay = extractedData.datePreference.value;
    }

    // Set time slot
    if (extractedData.timePreference) {
      let startHour = 9; // default
      let minutes = 0;

      if (extractedData.timePreference.type === "specific") {
        const timeMatch = extractedData.timePreference.matched.match(
          /(\d{1,2}):?(\d{2})?\s*(am|pm)?/i
        );
        if (timeMatch) {
          startHour = parseInt(timeMatch[1]);
          minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const period = timeMatch[3]?.toLowerCase();

          if (period === "pm" && startHour !== 12) startHour += 12;
          if (period === "am" && startHour === 12) startHour = 0;
        }
      } else if (extractedData.timePreference.value === "morning") {
        startHour = 9;
      } else if (extractedData.timePreference.value === "afternoon") {
        startHour = 14;
      } else if (extractedData.timePreference.value === "evening") {
        startHour = 18;
      }

      const endHour = startHour + 1;

      bookingData.timeSlot = {
        start: `${startHour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`,
        end: `${endHour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`,
      };

      bookingData.timeDisplay = this.formatTime(startHour, minutes);
    }

    return bookingData;
  }

  formatTime(hour, minutes) {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  }
}

const voiceProcessor = new VoiceBookingProcessor();

// Process voice command and potentially auto-book
router.post("/process-command", isAuthenticated, async (req, res) => {
  try {
    console.log("🎤 Processing voice command:", req.body);

    const { transcript, metadata, autoBook = false } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Transcript is required",
      });
    }

    // Process the voice command
    const result = voiceProcessor.processVoiceCommand(transcript, req.user.id);

    // Generate booking data if confidence is sufficient
    let bookingData = null;
    if (result.autoBookingReady) {
      bookingData = voiceProcessor.generateBookingData(result.extractedData);
    }

    // Auto-book if requested and confidence is high enough
    let autoBookingResult = null;
    if (autoBook && result.autoBookingReady && bookingData) {
      try {
        autoBookingResult = await processAutoBooking(req.user.id, bookingData);
      } catch (error) {
        console.error("❌ Auto-booking failed:", error);
        autoBookingResult = {
          success: false,
          error: error.message,
        };
      }
    }

    // Log the processing result
    console.log("✅ Voice command processed:", {
      userId: req.user.id,
      confidence: result.confidence,
      service: result.extractedData.service?.type,
      urgency: result.extractedData.urgency?.level,
      autoBookingReady: result.autoBookingReady,
      autoBooked: !!autoBookingResult?.success,
    });

    res.json({
      success: true,
      result,
      bookingData,
      autoBookingResult,
      message:
        result.confidence > 0.6
          ? autoBookingResult?.success
            ? "Voice booking processed successfully!"
            : "Command processed - ready for booking"
          : "Command partially understood - please provide more details",
    });
  } catch (error) {
    console.error("❌ Voice processing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process voice command",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Auto-booking helper function
async function processAutoBooking(userId, bookingData) {
  try {
    // Find available providers for the service
    const providers = await Provider.find({
      skills: { $in: [bookingData.service] },
      isActive: true,
    })
      .populate("userId", "name email phone")
      .limit(10);

    if (providers.length === 0) {
      throw new Error(
        `No providers available for ${bookingData.serviceDisplay}`
      );
    }

    // For auto-booking, select the first available provider
    // In a real app, you might want more sophisticated matching
    const selectedProvider = providers[0];

    // Create a booking request (without payment for now)
    const booking = new Booking({
      user: userId,
      provider: selectedProvider._id,
      service: bookingData.serviceDisplay,
      servicePrice: 500, // Default price - should be determined by service type
      bookingDate: bookingData.bookingDate || new Date(),
      timeSlot: bookingData.timeSlot || {
        start: "09:00",
        end: "10:00",
      },
      address: "Auto-booking location", // Should be from user profile
      contactPhone: "Auto-booking contact", // Should be from user profile
      specialInstructions: `Voice booking: ${
        bookingData.originalCommand || "Auto-booked via voice"
      }`,
      status: "pending", // Pending until payment
      bookingId: `VOICE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentDetails: {
        status: "pending",
        amount: 50000, // 500 * 100 (in paise)
      },
    });

    await booking.save();

    console.log("✅ Auto-booking created:", booking.bookingId);

    return {
      success: true,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        service: booking.service,
        provider: {
          name: selectedProvider.userId.name,
          rating: selectedProvider.rating,
        },
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        status: booking.status,
      },
      message: "Auto-booking created successfully",
    };
  } catch (error) {
    console.error("❌ Auto-booking error:", error);
    throw error;
  }
}

// Get available providers for a service (for voice booking)
router.post("/get-providers", isAuthenticated, async (req, res) => {
  try {
    const { service, location } = req.body;

    if (!service) {
      return res.status(400).json({
        success: false,
        message: "Service type is required",
      });
    }

    // Find providers for the service
    const providers = await Provider.find({
      skills: { $in: [service] },
      isActive: true,
    })
      .populate("userId", "name email phone")
      .select("skills rating location reviewCount isActive")
      .sort({ rating: -1, reviewCount: -1 })
      .limit(10);

    res.json({
      success: true,
      providers: providers.map((provider) => ({
        id: provider._id,
        name: provider.userId.name,
        skills: provider.skills,
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        location: provider.location,
      })),
      message: `Found ${providers.length} providers for ${service}`,
    });
  } catch (error) {
    console.error("❌ Get providers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get providers",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Voice booking history
router.get("/bookings", isAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get voice-initiated bookings
    const bookings = await Booking.find({
      user: req.user.id,
      bookingId: { $regex: /^VOICE-/ }, // Only voice bookings
    })
      .populate("provider", "skills rating")
      .populate({
        path: "provider",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalBookings = await Booking.countDocuments({
      user: req.user.id,
      bookingId: { $regex: /^VOICE-/ },
    });

    res.json({
      success: true,
      bookings: bookings.map((booking) => ({
        id: booking._id,
        bookingId: booking.bookingId,
        service: booking.service,
        servicePrice: booking.servicePrice,
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        status: booking.status,
        provider: booking.provider
          ? {
              name: booking.provider.userId?.name,
              rating: booking.provider.rating,
              skills: booking.provider.skills,
            }
          : null,
        createdAt: booking.createdAt,
        isVoiceBooking: true,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBookings,
        pages: Math.ceil(totalBookings / limit),
      },
      message: "Voice bookings retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Get voice bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get voice bookings",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Voice command validation endpoint
router.post("/validate-command", isAuthenticated, async (req, res) => {
  try {
    const { extractedData } = req.body;

    if (!extractedData) {
      return res.status(400).json({
        success: false,
        message: "Extracted data is required",
      });
    }

    // Validate the extracted data
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      autoBookingReady: false,
    };

    // Check service
    if (!extractedData.service) {
      validation.errors.push("Service type is required");
      validation.isValid = false;
    }

    // Check date
    if (!extractedData.datePreference) {
      validation.warnings.push("No date specified - will default to today");
    }

    // Check time
    if (!extractedData.timePreference) {
      validation.warnings.push("No time specified - please select a time slot");
    }

    // Check if ready for auto-booking
    validation.autoBookingReady = voiceProcessor.isAutoBookingReady(
      extractedData,
      voiceProcessor.calculateConfidence(extractedData)
    );

    res.json({
      success: true,
      validation,
      message: validation.isValid
        ? validation.autoBookingReady
          ? "Ready for auto-booking!"
          : "Voice command is valid but needs more details for auto-booking"
        : "Voice command has validation errors",
    });
  } catch (error) {
    console.error("❌ Voice validation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate voice command",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

module.exports = router;
