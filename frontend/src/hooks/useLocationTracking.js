import { useState, useEffect, useRef, useCallback } from "react";
import socketService from "../services/socketService";
import trackingApiService from "../api/tracking";
const useLocationTracking = (
  bookingId,
  userType = "provider",
  userId = null
) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [trackingPermission, setTrackingPermission] = useState(null);
  const watchIdRef = useRef(null);
  const lastLocationRef = useRef(null);
  const locationUpdateIntervalRef = useRef(null);
  const isGeolocationSupported = "geolocation" in navigator;
  const requestLocationPermission = useCallback(async () => {
    if (!isGeolocationSupported) {
      setError("Geolocation is not supported by this browser");
      return false;
    }
    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      setTrackingPermission(permission.state);
      if (permission.state === "denied") {
        setError(
          "Location permission denied. Please enable location access in your browser settings."
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error requesting location permission:", err);
      setError("Failed to request location permission");
      return false;
    }
  }, [isGeolocationSupported]);
  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!isGeolocationSupported) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          };
          resolve(location);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Failed to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            default:
              errorMessage = "Unknown location error";
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Accept cached location up to 1 minute old
        }
      );
    });
  }, [isGeolocationSupported]);
  const startTracking = useCallback(async () => {
    try {
      setError(null);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return false;
      }
      const initialLocation = await getCurrentPosition();
      setCurrentLocation(initialLocation);
      await trackingApiService.startTracking(bookingId, {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      });
      socketService.connect();
      socketService.joinTracking(bookingId, userType, userId || "current-user");
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date(position.timestamp),
            };
            setCurrentLocation(newLocation);
            lastLocationRef.current = newLocation;
            socketService.updateLocation(
              bookingId,
              newLocation.latitude,
              newLocation.longitude
            );
          },
          (error) => {
            console.error("Watch position error:", error);
            setError("Failed to watch location changes");
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 30000,
          }
        );
      }
      locationUpdateIntervalRef.current = setInterval(async () => {
        if (lastLocationRef.current) {
          try {
            await trackingApiService.updateLocation(bookingId, {
              latitude: lastLocationRef.current.latitude,
              longitude: lastLocationRef.current.longitude,
            });
          } catch (err) {
            console.error("Failed to update location via API:", err);
          }
        }
      }, 10000); // Update every 10 seconds
      setIsTracking(true);
      console.log("ðŸŸ¢ Location tracking started for booking:", bookingId);
      return true;
    } catch (err) {
      console.error("Failed to start tracking:", err);
      setError(err.message || "Failed to start location tracking");
      return false;
    }
  }, [
    bookingId,
    userType,
    userId,
    requestLocationPermission,
    getCurrentPosition,
  ]);
  const stopTracking = useCallback(async () => {
    try {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
        locationUpdateIntervalRef.current = null;
      }
      if (bookingId) {
        await trackingApiService.stopTracking(bookingId);
        socketService.leaveTracking(bookingId);
      }
      setIsTracking(false);
      setCurrentLocation(null);
      lastLocationRef.current = null;
      console.log("ðŸ”´ Location tracking stopped for booking:", bookingId);
    } catch (err) {
      console.error("Failed to stop tracking:", err);
      setError(err.message || "Failed to stop location tracking");
    }
  }, [bookingId]);
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
    };
  }, []);
  return {
    isTracking,
    currentLocation,
    error,
    trackingPermission,
    isGeolocationSupported,
    startTracking,
    stopTracking,
    getCurrentPosition,
    requestLocationPermission,
  };
};
export default useLocationTracking;
