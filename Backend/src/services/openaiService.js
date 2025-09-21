const OpenAI = require("openai");
class OpenAIService {
  constructor() {
    this.isOpenAIAvailable = !!process.env.OPENAI_API_KEY;
    if (this.isOpenAIAvailable) {
      try {
        this.client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log("OpenAI service initialized");
      } catch (error) {
        console.error("Failed to initialize OpenAI:", error);
        this.isOpenAIAvailable = false;
      }
    } else {
      console.warn("OpenAI API key not found, using fallback parsing");
    }
  }
  async parseVoiceBooking(voiceText) {
    if (this.isOpenAIAvailable) {
      try {
        return await this.parseWithOpenAI(voiceText);
      } catch (error) {
        console.log("OpenAI quota exceeded, using fallback parsing");
        return this.parseWithFallback(voiceText);
      }
    } else {
      return this.parseWithFallback(voiceText);
    }
  }
  async parseWithOpenAI(voiceText) {
    const prompt = this.createBookingParsePrompt(voiceText);
    const response = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts booking information from voice commands. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });
    const result = JSON.parse(response.choices[0].message.content);
    return this.validateAndEnhanceBookingData(result, voiceText);
  }
  parseWithFallback(voiceText) {
    const normalizedText = voiceText.toLowerCase().trim();
    const serviceMatch = this.extractServiceFallback(normalizedText);
    const dateMatch = this.extractDateFallback(normalizedText);
    const timeMatch = this.extractTimeFallback(normalizedText);
    return {
      service: serviceMatch,
      date: dateMatch,
      time: timeMatch,
      urgent:
        normalizedText.includes("urgent") ||
        normalizedText.includes("emergency"),
      confidence: this.calculateFallbackConfidence(
        serviceMatch,
        dateMatch,
        timeMatch
      ),
      location: null,
      specialInstructions: `Voice command: ${voiceText}`,
      estimatedDuration: null,
      rawText: voiceText,
      method: "fallback",
    };
  }
  extractServiceFallback(text) {
    const serviceKeywords = {
      plumber: ["plumber", "plumbing", "pipe", "water", "leak", "drain"],
      electrician: ["electrician", "electrical", "electric", "wiring", "power"],
      cleaner: ["cleaner", "cleaning", "clean", "maid"],
      carpenter: ["carpenter", "wood", "furniture"],
      mechanic: ["mechanic", "car", "vehicle", "auto"],
      gardener: ["gardener", "garden", "lawn"],
      painter: ["painter", "paint", "wall"],
    };
    const serviceMapping = {
      plumber: "Plumbing",
      electrician: "Electrical Work",
      cleaner: "Cleaning",
      carpenter: "Carpentry",
      mechanic: "Mechanic",
      gardener: "Gardening",
      painter: "Painting",
    };
    for (const [service, keywords] of Object.entries(serviceKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return serviceMapping[service] || service;
      }
    }
    return null;
  }
  extractDateFallback(text) {
    if (text.includes("today")) {
      return new Date();
    }
    if (text.includes("tomorrow")) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  extractTimeFallback(text) {
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)/gi, // 10:00 a.m., 10:00 AM
      /(\d{1,2})\s*(a\.?m\.?|p\.?m\.?)/gi, // 10am, 10 AM
      /(\d{1,2}):(\d{2})/gi, // 10:00 (24-hour assumed)
    ];
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        const fullMatch = match[0];
        const timeMatch = fullMatch.match(
          /(\d{1,2}):?(\d{0,2})\s*(a\.?m\.?|p\.?m\.?)?/i
        );
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          let minutes = parseInt(timeMatch[2] || "0");
          const period = timeMatch[3]?.toLowerCase().replace(/\./g, ""); // Remove dots
          if (period === "pm" && hours !== 12) hours += 12;
          if (period === "am" && hours === 12) hours = 0;
          return {
            start: `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}`,
            end: `${(hours + 1).toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}`,
          };
        }
      }
    }
    return { start: "10:00", end: "11:00" };
  }
  calculateFallbackConfidence(service, date, time) {
    let confidence = 0;
    if (service) confidence += 0.4;
    if (date) confidence += 0.3;
    if (time) confidence += 0.3;
    return confidence;
  }
  createBookingParsePrompt(voiceText) {
    return `
Extract booking information from this voice command: "${voiceText}"
Please extract and format the following information as JSON:
{
  "service": "service_type",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "urgent": boolean,
  "confidence": number (0-1),
  "location": "if mentioned",
  "specialInstructions": "any special requirements",
  "estimatedDuration": "if mentioned"
}
Service types available:
- electrician
- plumber  
- cleaner
- carpenter
- mechanic
- gardener
- painter
Date parsing rules:
- "today" = current date
- "tomorrow" = next day
- "next week" = 7 days from now
- Specific dates like "Monday", "December 5th", etc.
Time parsing rules:
- Convert to 24-hour format
- Default to business hours (9 AM - 6 PM) if not specified
- "morning" = 9:00, "afternoon" = 14:00, "evening" = 18:00
Confidence calculation:
- 1.0: All required fields (service, date, time) clearly specified
- 0.8: Service and date clear, time inferred
- 0.6: Service clear, date/time partially clear
- 0.4: Service mentioned but date/time unclear
- 0.2: Partial service match only
Examples:
"Book a plumber tomorrow at 10am" -> service: "plumber", date: "tomorrow", time: "10:00", confidence: 1.0
"I need an electrician" -> service: "electrician", confidence: 0.4
"Schedule cleaning for next Monday morning" -> service: "cleaner", date: "next Monday", time: "09:00", confidence: 0.9
Current date/time context: ${new Date().toISOString()}
`;
  }
  /**
   * Validate and enhance the parsed booking data
   * @param {Object} parsedData
   * @param {string} rawText
   * @returns {Object}
   */
  validateAndEnhanceBookingData(parsedData, rawText = "") {
    const enhanced = {
      service: parsedData.service?.toLowerCase() || null,
      date: this.parseDateString(parsedData.date),
      time: this.parseTimeString(parsedData.time),
      urgent: parsedData.urgent || false,
      confidence: Math.max(0, Math.min(1, parsedData.confidence || 0)),
      location: parsedData.location || null,
      specialInstructions: parsedData.specialInstructions || "",
      estimatedDuration: parsedData.estimatedDuration || null,
      rawText: rawText || parsedData.rawText || "",
    };
    enhanced.confidence = this.calculateActualConfidence(enhanced);
    return enhanced;
  }
  /**
   * Parse date string to Date object
   * @param {string} dateStr
   * @returns {Date|null}
   */
  parseDateString(dateStr) {
    if (!dateStr) return null;
    const today = new Date();
    const lowerDate = dateStr.toLowerCase();
    if (lowerDate === "today") {
      return new Date(today);
    }
    if (lowerDate === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    if (lowerDate.includes("next week")) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    try {
      const parsed = new Date(dateStr);
      return !isNaN(parsed.getTime()) ? parsed : null;
    } catch {
      return null;
    }
  }
  /**
   * Parse time string to time object
   * @param {string} timeStr
   * @returns {Object|null}
   */
  parseTimeString(timeStr) {
    if (!timeStr) return null;
    try {
      const timeRegex = /(\d{1,2}):?(\d{0,2})\s*(am|pm)?/i;
      const match = timeStr.match(timeRegex);
      if (match) {
        let hours = parseInt(match[1]);
        let minutes = parseInt(match[2] || "0");
        const period = match[3]?.toLowerCase();
        if (period === "pm" && hours !== 12) {
          hours += 12;
        } else if (period === "am" && hours === 12) {
          hours = 0;
        }
        return {
          start: `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`,
          end: `${(hours + 1).toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`,
        };
      }
    } catch (error) {
      console.error("Time parsing error:", error);
    }
    return null;
  }
  /**
   * Calculate confidence based on extracted data quality
   * @param {Object} data
   * @returns {number}
   */
  calculateActualConfidence(data) {
    let score = 0;
    if (data.service) score += 0.4;
    if (data.date) score += 0.3;
    if (data.time) score += 0.3;
    return Math.max(0, Math.min(1, score));
  }
  /**
   * Generate suggestions for incomplete voice commands
   * @param {Object} parsedData
   * @returns {Array}
   */
  generateSuggestions(parsedData) {
    const suggestions = [];
    if (!parsedData.service) {
      suggestions.push(
        "Please specify which service you need (e.g., plumber, electrician, cleaner)"
      );
    }
    if (!parsedData.date) {
      suggestions.push("When would you like to schedule this service?");
    }
    if (!parsedData.time) {
      suggestions.push("What time would work best for you?");
    }
    if (parsedData.confidence < 0.6) {
      suggestions.push(
        "Could you please be more specific about your booking requirements?"
      );
    }
    return suggestions;
  }
}
module.exports = new OpenAIService();
