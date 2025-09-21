import React, { useState } from "react";
import { Mic, MicOff, Zap, CheckCircle, Loader2 } from "lucide-react";
import useVoiceAssistant from "../hooks/useVoiceAssistant";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
const VoiceBookingButton = ({
  onBookingParsed,
  variant = "primary",
  size = "medium",
  showLabel = true,
  enableFeedback = true,
  className = "",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAutoBooking, setIsAutoBooking] = useState(false);
  const navigate = useNavigate();
  const {
    isListening,
    isProcessing,
    transcript,
    parsedBooking,
    error,
    confidence,
    suggestions,
    isSupported,
    startListening,
    stopListening,
    hasValidBooking,
    retry,
  } = useVoiceAssistant({
    enableFeedback,
    confidenceThreshold: 0.6, // Auto-book at 60% confidence
    onResult: async (bookingData, parsed) => {
      if (hasValidBooking && parsed.confidence >= 0.6) {
        setIsAutoBooking(true);
        try {
          if (onBookingParsed) {
            onBookingParsed(bookingData);
          } else {
            const queryParams = new URLSearchParams({
              service: bookingData.service || "",
              autoBook: "true",
              date: bookingData.bookingDate?.toISOString() || "",
              timeStart: bookingData.timeSlot?.start || "",
              timeEnd: bookingData.timeSlot?.end || "",
              urgent: bookingData.urgent ? "true" : "false",
              confidence: parsed.confidence.toString(),
            });
            navigate(`/services?${queryParams.toString()}`);
            toast.success(
              "Voice booking processed! Redirecting to services..."
            );
          }
        } catch (error) {
          console.error("Auto booking error:", error);
          toast.error("Failed to process voice booking");
        } finally {
          setIsAutoBooking(false);
        }
      }
    },
  });
  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
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
        : isAutoBooking
        ? "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-lg"
        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white focus:ring-purple-500 shadow-lg hover:shadow-xl",
      secondary: isListening
        ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
        : isAutoBooking
        ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
        : "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300",
      minimal: isListening
        ? "text-red-600 hover:text-red-700 hover:bg-red-50"
        : isAutoBooking
        ? "text-green-600 hover:text-green-700 hover:bg-green-50"
        : "text-purple-600 hover:text-purple-700 hover:bg-purple-50",
    };
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };
  const getIconSize = () => {
    switch (size) {
      case "small":
        return "w-4 h-4";
      case "large":
        return "w-6 h-6";
      default:
        return "w-5 h-5";
    }
  };
  if (!isSupported) {
    return (
      <div className="relative">
        <button
          disabled
          className={getButtonStyles()}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <MicOff className={getIconSize()} />
          {showLabel && size !== "small" && (
            <span className="ml-2">Voice Not Supported</span>
          )}
        </button>
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap z-50">
            Voice recognition not supported in this browser
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={getButtonStyles()}
        disabled={isProcessing || isAutoBooking}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isProcessing ? (
          <div
            className={`animate-spin rounded-full border-2 border-white border-t-transparent ${getIconSize()}`}
          />
        ) : isAutoBooking ? (
          <Loader2 className={`${getIconSize()} animate-spin`} />
        ) : isListening ? (
          <MicOff className={getIconSize()} />
        ) : (
          <Mic className={getIconSize()} />
        )}
        {showLabel && size !== "small" && (
          <span className="ml-2">
            {isProcessing
              ? "Processing..."
              : isAutoBooking
              ? "Booking..."
              : isListening
              ? "Stop Listening"
              : "Voice Booking"}
          </span>
        )}
        {isListening && variant === "primary" && (
          <div className="absolute inset-0 rounded-lg bg-red-500 opacity-20 animate-ping"></div>
        )}
      </button>
      {}
      {showTooltip && !isListening && !isProcessing && !isAutoBooking && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap z-50">
          <div className="text-center">
            <div className="flex items-center space-x-1 mb-1">
              <Zap className="w-3 h-3" />
              <span className="font-medium">Auto-booking enabled!</span>
            </div>
            <div>"Book an electrician tomorrow at 10 AM"</div>
          </div>
        </div>
      )}
      {}
      {(isListening || transcript || error || suggestions.length > 0) &&
        !isAutoBooking && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 max-w-sm">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
              {}
              {isListening && (
                <div className="flex items-center space-x-2 text-green-600 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    Listening for auto-booking...
                  </span>
                </div>
              )}
              {}
              {transcript && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">You said:</p>
                  <p className="text-sm text-gray-800 italic">"{transcript}"</p>
                </div>
              )}
              {}
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}
              {}
              {hasValidBooking && confidence >= 0.6 && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center space-x-1 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-green-800 font-medium">
                      Auto-booking in progress!
                    </p>
                  </div>
                  <div className="text-xs text-green-700">
                    High confidence ({Math.round(confidence * 100)}%) -
                    Processing automatically
                  </div>
                </div>
              )}
              {}
              {suggestions.length > 0 && confidence < 0.6 && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800 font-medium mb-1">
                    Need more details for auto-booking:
                  </p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>â€¢ {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              {}
              {parsedBooking && confidence > 0.3 && confidence < 0.6 && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-800 font-medium mb-1">
                    Partial understanding ({Math.round(confidence * 100)}%):
                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    {parsedBooking.serviceDisplay && (
                      <div>Service: {parsedBooking.serviceDisplay}</div>
                    )}
                    {parsedBooking.dateDisplay && (
                      <div>Date: {parsedBooking.dateDisplay}</div>
                    )}
                    {parsedBooking.timeDisplay && (
                      <div>Time: {parsedBooking.timeDisplay}</div>
                    )}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Need 60%+ confidence for auto-booking
                  </div>
                </div>
              )}
              {}
              <div className="flex space-x-2">
                {suggestions.length > 0 && (
                  <button
                    onClick={retry}
                    className="flex-1 bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={stopListening}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      {}
      {isAutoBooking && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 max-w-sm">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            <div className="flex items-center space-x-2 text-green-600 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">
                Auto-booking your service...
              </span>
            </div>
            <p className="text-xs text-gray-600">
              High confidence booking detected. Processing automatically!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export const VoiceBookingButtonPresets = {
  FloatingButton: (props) => (
    <VoiceBookingButton
      variant="primary"
      size="large"
      showLabel={false}
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl hover:shadow-3xl z-40"
      {...props}
    />
  ),
  HeaderButton: (props) => (
    <VoiceBookingButton
      variant="secondary"
      size="medium"
      showLabel={true}
      className="border-2"
      {...props}
    />
  ),
  IconButton: (props) => (
    <VoiceBookingButton
      variant="minimal"
      size="small"
      showLabel={false}
      className="p-2"
      {...props}
    />
  ),
  CTAButton: (props) => (
    <VoiceBookingButton
      variant="primary"
      size="large"
      showLabel={true}
      className="w-full justify-center py-4 text-lg font-semibold"
      {...props}
    />
  ),
};
export default VoiceBookingButton;
