import React, { lazy, Suspense } from "react";
import { Loader, MapPin } from "lucide-react";

// Lazy load the tracking map component
const RealTimeTrackingMap = lazy(() => import("./RealTimeTrackingMap"));

const LazyTrackingMap = ({ bookingId, userLocation, onTrackingError }) => {
  const LoadingFallback = () => (
    <div className="h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
      <div className="text-center p-8">
        <div className="relative mb-4">
          <MapPin className="h-16 w-16 text-blue-500 mx-auto" />
          <Loader className="h-6 w-6 animate-spin text-blue-600 absolute -top-1 -right-1" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Loading Tracking Map
        </h3>
        <p className="text-gray-600">
          Please wait while we load your real-time tracking map...
        </p>
      </div>
    </div>
  );

  const ErrorFallback = ({ error }) => (
    <div className="h-96 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
      <div className="text-center p-8">
        <MapPin className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Failed to Load Tracking Map
        </h3>
        <p className="text-gray-600 mb-4">
          There was an error loading the tracking map. Please refresh the page
          to try again.
        </p>
        <p className="text-sm text-gray-500">
          Error: {error?.message || "Unknown error"}
        </p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary fallback={ErrorFallback}>
        <RealTimeTrackingMap
          bookingId={bookingId}
          userLocation={userLocation}
          onTrackingError={onTrackingError}
        />
      </ErrorBoundary>
    </Suspense>
  );
};

// Simple Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Tracking Map Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback({ error: this.state.error });
    }

    return this.props.children;
  }
}

export default LazyTrackingMap;
