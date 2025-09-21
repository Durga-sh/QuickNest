import axios from "axios";
class EnhancedVoiceBookingParser {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  }
  async parseVoiceCommandWithAI(voiceText) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${this.apiUrl}/voice/process-with-ai`,
        { transcript: voiceText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        return {
          success: true,
          parsed: response.data.data.parsed,
          suggestions: response.data.data.suggestions,
          canAutoBook: response.data.data.canAutoBook,
          confidence: response.data.data.parsed.confidence,
        };
      } else {
        throw new Error(
          response.data.message || "Failed to parse voice command"
        );
      }
    } catch (error) {
      console.error("AI Voice parsing error:", error);
      console.log("Falling back to local parsing...");
      return this.parseVoiceCommandLocally(voiceText);
    }
  }
  async autoBookWithAI(voiceText) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${this.apiUrl}/voice/process-with-ai`,
        {
          transcript: voiceText,
          autoBook: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success && response.data.data.autoBookingResult) {
        return {
          success: true,
          booking: response.data.data.autoBookingResult.booking,
          message: response.data.data.autoBookingResult.message,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Auto-booking failed",
          parsed: response.data.data?.parsed,
          suggestions: response.data.data?.suggestions,
        };
      }
    } catch (error) {
      console.error("AI Auto-booking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create booking"
      );
    }
  }
  /**
   * Local fallback parsing (existing functionality)
   */
  parseVoiceCommandLocally(transcript) {
    const serviceKeywords = {
      electrician: [
        "electrician",
        "electrical",
        "electric",
        "wiring",
        "electrical work",
      ],
      plumber: ["plumber", "plumbing", "pipe", "water", "leak", "drain"],
      cleaner: ["cleaner", "cleaning", "clean", "maid", "housekeeping"],
      carpenter: ["carpenter", "wood", "furniture", "repair", "cabinet"],
      mechanic: ["mechanic", "car", "vehicle", "auto", "bike", "motorcycle"],
      gardener: ["gardener", "garden", "lawn", "plant", "landscaping"],
      painter: ["painter", "paint", "wall", "ceiling", "color"],
    };
    const normalizedText = transcript.toLowerCase().trim();
    const result = {
      service: this.extractServiceLocally(normalizedText, serviceKeywords),
      date: this.extractDateLocally(normalizedText),
      time: this.extractTimeLocally(normalizedText),
      urgent: this.isUrgentLocally(normalizedText),
      confidence: 0,
      rawText: transcript,
      isLocalParsing: true,
    };
    result.confidence = this.calculateConfidenceLocally(result);
    return {
      success: true,
      parsed: result,
      suggestions: this.generateSuggestionsLocally(result),
      canAutoBook: result.confidence >= 0.6 && result.service && result.date,
      confidence: result.confidence,
    };
  }
  extractServiceLocally(text, serviceKeywords) {
    const serviceMapping = {
      plumber: "Plumbing",
      plumbing: "Plumbing",
      electrician: "Electrical Work",
      electrical: "Electrical Work",
      "electrical work": "Electrical Work",
      cleaner: "Cleaning",
      cleaning: "Cleaning",
      carpenter: "Carpentry",
      carpentry: "Carpentry",
      mechanic: "Mechanic",
      automotive: "Mechanic",
      gardener: "Gardening",
      gardening: "Gardening",
      landscaping: "Gardening",
      painter: "Painting",
      painting: "Painting",
    };
    for (const [service, keywords] of Object.entries(serviceKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return serviceMapping[service] || service;
        }
      }
    }
    return null;
  }
  extractDateLocally(text) {
    if (text.includes("today")) {
      return new Date();
    }
    if (text.includes("tomorrow")) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return null;
  }
  extractTimeLocally(text) {
    const timeMatch = text.match(/(\d{1,2}):?(\d{2})?\s*(a\.?m\.?|p\.?m\.?)/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      let minutes = parseInt(timeMatch[2] || "0");
      const period = timeMatch[3].toLowerCase().replace(/\./g, "");
      if (period.startsWith("p") && hour !== 12) hour += 12;
      if (period.startsWith("a") && hour === 12) hour = 0;
      return {
        start: `${hour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`,
        end: `${(hour + 1).toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`,
      };
    }
    return null;
  }
  isUrgentLocally(text) {
    const urgentKeywords = [
      "urgent",
      "emergency",
      "asap",
      "immediately",
      "now",
    ];
    return urgentKeywords.some((keyword) => text.includes(keyword));
  }
  calculateConfidenceLocally(result) {
    let confidence = 0;
    if (result.service) confidence += 0.4;
    if (result.date) confidence += 0.3;
    if (result.time) confidence += 0.3;
    return Math.min(confidence, 1.0);
  }
  generateSuggestionsLocally(result) {
    const suggestions = [];
    if (!result.service) {
      suggestions.push(
        "Please specify which service you need (e.g., plumber, electrician, cleaner)"
      );
    }
    if (!result.date) {
      suggestions.push("When would you like to schedule this service?");
    }
    if (!result.time) {
      suggestions.push("What time would work best for you?");
    }
    return suggestions;
  }
  /**
   * Generate booking data from parsed voice command
   */
  generateBookingData(parsed) {
    return {
      service: parsed.service,
      serviceDisplay: parsed.service
        ? parsed.service.charAt(0).toUpperCase() + parsed.service.slice(1)
        : null,
      bookingDate: parsed.date,
      dateDisplay: this.formatDate(parsed.date),
      timeSlot: parsed.time,
      timeDisplay: this.formatTimeSlot(parsed.time),
      urgent: parsed.urgent,
      confidence: parsed.confidence,
      specialInstructions:
        parsed.specialInstructions ||
        `Voice booking: ${parsed.rawText || "Voice command"}`,
      isVoiceBooking: true,
    };
  }
  /**
   * Format date for display
   */
  formatDate(date) {
    if (!date) return null;
    const today = new Date();
    const targetDate = new Date(date);
    if (targetDate.toDateString() === today.toDateString()) {
      return "Today";
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (targetDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return targetDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  /**
   * Format time slot for display
   */
  formatTimeSlot(timeSlot) {
    if (!timeSlot || !timeSlot.start) return null;
    const formatTime = (time) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    };
    return formatTime(timeSlot.start);
  }
  /**
   * Get voice booking suggestions
   */
  getSuggestions(parsed) {
    return parsed.suggestions || this.generateSuggestionsLocally(parsed);
  }
}
export default new EnhancedVoiceBookingParser();
