import React from "react";
import RealTimeTrackingMap from "../components/RealTimeTrackingMap";
import ProviderLocationTracker from "../components/ProviderLocationTracker";

// Test page for tracking components
const TrackingTestPage = () => {
  // Mock data for testing
  const mockBookingId = "test-booking-123";
  const mockUserLocation = {
    lat: 28.6139, 
    lng: 77.209,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
             Real-Time Tracking Test
          </h1>
          <p className="text-gray-600 mb-6">
            This page demonstrates the real-time tracking functionality similar
            to Ola/Uber.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
              Provider Side - Location Tracker
              </h2>
              <p className="text-sm text-gray-600">
                Use this component to start/stop location tracking as a service
                provider.
              </p>
              <ProviderLocationTracker
                bookingId={mockBookingId}
                onLocationUpdate={(location) => {
                  console.log("Location updated:", location);
                }}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Customer Side - Live Map
              </h2>
              <p className="text-sm text-gray-600">
                Customers see this real-time tracking map to monitor provider
                location.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
         Live Tracking Map
          </h2>
          <RealTimeTrackingMap
            bookingId={mockBookingId}
            userLocation={mockUserLocation}
            onTrackingError={(error) => {
              console.error("Tracking error:", error);
            }}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Testing Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>
              <strong>Provider Testing:</strong> Click "Start Tracking" in the
              location tracker above. Allow location permissions when prompted.
            </li>
            <li>
              <strong>Real-time Updates:</strong> The map will show your current
              location and update automatically.
            </li>
            <li>
              <strong>Fallback Mode:</strong> If Google Maps API key is not
              configured, you'll see coordinate-based tracking instead.
            </li>
            <li>
              <strong>Multiple Devices:</strong> Open this page on different
              devices to see real-time synchronization.
            </li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            Requirements
          </h3>
          <ul className="list-disc list-inside space-y-2 text-yellow-800">
            <li>HTTPS connection (required for geolocation)</li>
            <li>Location permissions enabled in browser</li>
            <li>Backend server running on port 5000</li>
            <li>Socket.io connection established</li>
            <li>Google Maps API key configured (optional)</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            Features Implemented
          </h3>
          <ul className="list-disc list-inside space-y-2 text-green-800">
            <li>Real-time location tracking via Socket.io</li>
            <li>Interactive Google Maps integration</li>
            <li>Fallback UI for missing API keys</li>
            <li>Provider location tracker component</li>
            <li>Customer tracking map view</li>
            <li>Connection status monitoring</li>
            <li>Auto-retry mechanism</li>
            <li>Error handling and user feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrackingTestPage;
