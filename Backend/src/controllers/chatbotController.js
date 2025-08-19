
const generateResponse = (message, context = {}) => {
  const lowerMessage = message.toLowerCase().trim();

  // Service-related questions
  if (
    lowerMessage.includes("service") ||
    lowerMessage.includes("what do you offer")
  ) {
    return {
      text: "QuickNest offers a wide range of professional services including:\n• Plumbing & Electrical work\n• Beauty & Salon services\n• Home Cleaning\n• Painting services\n• Auto Repair\n• And many more!\n\nWould you like to book a specific service?",
      suggestions: [
        "Book Plumbing",
        "Beauty Services",
        "Home Cleaning",
        "View All Services",
      ],
    };
  }

  // Booking process
  if (
    lowerMessage.includes("book") ||
    lowerMessage.includes("appointment") ||
    lowerMessage.includes("schedule")
  ) {
    return {
      text: "Booking with QuickNest is super easy! Here's how:\n\n1. Choose your service category\n2. Select a verified professional\n3. Pick your preferred time slot\n4. Confirm booking with secure payment\n5. Track your service professional in real-time\n\nReady to book?",
      suggestions: ["Start Booking", "View Services", "How much does it cost?"],
    };
  }

  // Pricing questions
  if (
    lowerMessage.includes("price") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("fee") ||
    lowerMessage.includes("charge")
  ) {
    return {
      text: "Our pricing varies by service type and location. Here's what makes our pricing fair:\n\n✓ Transparent upfront costs\n✓ No hidden fees\n✓ Competitive local rates\n✓ Secure payment options\n\nFor exact pricing, please select your service and location on our booking page.",
      suggestions: ["View Services", "Book Now", "Payment Options"],
    };
  }

  // Safety and verification
  if (
    lowerMessage.includes("safe") ||
    lowerMessage.includes("verify") ||
    lowerMessage.includes("trust") ||
    lowerMessage.includes("background check")
  ) {
    return {
      text: "Your safety is our top priority! All QuickNest professionals are:\n\n🔐 Background verified\n⭐ Rated by real customers\n🛡️ Insured and bonded\n📱 Trackable in real-time\n💬 Available for direct communication\n\nWe also offer 24/7 customer support for peace of mind.",
      suggestions: ["Learn More", "Book Service", "Customer Support"],
    };
  }

  // Location and availability
  if (
    lowerMessage.includes("location") ||
    lowerMessage.includes("area") ||
    lowerMessage.includes("available") ||
    lowerMessage.includes("operate")
  ) {
    return {
      text: "QuickNest operates in major cities and surrounding areas. We're constantly expanding our network!\n\n📍 Currently serving 50+ cities\n⚡ Same-day service available\n🕐 Flexible scheduling options\n\nEnter your location during booking to see available professionals in your area.",
      suggestions: [
        "Check Availability",
        "Book Service",
        "View Coverage Areas",
      ],
    };
  }

  // App and platform
  if (
    lowerMessage.includes("app") ||
    lowerMessage.includes("mobile") ||
    lowerMessage.includes("download")
  ) {
    return {
      text: "Great news! You can access QuickNest through:\n\n📱 Our responsive web platform (works on any device)\n💻 Desktop browser\n📲 Mobile-optimized interface\n\nNo app download required - just visit our website and start booking instantly!",
      suggestions: ["Start Booking", "Learn More", "View Services"],
    };
  }

  // Payment questions
  if (
    lowerMessage.includes("payment") ||
    lowerMessage.includes("pay") ||
    lowerMessage.includes("card") ||
    lowerMessage.includes("cash")
  ) {
    return {
      text: "We accept multiple secure payment methods:\n\n💳 Credit/Debit Cards\n🏦 Bank Transfers\n💰 Digital Wallets\n💵 Cash payments (for select services)\n\nAll online payments are secured with industry-standard encryption.",
      suggestions: ["Book Service", "Learn About Security", "View Services"],
    };
  }

  // Support and contact
  if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("support") ||
    lowerMessage.includes("contact") ||
    lowerMessage.includes("problem")
  ) {
    return {
      text: "I'm here to help! For additional support:\n\n📞 24/7 Customer Support\n💬 Live chat assistance\n📧 Email support team\n❓ Comprehensive FAQ section\n\nWhat specific question can I help you with today?",
      suggestions: [
        "Booking Help",
        "Technical Issues",
        "Service Questions",
        "Account Help",
      ],
    };
  }

  // Greetings
  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey") ||
    lowerMessage === "start"
  ) {
    return {
      text: "Hello! 👋 Welcome to QuickNest - your trusted platform for local professional services!\n\nI'm here to help you find the perfect service professional. Whether you need plumbing, electrical work, beauty services, or home cleaning - we've got verified experts ready to help.\n\nWhat can I assist you with today?",
      suggestions: [
        "View Services",
        "How it Works",
        "Book Service",
        "Pricing Info",
      ],
    };
  }

  // How it works
  if (
    lowerMessage.includes("how") ||
    lowerMessage.includes("work") ||
    lowerMessage.includes("process")
  ) {
    return {
      text: "Here's how QuickNest works:\n\n1️⃣ Browse & Choose: Select from our verified professionals\n2️⃣ Book Instantly: Pick your time and confirm booking\n3️⃣ Track in Real-time: See your professional's location\n4️⃣ Get Service: Enjoy professional service at your location\n5️⃣ Rate & Review: Help others by sharing your experience\n\nIt's that simple! Ready to get started?",
      suggestions: ["Start Booking", "View Services", "See Professionals"],
    };
  }

  // Emergency services
  if (
    lowerMessage.includes("emergency") ||
    lowerMessage.includes("urgent") ||
    lowerMessage.includes("asap") ||
    lowerMessage.includes("immediate")
  ) {
    return {
      text: "Need urgent service? We've got you covered!\n\n🚨 Emergency services available 24/7\n⚡ Same-day booking for urgent needs\n📍 Priority matching with nearby professionals\n📱 Instant confirmation and tracking\n\nFor immediate assistance, use our 'Emergency Service' booking option.",
      suggestions: [
        "Emergency Booking",
        "Call Support",
        "Find Nearby",
        "Urgent Services",
      ],
    };
  }

  // Default response for unrecognized queries
  return {
    text: "I'd be happy to help you with that! QuickNest connects you with verified local professionals for all your service needs.\n\nHere are some popular topics I can help with:\n• Service booking process\n• Available services\n• Pricing information\n• Safety and verification\n• Payment options\n\nWhat would you like to know more about?",
    suggestions: ["View Services", "How to Book", "Pricing", "Safety Info"],
  };
};

exports.getChatResponse = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = generateResponse(message, context);

    res.json({
      success: true,
      response: response.text,
      suggestions: response.suggestions || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      success: false,
      message:
        "I'm having trouble processing your request right now. Please try again in a moment.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

exports.getChatSuggestions = async (req, res) => {
  try {
    const suggestions = [
      "What services do you offer?",
      "How do I book a service?",
      "How much does it cost?",
      "Are your professionals verified?",
      "Do you offer emergency services?",
      "What payment methods do you accept?",
      "How does the tracking work?",
      "I need help with booking",
    ];

    res.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load suggestions",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
