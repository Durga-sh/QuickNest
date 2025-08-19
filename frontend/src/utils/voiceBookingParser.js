// frontend/src/utils/voiceBookingParser.js
class VoiceBookingParser {
  constructor() {
    // Service keywords mapping
    this.serviceKeywords = {
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

    // Time keywords
    this.timeKeywords = {
      morning: ["morning", "am", "early"],
      afternoon: ["afternoon", "noon", "pm"],
      evening: ["evening", "night"],
      urgent: ["urgent", "emergency", "asap", "immediately", "now"],
    };

    // Date keywords
    this.dateKeywords = {
      today: ["today", "now"],
      tomorrow: ["tomorrow"],
      thisWeek: ["this week", "week"],
      nextWeek: ["next week"],
    };
  }

  parseVoiceCommand(transcript) {
    const normalizedText = transcript.toLowerCase().trim();
    console.log("Parsing voice command:", normalizedText);

    const result = {
      service: this.extractService(normalizedText),
      date: this.extractDate(normalizedText),
      time: this.extractTime(normalizedText),
      urgent: this.isUrgent(normalizedText),
      confidence: 0,
      rawText: transcript,
    };

    // Calculate confidence based on extracted information
    result.confidence = this.calculateConfidence(result, normalizedText);

    return result;
  }

  extractService(text) {
    for (const [service, keywords] of Object.entries(this.serviceKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return {
            type: service,
            keyword: keyword,
            display: this.capitalizeFirst(service),
          };
        }
      }
    }
    return null;
  }

  extractDate(text) {
    // Handle specific dates
    if (this.containsAny(text, this.dateKeywords.today)) {
      return {
        type: "today",
        date: new Date(),
        display: "Today",
      };
    }

    if (this.containsAny(text, this.dateKeywords.tomorrow)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        type: "tomorrow",
        date: tomorrow,
        display: "Tomorrow",
      };
    }

    // Handle day names (Monday, Tuesday, etc.)
    const dayMatch = text.match(
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
    );
    if (dayMatch) {
      const dayName = dayMatch[1];
      const targetDate = this.getNextDateForDay(dayName);
      return {
        type: "specific_day",
        date: targetDate,
        display: this.capitalizeFirst(dayName),
        dayName: dayName,
      };
    }

    // Handle "next week"
    if (this.containsAny(text, this.dateKeywords.nextWeek)) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return {
        type: "next_week",
        date: nextWeek,
        display: "Next Week",
      };
    }

    return null;
  }

  extractTime(text) {
    // Extract time patterns like "10 AM", "3 PM", "at 5"
    const timePatterns = [
      /(\d{1,2})\s*(am|pm)/i,
      /(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /at\s*(\d{1,2})/i,
      /(\d{1,2})\s*o'?clock/i,
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        let hour = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3] ? match[3].toLowerCase() : null;

        // Convert to 24-hour format
        if (period === "pm" && hour !== 12) {
          hour += 12;
        } else if (period === "am" && hour === 12) {
          hour = 0;
        }

        return {
          hour: hour,
          minutes: minutes,
          display: this.formatTime(hour, minutes),
          period: period,
          raw: match[0],
        };
      }
    }

    // Handle general time periods
    if (this.containsAny(text, this.timeKeywords.morning)) {
      return {
        period: "morning",
        hour: 9, // Default morning time
        minutes: 0,
        display: "Morning (9:00 AM)",
      };
    }

    if (this.containsAny(text, this.timeKeywords.afternoon)) {
      return {
        period: "afternoon",
        hour: 14, // 2 PM
        minutes: 0,
        display: "Afternoon (2:00 PM)",
      };
    }

    if (this.containsAny(text, this.timeKeywords.evening)) {
      return {
        period: "evening",
        hour: 18, // 6 PM
        minutes: 0,
        display: "Evening (6:00 PM)",
      };
    }

    return null;
  }

  isUrgent(text) {
    return this.containsAny(text, this.timeKeywords.urgent);
  }

  calculateConfidence(result, text) {
    let confidence = 0;

    if (result.service) confidence += 0.4;
    if (result.date) confidence += 0.3;
    if (result.time) confidence += 0.3;

    // Bonus for booking-related keywords
    const bookingKeywords = [
      "book",
      "schedule",
      "appointment",
      "hire",
      "need",
      "want",
    ];
    if (this.containsAny(text, bookingKeywords)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  containsAny(text, keywords) {
    return keywords.some((keyword) => text.includes(keyword));
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  formatTime(hour, minutes) {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  }

  getNextDateForDay(dayName) {
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
      daysUntilTarget += 7; // Next occurrence of this day
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate;
  }

  generateBookingData(parsedCommand) {
    const bookingData = {
      service: parsedCommand.service?.type || "",
      serviceDisplay: parsedCommand.service?.display || "",
      bookingDate: null,
      timeSlot: null,
      urgent: parsedCommand.urgent,
      confidence: parsedCommand.confidence,
      originalCommand: parsedCommand.rawText,
    };

    // Set booking date
    if (parsedCommand.date) {
      bookingData.bookingDate = parsedCommand.date.date;
      bookingData.dateDisplay = parsedCommand.date.display;
    }

    // Set time slot
    if (parsedCommand.time) {
      const startHour = parsedCommand.time.hour;
      const endHour = startHour + 1; // Default 1-hour slot

      bookingData.timeSlot = {
        start: `${startHour
          .toString()
          .padStart(2, "0")}:${parsedCommand.time.minutes
          .toString()
          .padStart(2, "0")}`,
        end: `${endHour
          .toString()
          .padStart(2, "0")}:${parsedCommand.time.minutes
          .toString()
          .padStart(2, "0")}`,
      };
      bookingData.timeDisplay = parsedCommand.time.display;
    }

    return bookingData;
  }

  // Helper method to suggest improvements for low confidence commands
  getSuggestions(parsedCommand) {
    const suggestions = [];

    if (!parsedCommand.service) {
      suggestions.push(
        "Try mentioning a specific service like 'electrician', 'plumber', or 'cleaner'"
      );
    }

    if (!parsedCommand.date) {
      suggestions.push(
        "Specify when you need the service, like 'today', 'tomorrow', or 'Monday'"
      );
    }

    if (!parsedCommand.time) {
      suggestions.push(
        "Include a time, like '10 AM', 'morning', or 'afternoon'"
      );
    }

    return suggestions;
  }
}

export default new VoiceBookingParser();
