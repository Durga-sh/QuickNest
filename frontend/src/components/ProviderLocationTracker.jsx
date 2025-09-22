import React, { useState, useEffect, useRef } from "react";
import { MapPin, Play, Square, AlertCircle, Loader, Wifi } from "lucide-react";
import trackingApiService from "../api/tracking";
const ProviderLocationTracker = ({ bookingId, onLocationUpdate }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);

  const isGeolocationSupported = "geolocation" in navigator;

  // Optimization constants
  const MIN_UPDATE_INTERVAL = 10000; // 10 seconds minimum between updates
  const MIN_DISTANCE_THRESHOLD = 10; // 10 meters minimum movement
  const MAX_UPDATES_PER_HOUR = 360; // Limit API calls

  const lastLocation = useRef(null);
  // Utility function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Optimized location update function
  const shouldUpdateLocation = (newLocation) => {
    const now = Date.now();

    // Check time threshold
    if (now - lastUpdateTime < MIN_UPDATE_INTERVAL) {
      return false;
    }

    // Check distance threshold
    if (lastLocation.current) {
      const distance = calculateDistance(
        lastLocation.current.latitude,
        lastLocation.current.longitude,
        newLocation.latitude,
        newLocation.longitude
      );

      if (distance < MIN_DISTANCE_THRESHOLD) {
        return false;
      }
    }

    // Check rate limiting
    if (updateCount > MAX_UPDATES_PER_HOUR) {
      return false;
    }

    return true;
  };

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
      lastLocation.current = location;
      setLastUpdateTime(Date.now());
      setUpdateCount(1);

      // Use a more optimized location watching strategy
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // Only update if location change is significant
          if (shouldUpdateLocation(newLocation)) {
            try {
              await trackingApiService.updateLocation(bookingId, newLocation);
              setCurrentLocation(newLocation);
              lastLocation.current = newLocation;
              setLastUpdateTime(Date.now());
              setUpdateCount((prev) => prev + 1);

              if (onLocationUpdate) {
                onLocationUpdate(newLocation);
              }
            } catch (err) {
              console.error("Failed to update location:", err);
              // Don't show error for failed location updates to avoid spam
            }
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError(`Location error: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout
          maximumAge: 60000, // Allow cached locations for 1 minute
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
