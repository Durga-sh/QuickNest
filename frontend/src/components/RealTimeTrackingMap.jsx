import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import {
  MapPin,
  Navigation,
  Clock,
  AlertCircle,
  Loader,
  RefreshCw,
} from "lucide-react";
import socketService from "../services/socketService";
import trackingApiService from "../api/tracking";
import { AuthContext } from "../context/AuthContext";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 28.6139, // Default to Delhi
  lng: 77.209,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

const RealTimeTrackingMap = ({ bookingId, userLocation, onTrackingError }) => {
  const { user } = useContext(AuthContext);
  const [map, setMap] = useState(null);
  const [providerLocation, setProviderLocation] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showProviderInfo, setShowProviderInfo] = useState(false);
  const [providerStatus, setProviderStatus] = useState("Unknown");

  // Initialize tracking
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get initial tracking status
        const response = await trackingApiService.getTrackingStatus(bookingId);
        setTrackingData(response.booking);

        // Check if tracking is active and has location data
        if (
          response.booking.tracking?.isActive &&
          response.booking.tracking?.currentLocation
        ) {
          setProviderLocation({
            lat: response.booking.tracking.currentLocation.latitude,
            lng: response.booking.tracking.currentLocation.longitude,
          });
          setLastUpdate(
            new Date(response.booking.tracking.currentLocation.timestamp)
          );
          setProviderStatus("On the way");
        } else if (response.booking.status === "in-progress") {
          setProviderStatus("Service started - waiting for location");
        } else {
          setProviderStatus("Service not started");
        }

        // Connect to socket for real-time updates
        socketService.connect();
        socketService.joinTracking(
          bookingId,
          "user",
          user?.id || "current-user"
        );

        setIsConnected(true);
      } catch (err) {
        console.error("Failed to initialize tracking:", err);
        // For 403 errors, it means user doesn't have permission (expected for non in-progress bookings)
        // For 404 errors, it means booking not found
        if (
          err.message.includes("Access denied") ||
          err.message.includes("not authorized")
        ) {
          setError(
            "You do not have permission to view tracking for this booking"
          );
        } else if (err.message.includes("Booking not found")) {
          setError("Booking not found");
        } else {
          setError("Unable to load tracking data");
        }

        if (onTrackingError) onTrackingError(err);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      initializeTracking();
    }

    return () => {
      if (bookingId) {
        socketService.leaveTracking(bookingId);
      }
    };
  }, [bookingId, user?.id, onTrackingError]);

  // Socket event listeners
  useEffect(() => {
    const handleLocationReceived = (data) => {
      if (data.bookingId === bookingId) {
        console.log("📍 Received location update:", data);
        setProviderLocation({
          lat: data.latitude,
          lng: data.longitude,
        });
        setLastUpdate(new Date(data.timestamp));
        setError(null); // Clear any previous errors
      }
    };

    const handleTrackingStarted = (data) => {
      if (data.bookingId === bookingId) {
        console.log("🟢 Tracking started:", data);
        setProviderLocation({
          lat: data.initialLocation.latitude,
          lng: data.initialLocation.longitude,
        });
        setLastUpdate(new Date(data.initialLocation.timestamp));
        setProviderStatus("On the way");
      }
    };

    const handleTrackingStopped = (data) => {
      if (data.bookingId === bookingId) {
        console.log("🔴 Tracking stopped:", data);
        setProviderStatus("Service completed");
      }
    };

    const handleServiceStatusReceived = (data) => {
      if (data.bookingId === bookingId) {
        console.log("🔄 Service status update:", data);
        setProviderStatus(data.status);
      }
    };

    const handleProviderOffline = (data) => {
      if (data.bookingId === bookingId) {
        console.log("📴 Provider offline:", data);
        setError("Provider is currently offline");
        setProviderStatus("Offline");
      }
    };

    // Add event listeners
    socketService.onLocationReceived(handleLocationReceived);
    socketService.onTrackingStarted(handleTrackingStarted);
    socketService.onTrackingStopped(handleTrackingStopped);
    socketService.onServiceStatusReceived(handleServiceStatusReceived);
    socketService.onProviderOffline(handleProviderOffline);

    // Cleanup
    return () => {
      socketService.offLocationReceived(handleLocationReceived);
      socketService.offTrackingStarted(handleTrackingStarted);
      socketService.offTrackingStopped(handleTrackingStopped);
      socketService.offServiceStatusReceived(handleServiceStatusReceived);
      socketService.offProviderOffline(handleProviderOffline);
    };
  }, [bookingId]);

  // Calculate directions when both locations are available
  useEffect(() => {
    if (map && providerLocation && userLocation && window.google) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: providerLocation,
          destination: userLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
          } else {
            console.error("Directions request failed:", status);
          }
        }
      );
    }
  }, [map, providerLocation, userLocation]);

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const refreshTracking = async () => {
    try {
      setError(null);
      const response = await trackingApiService.getTrackingStatus(bookingId);
      setTrackingData(response.booking);

      if (response.booking.tracking?.currentLocation) {
        setProviderLocation({
          lat: response.booking.tracking.currentLocation.latitude,
          lng: response.booking.tracking.currentLocation.longitude,
        });
        setLastUpdate(
          new Date(response.booking.tracking.currentLocation.timestamp)
        );
      }
    } catch (err) {
      console.error("Failed to refresh tracking:", err);
      setError(err.message || "Failed to refresh tracking data");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "on the way":
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "offline":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading tracking data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">
              Live Provider Tracking
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                providerStatus
              )}`}
            >
              {providerStatus}
            </div>
            <button
              onClick={refreshTracking}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh tracking"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 mt-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              • Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error &&
        !error.includes("not authorized") &&
        !error.includes("permission") && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Tracking Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

      {/* No tracking available message */}
      {!loading && !trackingData?.tracking?.isActive && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              Tracking Not Started
            </span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            The service provider hasn't started location sharing yet. Tracking
            will begin when they start the service.
          </p>
        </div>
      )}

      {/* Map */}
      {!loading && (trackingData?.tracking?.isActive || providerLocation) ? (
        <div className="relative">
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
            loadingElement={
              <div className="h-96 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            }
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={providerLocation || userLocation || defaultCenter}
              zoom={14}
              onLoad={onMapLoad}
              options={mapOptions}
            >
              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    url:
                      "data:image/svg+xml;charset=UTF-8," +
                      encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="8" fill="#10b981" stroke="white" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" fill="white"/>
                    </svg>
                  `),
                    scaledSize: new window.google.maps.Size(24, 24),
                  }}
                  title="Your location"
                />
              )}

              {/* Provider Location Marker */}
              {providerLocation && (
                <Marker
                  position={providerLocation}
                  icon={{
                    url:
                      "data:image/svg+xml;charset=UTF-8," +
                      encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3b82f6" stroke="white" stroke-width="1"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                  `),
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}
                  title="Provider location"
                  onClick={() => setShowProviderInfo(true)}
                >
                  {showProviderInfo && (
                    <InfoWindow onCloseClick={() => setShowProviderInfo(false)}>
                      <div className="p-2">
                        <h4 className="font-semibold text-gray-900">
                          Service Provider
                        </h4>
                        <p className="text-sm text-gray-600">
                          Status: {providerStatus}
                        </p>
                        {lastUpdate && (
                          <p className="text-xs text-gray-500">
                            Last update: {lastUpdate.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              )}

              {/* Directions */}
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    polylineOptions: {
                      strokeColor: "#3b82f6",
                      strokeWeight: 4,
                      strokeOpacity: 0.8,
                    },
                    suppressMarkers: true,
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Map Not Available
            </h3>
            <p className="text-gray-600 text-sm">
              Tracking map will be shown when the provider starts sharing their
              location.
            </p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      {trackingData && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <span className="text-gray-600">Provider</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-600 rounded-full" />
                <span className="text-gray-600">Your Location</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Updates every few seconds</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeTrackingMap;
