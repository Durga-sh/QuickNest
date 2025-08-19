import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import voiceAssistantService from "../services/voiceAssistantService";
import voiceBookingParser from "../utils/voiceBookingParser";

const VoiceBookingComponent = ({ onBookingParsed, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedBooking, setParsedBooking] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Check if voice features are supported
    if (!voiceAssistantService.isSupported()) {
      setError(
        "Voice recognition is not supported in your browser. Please use Chrome or Firefox."
      );
      return;
    }

    // Set up voice assistant callbacks
    voiceAssistantService.setCallbacks({
      onResult: handleVoiceResult,
      onError: handleVoiceError,
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
    });

    return () => {
      voiceAssistantService.stopListening();
    };
  }, []);

  const handleVoiceResult = (finalTranscript, interimTranscript) => {
    setTranscript(finalTranscript || interimTranscript);

    if (finalTranscript) {
      setIsProcessing(true);
      processVoiceCommand(finalTranscript);
    }
  };

  const handleVoiceError = (error) => {
    setError(`Voice recognition error: ${error}`);
    setIsListening(false);
  };

  const processVoiceCommand = (command) => {
    try {
      const parsed = voiceBookingParser.parseVoiceCommand(command);
      const bookingData = voiceBookingParser.generateBookingData(parsed);

      setParsedBooking(bookingData);
      if (parsed.confidence < 0.6) {
        const suggestions = voiceBookingParser.getSuggestions(parsed);
        setSuggestions(suggestions);
        speakResponse(
          `I understood some of your request, but could you please be more specific? ${
            suggestions[0] || ""
          }`
        );
      } else {
        setSuggestions([]);
        // Immediately book the service if confidence is high
        if (onBookingParsed) {
          onBookingParsed(bookingData);
          speakResponse("Great! I'll help you complete the booking.");
        }
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      setError("Failed to process voice command");
      speakResponse(
        "Sorry, I couldn't understand your request. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Removed generateConfirmationResponse, not needed

  const speakResponse = (text) => {
    voiceAssistantService.speak(text, {
      rate: 0.9,
      pitch: 1.1,
      volume: 0.8,
    });
  };

  const startListening = () => {
    setError("");
    setTranscript("");
    setParsedBooking(null);
    setSuggestions([]);

    const started = voiceAssistantService.startListening();
    if (!started) {
      setError("Failed to start voice recognition");
    } else {
      speakResponse(
        "I'm listening. Please tell me what service you need and when."
      );
    }
  };

  const stopListening = () => {
    voiceAssistantService.stopListening();
  };

  // Removed confirmBooking, not needed

  const tryAgain = () => {
    setTranscript("");
    setParsedBooking(null);
    setSuggestions([]);
    setError("");
    startListening();
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Voice Booking Assistant
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Voice Status */}
        <div className="text-center mb-6">
          {isListening && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Listening...</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">You said:</p>
            <p className="text-gray-800 italic">"{transcript}"</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm font-medium mb-2">
              Suggestions:
            </p>
            <ul className="text-yellow-700 text-sm space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Parsed Booking Display */}
        {parsedBooking && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">Booking Details</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">
                  {parsedBooking.serviceDisplay || "Not specified"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {parsedBooking.bookingDate
                    ? formatDate(parsedBooking.bookingDate)
                    : "Not specified"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">
                  {parsedBooking.timeDisplay || "Not specified"}
                </span>
              </div>

              {parsedBooking.urgent && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className="font-medium text-red-600">Urgent</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Confidence:</span>
                <span className="font-medium">
                  {Math.round(parsedBooking.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          {!isListening && !parsedBooking && (
            <button
              onClick={startListening}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mic className="w-5 h-5" />
              <span>Start Voice Booking</span>
            </button>
          )}

          {isListening && (
            <button
              onClick={stopListening}
              className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              <MicOff className="w-5 h-5" />
              <span>Stop Listening</span>
            </button>
          )}

          {/* No confirmation needed, booking is auto-submitted if confidence is high */}

          {parsedBooking && parsedBooking.confidence < 0.6 && (
            <button
              onClick={tryAgain}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Please Try Again
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-xs">
            <Volume2 className="w-4 h-4 inline mr-1" />
            Try saying: "Book an electrician tomorrow at 10 AM" or "I need a
            plumber today morning"
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceBookingComponent;
