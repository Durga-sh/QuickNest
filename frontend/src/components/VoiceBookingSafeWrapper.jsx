import React, { useState, useEffect } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
const VoiceBookingSafeWrapper = ({
  onBookingParsed,
  variant = "primary",
  size = "medium",
  showLabel = true,
  className = "",
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [recognition, setRecognition] = useState(null);
  useEffect(() => {
    const checkSupport = () => {
      try {
        const hasRecognition = !!(
          window.SpeechRecognition || window.webkitSpeechRecognition
        );
        const hasSynthesis = !!window.speechSynthesis;
        return hasRecognition && hasSynthesis;
      } catch (error) {
        console.error("Error checking voice support:", error);
        return false;
      }
    };
    const supported = checkSupport();
    setIsSupported(supported);
    if (supported) {
      try {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";
        recognitionInstance.onstart = () => {
          setIsListening(true);
          setError("");
        };
        recognitionInstance.onresult = (event) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript);
            processVoiceCommand(finalTranscript);
          }
        };
        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setError(`Voice recognition error: ${event.error}`);
          setIsListening(false);
        };
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        setRecognition(recognitionInstance);
      } catch (error) {
        console.error("Failed to initialize speech recognition:", error);
        setIsSupported(false);
      }
    }
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (error) {
          console.error("Error stopping recognition:", error);
        }
      }
    };
  }, []);
  const processVoiceCommand = (command) => {
    console.log("Processing voice command:", command);
    const normalizedText = command.toLowerCase().trim();
    const serviceKeywords = {
      electrician: ["electrician", "electrical", "electric"],
      plumber: ["plumber", "plumbing", "pipe", "water"],
      cleaner: ["cleaner", "cleaning", "clean", "maid"],
      carpenter: ["carpenter", "wood", "furniture"],
      mechanic: ["mechanic", "car", "vehicle", "auto"],
      painter: ["painter", "paint", "wall"],
    };
    let service = "";
    for (const [serviceType, keywords] of Object.entries(serviceKeywords)) {
      if (keywords.some((keyword) => normalizedText.includes(keyword))) {
        service = serviceType;
        break;
      }
    }
    let date = new Date();
    if (normalizedText.includes("tomorrow")) {
      date.setDate(date.getDate() + 1);
    }
    let timeSlot = { start: "09:00", end: "10:00" };
    const timeMatch = normalizedText.match(/(\d{1,2})\s*(am|pm)/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const period = timeMatch[2].toLowerCase();
      if (period === "pm" && hour !== 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;
      timeSlot = {
        start: `${hour.toString().padStart(2, "0")}:00`,
        end: `${(hour + 1).toString().padStart(2, "0")}:00`,
      };
    }
    const bookingData = {
      service,
      serviceDisplay: service
        ? service.charAt(0).toUpperCase() + service.slice(1)
        : "",
      bookingDate: date,
      timeSlot,
      originalCommand: command,
      confidence: service ? 0.8 : 0.3,
    };
    if (service && onBookingParsed) {
      onBookingParsed(bookingData);
      speak(
        `I'll help you book a ${service}. Redirecting you to the services page.`
      );
    } else {
      setError(
        "Please specify a service type (electrician, plumber, cleaner, etc.)"
      );
      speak(
        "Please specify what service you need, like electrician or plumber."
      );
    }
  };
  const speak = (text) => {
    try {
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Error in speech synthesis:", error);
    }
  };
  const startListening = () => {
    if (!recognition) return;
    try {
      setError("");
      setTranscript("");
      recognition.start();
      speak("I'm listening. Tell me what service you need and when.");
    } catch (error) {
      console.error("Error starting recognition:", error);
      setError("Failed to start voice recognition");
    }
  };
  const stopListening = () => {
    if (!recognition) return;
    try {
      recognition.stop();
    } catch (error) {
      console.error("Error stopping recognition:", error);
    }
  };
  const getButtonStyles = () => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const sizeStyles = {
      small: "px-3 py-2 text-sm",
      medium: "px-4 py-3 text-sm",
      large: "px-6 py-4 text-base",
    };
    const variantStyles = {
      primary: isListening
        ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg animate-pulse"
        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white focus:ring-purple-500 shadow-lg hover:shadow-xl",
      secondary: isListening
        ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
        : "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300",
    };
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };
  if (!isSupported) {
    return (
      <button
        disabled
        className={getButtonStyles()}
        title="Voice recognition not supported in this browser"
      >
        <MicOff className="w-5 h-5" />
        {showLabel && size !== "small" && (
          <span className="ml-2">Voice Not Supported</span>
        )}
      </button>
    );
  }
  return (
    <div className="relative">
      <button
        onClick={isListening ? stopListening : startListening}
        className={getButtonStyles()}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
        {showLabel && size !== "small" && (
          <span className="ml-2">
            {isListening ? "Stop Listening" : "Voice Booking"}
          </span>
        )}
      </button>
      {}
      {(isListening || transcript || error) && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 max-w-sm">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            {isListening && (
              <div className="flex items-center space-x-2 text-green-600 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Listening...</span>
              </div>
            )}
            {transcript && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">You said:</p>
                <p className="text-sm text-gray-800 italic">"{transcript}"</p>
              </div>
            )}
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <button
              onClick={() => {
                setTranscript("");
                setError("");
                stopListening();
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export const VoiceBookingSafePresets = {
  FloatingButton: (props) => (
    <VoiceBookingSafeWrapper
      variant="primary"
      size="large"
      showLabel={false}
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl hover:shadow-3xl z-40"
      {...props}
    />
  ),
};
export default VoiceBookingSafeWrapper;
