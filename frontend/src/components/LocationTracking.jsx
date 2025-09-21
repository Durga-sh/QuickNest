import React, { useState, useEffect, useContext } from "react";
import {
  MapPin,
  Play,
  Square,
  AlertCircle,
  Loader,
  Satellite,
} from "lucide-react";
import useLocationTracking from "../hooks/useLocationTracking";
import { AuthContext } from "../context/AuthContext";
const LocationTracking = ({ bookingId, onTrackingStateChange }) => {
  const { user } = useContext(AuthContext);
  const {
    isTracking,
    currentLocation,
    error,
    trackingPermission,
    isGeolocationSupported,
    startTracking,
    stopTracking,
    getCurrentPosition,
    requestLocationPermission,
  } = useLocationTracking(bookingId, "provider", user?.id);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  useEffect(() => {
    if (onTrackingStateChange) {
      onTrackingStateChange(isTracking, currentLocation);
    }
  }, [isTracking, currentLocation, onTrackingStateChange]);
  useEffect(() => {
    if (currentLocation && currentLocation.accuracy) {
      setLocationAccuracy(currentLocation.accuracy);
    }
  }, [currentLocation]);
  const handleStartTracking = async () => {
    setIsStarting(true);
    try {
      const success = await startTracking();
      if (success) {
        console.log("âœ… Tracking started successfully");
      }
    } catch (err) {
      console.error("Failed to start tracking:", err);
    } finally {
      setIsStarting(false);
    }
  };
  const handleStopTracking = async () => {
    setIsStopping(true);
    try {
      await stopTracking();
      console.log("âœ… Tracking stopped successfully");
    } catch (err) {
      console.error("Failed to stop tracking:", err);
    } finally {
      setIsStopping(false);
    }
  };
  const handleTestLocation = async () => {
    try {
      const location = await getCurrentPosition();
      alert(
        `Current location: ${location.latitude.toFixed(
          6
        )}, ${location.longitude.toFixed(6)}\nAccuracy: ${location.accuracy}m`
      );
    } catch (err) {
      alert(`Failed to get location: ${err.message}`);
    }
  };
  const getAccuracyColor = (accuracy) => {
    if (!accuracy) return "text-gray-500";
    if (accuracy <= 10) return "text-green-600";
    if (accuracy <= 50) return "text-yellow-600";
    return "text-red-600";
  };
  const getAccuracyDescription = (accuracy) => {
    if (!accuracy) return "Unknown";
    if (accuracy <= 10) return "Excellent";
    if (accuracy <= 50) return "Good";
    return "Poor";
  };
  if (!isGeolocationSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Location Not Supported</span>
        </div>
        <p className="text-red-600 text-sm mt-1">
          Your browser doesn't support location tracking.
        </p>
      </div>
    );
  }
  if (trackingPermission === "denied") {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-orange-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Location Permission Denied</span>
        </div>
        <p className="text-orange-600 text-sm mt-1">
          Please enable location access in your browser settings to start
          tracking.
        </p>
        <button
          onClick={requestLocationPermission}
          className="mt-2 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded transition-colors"
        >
          Request Permission Again
        </button>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Real-time Tracking</h3>
        </div>
        <div
          className={`flex items-center space-x-2 ${
            isTracking ? "text-green-600" : "text-gray-500"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isTracking ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          <span className="text-sm font-medium">
            {isTracking ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      {}
      {currentLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Satellite className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Current Location
            </span>
          </div>
          <div className="text-sm text-blue-800 space-y-1">
            <div>
              <span className="font-medium">Coordinates:</span>{" "}
              {currentLocation.latitude.toFixed(6)},{" "}
              {currentLocation.longitude.toFixed(6)}
            </div>
            {locationAccuracy && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Accuracy:</span>
                <span className={getAccuracyColor(locationAccuracy)}>
                  {Math.round(locationAccuracy)}m (
                  {getAccuracyDescription(locationAccuracy)})
                </span>
              </div>
            )}
            <div className="text-xs text-blue-600">
              Last updated:{" "}
              {currentLocation.timestamp?.toLocaleTimeString() || "Just now"}
            </div>
          </div>
        </div>
      )}
      {}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-900">Error</span>
          </div>
          <p className="text-sm text-red-800 mt-1">{error}</p>
        </div>
      )}
      {}
      <div className="flex flex-col space-y-2">
        {!isTracking ? (
          <button
            onClick={handleStartTracking}
            disabled={isStarting}
            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            {isStarting ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            <span>
              {isStarting ? "Starting Tracking..." : "Start Location Tracking"}
            </span>
          </button>
        ) : (
          <button
            onClick={handleStopTracking}
            disabled={isStopping}
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            {isStopping ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Square className="h-5 w-5" />
            )}
            <span>
              {isStopping ? "Stopping Tracking..." : "Stop Location Tracking"}
            </span>
          </button>
        )}
        {}
        <button
          onClick={handleTestLocation}
          className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <MapPin className="h-4 w-4" />
          <span>Test Current Location</span>
        </button>
      </div>
      {}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Instructions:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>â€¢ Click "Start Location Tracking" when you begin the service</li>
          <li>â€¢ Your location will be shared with the customer in real-time</li>
          <li>â€¢ Keep this tab open while providing the service</li>
          <li>
            â€¢ Click "Stop Location Tracking" when the service is completed
          </li>
        </ul>
      </div>
    </div>
  );
};
export default LocationTracking;
