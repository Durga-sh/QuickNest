import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import {
  GoogleMap,
  useJsApiLoader,
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
  Wifi,
  WifiOff,
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
  gestureHandling: "cooperative",
};
const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  "AIzaSyBHg5SkO4eR8VkK9F3kHl2wCJfv6_ZQ_z8"; // Demo key

// Google Maps libraries to load
const libraries = ["geometry", "drawing"];

const RealTimeTrackingMap = ({ bookingId, userLocation, onTrackingError }) => {
  const { user } = useContext(AuthContext);

  // Use Google Maps loader hook for better performance
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 seconds

  // Cache for directions to avoid repeated API calls
  const directionsCache = useRef(new Map());
  const lastDirectionsCall = useRef(0);
  const DIRECTIONS_THROTTLE = 10000; // 10 seconds between directions calls
  const initializeTracking = useCallback(
    async (attempt = 1) => {
      try {
        setLoading(true);
        setError(null);
        const response = await trackingApiService.getTrackingStatus(bookingId);
        setTrackingData(response.booking);
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
        socketService.connect();
        // Add a small delay to ensure connection is established
        setTimeout(() => {
          if (socketService.isConnected()) {
            socketService.joinTracking(
              bookingId,
              "user",
              user?.id || "current-user"
            );
            setIsConnected(true);
          } else {
            console.warn("Socket connection failed, retrying...");
            setTimeout(() => {
              if (!socketService.isConnected()) {
                socketService.connect();
              }
            }, 2000);
          }
        }, 500);
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        console.error(
          `Failed to initialize tracking (attempt ${attempt}):`,
          err
        );
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
          if (attempt < MAX_RETRIES) {
            setRetryCount(attempt);
            setTimeout(() => {
              initializeTracking(attempt + 1);
            }, RETRY_DELAY);
            return;
          }
        }
        if (onTrackingError) onTrackingError(err);
      } finally {
        setLoading(false);
      }
    },
    [bookingId, user?.id, onTrackingError, MAX_RETRIES, RETRY_DELAY]
  );
  useEffect(() => {
    if (bookingId) {
      initializeTracking();
    }
    return () => {
      if (bookingId) {
        socketService.leaveTracking(bookingId);
      }
    };
  }, [bookingId, initializeTracking]);
  useEffect(() => {
    const handleLocationReceived = (data) => {
      if (data.bookingId === bookingId) {
        console.log("ðŸ“ Received location update:", data);
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
        console.log("ðŸŸ¢ Tracking started:", data);
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
        console.log("ðŸ”´ Tracking stopped:", data);
        setProviderStatus("Service completed");
      }
    };
    const handleServiceStatusReceived = (data) => {
      if (data.bookingId === bookingId) {
        console.log("ðŸ”„ Service status update:", data);
        setProviderStatus(data.status);
      }
    };
    const handleProviderOffline = (data) => {
      if (data.bookingId === bookingId) {
        console.log("ðŸ“´ Provider offline:", data);
        setError("Provider is currently offline");
        setProviderStatus("Offline");
      }
    };
    socketService.onLocationReceived(handleLocationReceived);
    socketService.onTrackingStarted(handleTrackingStarted);
    socketService.onTrackingStopped(handleTrackingStopped);
    socketService.onServiceStatusReceived(handleServiceStatusReceived);
    socketService.onProviderOffline(handleProviderOffline);
    return () => {
      socketService.offLocationReceived(handleLocationReceived);
      socketService.offTrackingStarted(handleTrackingStarted);
      socketService.offTrackingStopped(handleTrackingStopped);
      socketService.offServiceStatusReceived(handleServiceStatusReceived);
      socketService.offProviderOffline(handleProviderOffline);
    };
  }, [bookingId]);
  useEffect(() => {
    if (map && providerLocation && userLocation && window.google) {
      const now = Date.now();
      const cacheKey = `${providerLocation.lat},${providerLocation.lng}-${userLocation.lat},${userLocation.lng}`;

      // Check cache first
      if (directionsCache.current.has(cacheKey)) {
        setDirections(directionsCache.current.get(cacheKey));
        return;
      }

      // Throttle directions API calls
      if (now - lastDirectionsCall.current < DIRECTIONS_THROTTLE) {
        return;
      }

      lastDirectionsCall.current = now;
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
            // Cache the result
            directionsCache.current.set(cacheKey, result);
            // Limit cache size
            if (directionsCache.current.size > 10) {
              const firstKey = directionsCache.current.keys().next().value;
              directionsCache.current.delete(firstKey);
            }
          } else {
            console.error("Directions request failed:", status);
          }
        }
      );
    }
  }, [map, providerLocation, userLocation]);
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
  const handleMapLoad = useCallback((map) => {
    setMap(map);
    console.log("ðŸ“ Google Map loaded successfully");
  }, []);
  const handleMapError = useCallback(() => {
    console.error("ðŸ“ Google Map failed to load");
    setError(
      "Failed to load Google Maps. Please check your internet connection."
    );
  }, []);
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
          <span className="text-gray-600">
            {retryCount > 0
              ? `Retrying connection... (${retryCount}/${MAX_RETRIES})`
              : "Loading tracking data..."}
          </span>
        </div>
        {retryCount > 0 && (
          <div className="mt-2 text-center">
            <p className="text-sm text-orange-600">
              Having trouble connecting. Please check your internet connection.
            </p>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {}
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
        {}
        <div className="flex items-center space-x-2 mt-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          {retryCount > 0 && (
            <span className="text-sm text-orange-600">
              â€¢ Retry attempt {retryCount}/{MAX_RETRIES}
            </span>
          )}
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              â€¢ Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      {}
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
      {}
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
      {}
      {!loading && (trackingData?.tracking?.isActive || providerLocation) ? (
        <div className="relative">
          {!GOOGLE_MAPS_API_KEY ||
          GOOGLE_MAPS_API_KEY === "AIzaSyBHg5SkO4eR8VkK9F3kHl2wCJfv6_ZQ_z8" ? (
            <div className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Live Tracking Active
                </h3>
                <p className="text-gray-600 mb-4">
                  Your service provider is on the way!
                </p>
                {providerLocation && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Provider Location:</p>
                    <p className="font-mono text-blue-600">
                      {providerLocation.lat.toFixed(6)},{" "}
                      {providerLocation.lng.toFixed(6)}
                    </p>
                    {lastUpdate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-500">
                  <p>ðŸ—ºï¸ Google Maps integration available with API key</p>
                </div>
              </div>
            </div>
          ) : loadError ? (
            <div className="h-96 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
              <div className="text-center p-8">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Failed to Load Map
                </h3>
                <p className="text-gray-600 mb-4">
                  There was an error loading Google Maps. Please refresh the
                  page.
                </p>
              </div>
            </div>
          ) : !isLoaded ? (
            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={providerLocation || userLocation || defaultCenter}
              zoom={14}
              onLoad={handleMapLoad}
              options={mapOptions}
            >
              {}
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
              {}
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
              {}
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
          )}
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
      {}
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
