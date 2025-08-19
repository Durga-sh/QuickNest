// frontend/src/hooks/useVoiceAssistant.js
import { useState, useEffect, useCallback } from "react";
import voiceAssistantService from "../services/voiceAssistantService";
import voiceBookingParser from "../utils/voiceBookingParser";

const useVoiceAssistant = (options = {}) => {
  const {
    autoStart = false,
    onResult = null,
    onError = null,
    onAutoBooking = null,
    confidenceThreshold = 0.6,
    enableFeedback = true,
    enableAutoBooking = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoBooking, setIsAutoBooking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedBooking, setParsedBooking] = useState(null);
  const [error, setError] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [isSupported, setIsSupported] = useState(false);
  const [autoBookingResult, setAutoBookingResult] = useState(null);

  useEffect(() => {
    // Safely check if voice features are supported
    let supported = false;
    try {
      supported =
        voiceAssistantService &&
        typeof voiceAssistantService.isSupported === "function"
          ? voiceAssistantService.isSupported()
          : false;
    } catch (error) {
      console.error("Error checking voice support:", error);
      supported = false;
    }

    setIsSupported(supported);

    if (supported) {
      try {
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
      } catch (error) {
        console.error("Error setting up voice assistant:", error);
        setError("Failed to initialize voice assistant");
      }
    }

    return () => {
      try {
        if (
          voiceAssistantService &&
          typeof voiceAssistantService.stopListening === "function"
        ) {
          voiceAssistantService.stopListening();
        }
      } catch (error) {
        console.error("Error cleaning up voice assistant:", error);
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
    async (command) => {
      try {
        // First try with local parser as fallback
        const localParsed = voiceBookingParser.parseVoiceCommand(command);
        const localBookingData =
          voiceBookingParser.generateBookingData(localParsed);

        setParsedBooking(localBookingData);
        setConfidence(localParsed.confidence);

        // Try to get token safely
        let token = null;
        try {
          token = localStorage.getItem("token");
        } catch (e) {
          console.warn("Could not access localStorage");
        }

        // Try backend processing if token is available
        if (token) {
          try {
            const response = await fetch("/api/voice/process-command", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                transcript: command,
                autoBook:
                  enableAutoBooking &&
                  localParsed.confidence >= confidenceThreshold,
              }),
            });

            if (response.ok) {
              const data = await response.json();

              if (data.success) {
                const { result, bookingData, autoBookingResult } = data;

                setParsedBooking(bookingData || localBookingData);
                setConfidence(result.confidence || localParsed.confidence);
                setAutoBookingResult(autoBookingResult);

                // Handle auto-booking result
                if (autoBookingResult?.success) {
                  setIsAutoBooking(true);

                  if (enableFeedback && voiceAssistantService?.speak) {
                    const confirmationMessage = `Great! I've successfully booked ${bookingData.serviceDisplay} for ${bookingData.dateDisplay}. Your booking ID is ${autoBookingResult.booking.bookingId}.`;
                    voiceAssistantService.speak(confirmationMessage);
                  }

                  if (onAutoBooking) {
                    onAutoBooking(autoBookingResult.booking, bookingData);
                  }

                  // Reset after a delay
                  setTimeout(() => {
                    setIsAutoBooking(false);
                    reset();
                  }, 3000);
                }
              }
            }
          } catch (apiError) {
            console.warn("API call failed, using local processing:", apiError);
          }
        }

        // Handle based on confidence (local or API result)
        const currentConfidence = confidence || localParsed.confidence;
        const currentBookingData = parsedBooking || localBookingData;

        if (currentConfidence >= confidenceThreshold) {
          setSuggestions([]);

          if (enableFeedback && voiceAssistantService?.speak) {
            if (!autoBookingResult?.success) {
              const confirmationMessage =
                generateConfirmationMessage(currentBookingData);
              voiceAssistantService.speak(confirmationMessage);
            }
          }
        } else {
          // Low confidence, provide suggestions
          const commandSuggestions =
            voiceBookingParser.getSuggestions(localParsed);
          setSuggestions(commandSuggestions);

          if (enableFeedback && voiceAssistantService?.speak) {
            const feedbackMessage = `I understood some of your request, but could you please be more specific? ${
              commandSuggestions[0] || ""
            }`;
            voiceAssistantService.speak(feedbackMessage);
          }
        }

        if (onResult) {
          onResult(currentBookingData, { confidence: currentConfidence });
        }
      } catch (error) {
        console.error("Error processing voice command:", error);
        const errorMessage = "Failed to process voice command";
        setError(errorMessage);

        if (enableFeedback && voiceAssistantService?.speak) {
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
    [
      confidenceThreshold,
      enableFeedback,
      enableAutoBooking,
      onResult,
      onError,
      onAutoBooking,
    ]
  );

  const generateConfirmationMessage = useCallback(
    (booking) => {
      const parts = ["I understood:"];

      if (booking?.serviceDisplay) {
        parts.push(`${booking.serviceDisplay} service`);
      }

      if (booking?.dateDisplay) {
        parts.push(`on ${booking.dateDisplay}`);
      }

      if (booking?.timeDisplay) {
        parts.push(`at ${booking.timeDisplay}`);
      }

      if (booking?.urgent) {
        parts.push("as urgent");
      }

      if (enableAutoBooking) {
        parts.push("I'll proceed with the booking now.");
      } else {
        parts.push("Is this correct?");
      }

      return parts.join(" ");
    },
    [enableAutoBooking]
  );

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = "Voice recognition is not supported in your browser";
      setError(errorMsg);
      return false;
    }

    setError("");
    setTranscript("");
    setParsedBooking(null);
    setSuggestions([]);
    setConfidence(0);
    setAutoBookingResult(null);

    try {
      const started = voiceAssistantService.startListening();
      if (!started) {
        const errorMsg = "Failed to start voice recognition";
        setError(errorMsg);
        return false;
      }

      if (enableFeedback && voiceAssistantService?.speak) {
        const message = enableAutoBooking
          ? "I'm listening. Tell me what service you need and I'll book it automatically if I understand clearly."
          : "I'm listening. Please tell me what service you need and when.";
        voiceAssistantService.speak(message);
      }

      return true;
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setError("Failed to start voice recognition");
      return false;
    }
  }, [isSupported, enableFeedback, enableAutoBooking]);

  const stopListening = useCallback(() => {
    try {
      if (voiceAssistantService?.stopListening) {
        voiceAssistantService.stopListening();
      }
      setIsListening(false);
    } catch (error) {
      console.error("Error stopping voice recognition:", error);
    }
  }, []);

  const speak = useCallback(
    (text, options = {}) => {
      try {
        if (isSupported && voiceAssistantService?.speak) {
          voiceAssistantService.speak(text, options);
        }
      } catch (error) {
        console.error("Error in speak function:", error);
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
    setIsAutoBooking(false);
    setAutoBookingResult(null);
  }, []);

  const retry = useCallback(() => {
    reset();
    startListening();
  }, [reset, startListening]);

  // Manual booking trigger (for when auto-booking is disabled)
  const triggerBooking = useCallback(async () => {
    if (!parsedBooking || confidence < confidenceThreshold) {
      setError("Please provide more details for booking");
      return false;
    }

    setIsAutoBooking(true);

    try {
      let token = null;
      try {
        token = localStorage.getItem("token");
      } catch (e) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/voice/process-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transcript: transcript,
          autoBook: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      const data = await response.json();

      if (data.autoBookingResult?.success) {
        setAutoBookingResult(data.autoBookingResult);

        if (onAutoBooking) {
          onAutoBooking(data.autoBookingResult.booking, parsedBooking);
        }

        return true;
      } else {
        throw new Error(data.autoBookingResult?.error || "Booking failed");
      }
    } catch (error) {
      console.error("Manual booking error:", error);
      setError("Booking failed: " + error.message);
      return false;
    } finally {
      setIsAutoBooking(false);
    }
  }, [
    parsedBooking,
    confidence,
    confidenceThreshold,
    transcript,
    onAutoBooking,
  ]);

  return {
    // State
    isListening,
    isProcessing,
    isAutoBooking,
    transcript,
    parsedBooking,
    error,
    confidence,
    suggestions,
    isSupported,
    autoBookingResult,

    // Actions
    startListening,
    stopListening,
    speak,
    reset,
    retry,
    triggerBooking,

    // Utils
    isConfident: confidence >= confidenceThreshold,
    hasValidBooking: parsedBooking && confidence >= confidenceThreshold,
    isAutoBookingReady:
      parsedBooking &&
      confidence >= confidenceThreshold &&
      parsedBooking.service &&
      parsedBooking.bookingDate,

    // Voice assistant service (for advanced usage)
    voiceService: voiceAssistantService,
  };
};

export default useVoiceAssistant;
