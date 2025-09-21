import React, { useState, useEffect } from "react";
import { MapPin, Play, Square, AlertCircle, Loader, Wifi } from "lucide-react";
import trackingApiService from "../api/tracking";
const ProviderLocationTracker = ({ bookingId, onLocationUpdate }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const isGeolocationSupported = "geolocation" in navigator;
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);
  const startTracking = async () => {
    if (!isGeolocationSupported) {
      setError("Geolocation is not supported by this browser");
      return;
    }
    try {
      setError(null);
      const position = await getCurrentPosition();
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      await trackingApiService.startTracking(bookingId, location);
      setCurrentLocation(location);
      setIsTracking(true);
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          try {
            await trackingApiService.updateLocation(bookingId, newLocation);
            setCurrentLocation(newLocation);
            if (onLocationUpdate) {
              onLocationUpdate(newLocation);
            }
          } catch (err) {
            console.error("Failed to update location:", err);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError(`Location error: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
      setWatchId(id);
    } catch (err) {
      setError(err.message || "Failed to start tracking");
      setIsTracking(false);
    }
  };
  const stopTracking = async () => {
    try {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      await trackingApiService.stopTracking(bookingId);
      setIsTracking(false);
      setCurrentLocation(null);
    } catch (err) {
      setError(err.message || "Failed to stop tracking");
    }
  };
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    });
  };
  if (!isGeolocationSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Geolocation Not Supported</span>
        </div>
        <p className="text-red-700 text-sm mt-1">
          Your browser doesn't support location tracking.
        </p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Location Tracking</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isTracking ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="text-sm text-gray-600">
            {isTracking ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}
      {currentLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Current Location</span>
          </div>
          <p className="text-blue-700 text-sm mt-1 font-mono">
            {currentLocation.latitude.toFixed(6)},{" "}
            {currentLocation.longitude.toFixed(6)}
          </p>
        </div>
      )}
      <div className="flex space-x-3">
        {!isTracking ? (
          <button
            onClick={startTracking}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Start Tracking</span>
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Square className="h-4 w-4" />
            <span>Stop Tracking</span>
          </button>
        )}
      </div>
      <div className="mt-3 text-xs text-gray-500">
        <p>ðŸ“ Real-time location sharing with customers</p>
        <p>ðŸ”’ Location data is only shared during active bookings</p>
      </div>
    </div>
  );
};
export default ProviderLocationTracker;
