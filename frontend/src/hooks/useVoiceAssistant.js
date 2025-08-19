// frontend/src/hooks/useVoiceAssistant.js
import { useState, useEffect, useCallback } from "react";
import voiceAssistantService from "../services/voiceAssistantService";
import voiceBookingParser from "../utils/voiceBookingParser";

const useVoiceAssistant = (options = {}) => {
  const {
    autoStart = false,
    onResult = null,
    onError = null,
    confidenceThreshold = 0.6,
    enableFeedback = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedBooking, setParsedBooking] = useState(null);
  const [error, setError] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if voice features are supported
    setIsSupported(voiceAssistantService.isSupported());

    if (voiceAssistantService.isSupported()) {
      // Set up voice assistant callbacks
      voiceAssistantService.setCallbacks({
        onResult: handleVoiceResult,
        onError: handleVoiceError,
        onStart: () => setIsListening(true),
        onEnd: () => setIsListening(false),
      });

      // Auto-start if requested
      if (autoStart) {
        startListening();
      }
    }

    return () => {
      if (voiceAssistantService.isSupported()) {
        voiceAssistantService.stopListening();
      }
    };
  }, [autoStart]);

  const handleVoiceResult = useCallback(
    (finalTranscript, interimTranscript) => {
      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      if (finalTranscript) {
        setIsProcessing(true);
        processVoiceCommand(finalTranscript);
      }
    },
    []
  );

  const handleVoiceError = useCallback(
    (error) => {
      const errorMessage = `Voice recognition error: ${error}`;
      setError(errorMessage);
      setIsListening(false);
      setIsProcessing(false);

      if (onError) {
        onError(errorMessage);
      }
    },
    [onError]
  );

  const processVoiceCommand = useCallback(
    (command) => {
      try {
        const parsed = voiceBookingParser.parseVoiceCommand(command);
        const bookingData = voiceBookingParser.generateBookingData(parsed);

        setParsedBooking(bookingData);
        setConfidence(parsed.confidence);

        if (parsed.confidence < confidenceThreshold) {
          const commandSuggestions = voiceBookingParser.getSuggestions(parsed);
          setSuggestions(commandSuggestions);

          if (enableFeedback) {
            const feedbackMessage = `I understood some of your request, but could you please be more specific? ${
              commandSuggestions[0] || ""
            }`;
            voiceAssistantService.speak(feedbackMessage);
          }
        } else {
          setSuggestions([]);

          if (enableFeedback) {
            const confirmationMessage =
              generateConfirmationMessage(bookingData);
            voiceAssistantService.speak(confirmationMessage);
          }
        }

        if (onResult) {
          onResult(bookingData, parsed);
        }
      } catch (error) {
        console.error("Error processing voice command:", error);
        const errorMessage = "Failed to process voice command";
        setError(errorMessage);

        if (enableFeedback) {
          voiceAssistantService.speak(
            "Sorry, I couldn't understand your request. Please try again."
          );
        }

        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [confidenceThreshold, enableFeedback, onResult, onError]
  );

  const generateConfirmationMessage = useCallback((booking) => {
    const parts = ["I understood:"];

    if (booking.serviceDisplay) {
      parts.push(`${booking.serviceDisplay} service`);
    }

    if (booking.dateDisplay) {
      parts.push(`on ${booking.dateDisplay}`);
    }

    if (booking.timeDisplay) {
      parts.push(`at ${booking.timeDisplay}`);
    }

    if (booking.urgent) {
      parts.push("as urgent");
    }

    parts.push("Is this correct?");
    return parts.join(" ");
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Voice recognition is not supported in your browser");
      return false;
    }

    setError("");
    setTranscript("");
    setParsedBooking(null);
    setSuggestions([]);
    setConfidence(0);

    const started = voiceAssistantService.startListening();
    if (!started) {
      setError("Failed to start voice recognition");
      return false;
    }

    if (enableFeedback) {
      voiceAssistantService.speak(
        "I'm listening. Please tell me what service you need and when."
      );
    }

    return true;
  }, [isSupported, enableFeedback]);

  const stopListening = useCallback(() => {
    voiceAssistantService.stopListening();
    setIsListening(false);
  }, []);

  const speak = useCallback(
    (text, options = {}) => {
      if (isSupported) {
        voiceAssistantService.speak(text, options);
      }
    },
    [isSupported]
  );

  const reset = useCallback(() => {
    setTranscript("");
    setParsedBooking(null);
    setSuggestions([]);
    setError("");
    setConfidence(0);
    setIsProcessing(false);
  }, []);

  const retry = useCallback(() => {
    reset();
    startListening();
  }, [reset, startListening]);

  return {
    // State
    isListening,
    isProcessing,
    transcript,
    parsedBooking,
    error,
    confidence,
    suggestions,
    isSupported,

    // Actions
    startListening,
    stopListening,
    speak,
    reset,
    retry,

    // Utils
    isConfident: confidence >= confidenceThreshold,
    hasValidBooking: parsedBooking && confidence >= confidenceThreshold,

    // Voice assistant service (for advanced usage)
    voiceService: voiceAssistantService,
  };
};

export default useVoiceAssistant;
