// Backend/src/routes/voiceRoutes.js
const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");

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
    };

    result.confidence = this.calculateConfidence(result.extractedData);
    result.suggestions = this.generateSuggestions(result.extractedData);

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
}

const voiceProcessor = new VoiceBookingProcessor();

// Process voice command
router.post("/process-command", isAuthenticated, async (req, res) => {
  try {
    console.log("🎤 Processing voice command:", req.body);

    const { transcript, metadata } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Transcript is required",
      });
    }

    // Process the voice command
    const result = voiceProcessor.processVoiceCommand(transcript, req.user.id);

    // Log the processing result
    console.log("✅ Voice command processed:", {
      userId: req.user.id,
      confidence: result.confidence,
      service: result.extractedData.service?.type,
      urgency: result.extractedData.urgency?.level,
    });

    res.json({
      success: true,
      result,
      message:
        result.confidence > 0.6
          ? "Command processed successfully"
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

// Get voice processing history for user
router.get("/history", isAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // In a real application, you might want to store voice commands in database
    // For now, we'll return a placeholder response

    res.json({
      success: true,
      history: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0,
      },
      message: "Voice history feature coming soon",
    });
  } catch (error) {
    console.error("❌ Get voice history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get voice history",
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

    res.json({
      success: true,
      validation,
      message: validation.isValid
        ? "Voice command is valid"
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
