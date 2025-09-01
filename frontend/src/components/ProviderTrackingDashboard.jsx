import React, { useState, useEffect } from "react";
import { MapPin, Play, Square, Navigation, Clock, User } from "lucide-react";
import trackingApiService from "../api/tracking";

const ProviderTrackingDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrackingBookings();
  }, []);

  const fetchTrackingBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await trackingApiService.getProviderTrackingBookings();
      setBookings(response.bookings || []);
    } catch (err) {
      console.error("Error fetching tracking bookings:", err);
      setError(err.message || "Failed to fetch tracking bookings");
    } finally {
      setLoading(false);
    }
  };

  const startTracking = async (bookingId, location) => {
    try {
      await trackingApiService.startTracking(bookingId, location);
      await fetchTrackingBookings(); // Refresh the list
    } catch (err) {
      console.error("Error starting tracking:", err);
      alert(err.message || "Failed to start tracking");
    }
  };

  const stopTracking = async (bookingId) => {
    try {
      await trackingApiService.stopTracking(bookingId);
      await fetchTrackingBookings(); // Refresh the list
    } catch (err) {
      console.error("Error stopping tracking:", err);
      alert(err.message || "Failed to stop tracking");
    }
  };

  const updateLocation = async (bookingId, location) => {
    try {
      await trackingApiService.updateLocation(bookingId, location);
    } catch (err) {
      console.error("Error updating location:", err);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          reject(new Error("Failed to get current location"));
        }
      );
    });
  };

  const handleStartTracking = async (booking) => {
    try {
      const location = await getCurrentLocation();
      await startTracking(booking.id, location);
    } catch {
      alert("Please enable location services to start tracking");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "in-progress":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-gray-600 bg-gray-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTrackingStatus = (tracking) => {
    if (!tracking) return "Not Started";
    if (tracking.isActive) return "Active";
    if (tracking.endedAt) return "Stopped";
    return "Ready";
  };

  const getTrackingStatusColor = (tracking) => {
    if (!tracking) return "text-gray-600 bg-gray-100";
    if (tracking.isActive) return "text-green-600 bg-green-100";
    if (tracking.endedAt) return "text-red-600 bg-red-100";
    return "text-blue-600 bg-blue-100";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading tracking data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading tracking data</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button
            onClick={fetchTrackingBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Tracking Dashboard</h3>
          </div>
          <button
            onClick={fetchTrackingBookings}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="p-4">
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tracking data
            </h3>
            <p className="text-gray-600">
              You don't have any bookings that require tracking yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {booking.user?.name || "Unknown User"}
                      </span>
                      <span className="text-sm text-gray-500">
                        #{booking.bookingId}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {booking.address}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTrackingStatusColor(
                          booking.tracking
                        )}`}
                      >
                        {getTrackingStatus(booking.tracking)}
                      </span>
                    </div>

                    {booking.tracking?.currentLocation?.latitude &&
                      booking.tracking?.currentLocation?.longitude && (
                        <div className="text-sm text-gray-600 mb-2">
                          Last location:{" "}
                          {booking.tracking.currentLocation.latitude.toFixed(6)}
                          ,{" "}
                          {booking.tracking.currentLocation.longitude.toFixed(
                            6
                          )}
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {booking.status === "in-progress" &&
                      !booking.tracking?.isActive && (
                        <button
                          onClick={() => handleStartTracking(booking)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <Play className="h-3 w-3" />
                          <span>Start</span>
                        </button>
                      )}

                    {booking.tracking?.isActive && (
                      <button
                        onClick={() => stopTracking(booking.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        <Square className="h-3 w-3" />
                        <span>Stop</span>
                      </button>
                    )}

                    {booking.tracking?.isActive && (
                      <button
                        onClick={() => {
                          getCurrentLocation()
                            .then((location) => {
                              updateLocation(booking.id, location);
                            })
                            .catch(() => {
                              alert("Failed to get current location");
                            });
                        }}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <MapPin className="h-3 w-3" />
                        <span>Update</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderTrackingDashboard;
