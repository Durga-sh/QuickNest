import { useState, useEffect, Fragment } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import {
  Home,
  Menu,
  X,
  Navigation,
  Loader2,
  Search,
  MapPin,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const loadGoogleMapsScript = (callback) => {
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  const existingScript = document.querySelector(
    `script[src*="maps.googleapis.com/maps/api/js"]`
  );
  if (existingScript) {
    existingScript.remove();
  }
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  }&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    console.error("Failed to load Google Maps API script");
    callback(new Error("Google Maps API script failed to load"));
  };
  script.onload = () => {
    console.log("Google Maps API script loaded successfully");
    callback();
  };
  document.head.appendChild(script);
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Check if we're on the provider dashboard page
  const isProviderDashboard = location.pathname === "/provider-dashboard";

  // Load saved location from localStorage on component mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation");
    const savedLocationInput = localStorage.getItem("locationInput");

    if (savedLocation && savedLocationInput) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setSelectedLocation(parsedLocation);
        setLocationInput(savedLocationInput);
      } catch (error) {
        console.error("Error parsing saved location:", error);
        // Clear corrupted data
        localStorage.removeItem("selectedLocation");
        localStorage.removeItem("locationInput");
      }
    }
  }, []);

  useEffect(() => {
    if (!isScriptLoading && !isGoogleMapsLoaded) {
      setIsScriptLoading(true);
      loadGoogleMapsScript((error) => {
        if (error) {
          setLocationError(
            "Failed to load Google Maps API. Please check your API key or internet connection."
          );
          setIsScriptLoading(false);
        } else {
          setIsGoogleMapsLoaded(true);
          setIsScriptLoading(false);
        }
      });
    }
  }, [isScriptLoading, isGoogleMapsLoaded]);

  const getCurrentLocation = () => {
    if (!isGoogleMapsLoaded) {
      setLocationError("Google Maps API is not loaded yet. Please try again.");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${
              import.meta.env.VITE_GOOGLE_MAPS_API_KEY
            }&language=en&result_type=street_address|locality|country`
          );
          const data = await response.json();

          if (
            data.status !== "OK" ||
            !data.results ||
            data.results.length === 0
          ) {
            throw new Error(
              `Geocoding failed: ${data.status} - ${
                data.error_message || "No results"
              }`
            );
          }

          const formattedAddress = data.results[0].formatted_address;
          const locationData = {
            lat: latitude,
            lng: longitude,
            address: formattedAddress,
          };

          setLocationInput(formattedAddress);
          setSelectedLocation(locationData);
          setHasLocationPermission(true);

          // Save to localStorage
          localStorage.setItem(
            "selectedLocation",
            JSON.stringify(locationData)
          );
          localStorage.setItem("locationInput", formattedAddress);

          setIsLoadingLocation(false);

          // Navigate to services page with location
          navigate(
            `/service?location=${latitude},${longitude}&address=${encodeURIComponent(
              formattedAddress
            )}`
          );
        } catch (error) {
          console.error("Geocoding error:", error);
          setLocationError(
            `Failed to get address: ${error.message}. Please try again or enter manually.`
          );
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        const errorMessage =
          {
            1: "Location access denied. Please enable location permissions and try again.",
            2: "Location information is unavailable. Please check your GPS settings or move to an open area.",
            3: "Location request timed out. Please try again later.",
            default: "An unknown error occurred while getting location.",
          }[error.code] || "An unknown error occurred while getting location.";
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      }
    );
  };

  const handleSelect = async (address) => {
    setLocationInput(address);
    try {
      const results = await geocodeByAddress(address);
      const { lat, lng } = await getLatLng(results[0]);

      const locationData = {
        lat,
        lng,
        address,
      };

      setSelectedLocation(locationData);

      // Save to localStorage
      localStorage.setItem("selectedLocation", JSON.stringify(locationData));
      localStorage.setItem("locationInput", address);

      console.log(`Selected location: ${address}, Coordinates:`, { lat, lng });

      // Navigate to services page with location
      navigate(
        `/service?location=${lat},${lng}&address=${encodeURIComponent(address)}`
      );
    } catch (error) {
      console.error("Error selecting location:", error);
      setLocationError("Failed to process location. Please try again.");
    }
  };

  const handleServicesClick = () => {
    if (selectedLocation) {
      // Navigate with saved location
      navigate(
        `/service?location=${selectedLocation.lat},${
          selectedLocation.lng
        }&address=${encodeURIComponent(selectedLocation.address)}`
      );
    } else {
      // Navigate without location (show all services)
      navigate("/service");
    }
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Clear location data on logout
      localStorage.removeItem("selectedLocation");
      localStorage.removeItem("locationInput");
      setSelectedLocation(null);
      setLocationInput("");
      navigate("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const clearLocation = () => {
    setLocationInput("");
    setSelectedLocation(null);
    localStorage.removeItem("selectedLocation");
    localStorage.removeItem("locationInput");
    setLocationError("");
  };

  return (
    <nav className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-lg fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Home className="w-6 h-6 text-white" />
              <span className="ml-2 text-2xl font-extrabold tracking-tight">
                QuickNest
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {/* Show location search and services only if not on provider dashboard */}
            {!isProviderDashboard && (
              <>
                <div className="relative flex items-center">
                  {isGoogleMapsLoaded ? (
                    <Fragment>
                      <PlacesAutocomplete
                        value={locationInput}
                        onChange={setLocationInput}
                        onSelect={handleSelect}
                        searchOptions={{
                          types: ["(cities)", "establishment", "geocode"],
                          componentRestrictions: { country: "in" }, // Restrict to India, change as needed
                        }}
                      >
                        {({
                          getInputProps,
                          suggestions,
                          getSuggestionItemProps,
                          loading,
                        }) => (
                          <div className="relative w-80">
                            <div className="relative">
                              <Input
                                {...getInputProps({
                                  placeholder: selectedLocation
                                    ? "Change location..."
                                    : "Search location for services...",
                                  className:
                                    "h-9 bg-white/10 text-white placeholder-gray-300 border-none pr-20",
                                })}
                              />
                              <div className="absolute right-1 top-1 flex items-center space-x-1">
                                {selectedLocation && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 bg-white/10 hover:bg-red-500 text-white"
                                    onClick={clearLocation}
                                    title="Clear location"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 bg-white/10 hover:bg-white/20 text-white"
                                  onClick={getCurrentLocation}
                                  disabled={isLoadingLocation}
                                  title="Use current location"
                                >
                                  {isLoadingLocation ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Navigation className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              {selectedLocation && (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                  <MapPin className="w-3 h-3 text-emerald-300" />
                                </div>
                              )}
                            </div>
                            {suggestions.length > 0 && (
                              <div className="absolute z-20 w-full bg-white text-gray-900 rounded-md shadow-lg mt-2 max-h-60 overflow-y-auto">
                                {loading && (
                                  <div className="p-3 text-gray-500 flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Loading...
                                  </div>
                                )}
                                {suggestions.map((suggestion, index) => (
                                  <div
                                    key={index}
                                    {...getSuggestionItemProps(suggestion, {
                                      className: `p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                                        suggestion.active ? "bg-gray-100" : ""
                                      }`,
                                    })}
                                  >
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                      <span className="text-sm">
                                        {suggestion.description}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </PlacesAutocomplete>
                    </Fragment>
                  ) : (
                    <Input
                      placeholder="Loading location services..."
                      className="h-9 bg-white/10 text-white placeholder-gray-300 border-none w-80"
                      disabled
                    />
                  )}
                </div>
                <button
                  onClick={handleServicesClick}
                  className="text-white hover:text-gray-200 font-medium transition-colors relative"
                >
                  Services
                  {selectedLocation && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-300 rounded-full"></span>
                  )}
                </button>
              </>
            )}
            {user ? (
              <>
                {/* Show My Bookings only if not on provider dashboard */}
                {!isProviderDashboard && (
                  <Link to="/my-bookings">
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      My Bookings
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-white text-emerald-700 hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-emerald-800">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <Fragment>
              {/* Show location search only if not on provider dashboard */}
              {!isProviderDashboard && (
                <>
                  {isGoogleMapsLoaded ? (
                    <div className="relative">
                      <PlacesAutocomplete
                        value={locationInput}
                        onChange={setLocationInput}
                        onSelect={handleSelect}
                        searchOptions={{
                          types: ["(cities)", "establishment", "geocode"],
                          componentRestrictions: { country: "in" },
                        }}
                      >
                        {({
                          getInputProps,
                          suggestions,
                          getSuggestionItemProps,
                          loading,
                        }) => (
                          <div className="relative">
                            <div className="relative">
                              <Input
                                {...getInputProps({
                                  placeholder: selectedLocation
                                    ? "Change location..."
                                    : "Search location for services...",
                                  className:
                                    "h-10 bg-white/10 text-white placeholder-gray-300 border-none pr-20",
                                })}
                              />
                              <div className="absolute right-1 top-1 flex items-center space-x-1">
                                {selectedLocation && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 bg-white/10 hover:bg-red-500 text-white"
                                    onClick={clearLocation}
                                    title="Clear location"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white"
                                  onClick={getCurrentLocation}
                                  disabled={isLoadingLocation}
                                  title="Use current location"
                                >
                                  {isLoadingLocation ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Navigation className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                              {selectedLocation && (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                  <MapPin className="w-4 h-4 text-emerald-300" />
                                </div>
                              )}
                            </div>
                            {suggestions.length > 0 && (
                              <div className="absolute z-20 w-full bg-white text-gray-900 rounded-md shadow-lg mt-2 max-h-48 overflow-y-auto">
                                {loading && (
                                  <div className="p-3 text-gray-500 flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Loading...
                                  </div>
                                )}
                                {suggestions.map((suggestion, index) => (
                                  <div
                                    key={index}
                                    {...getSuggestionItemProps(suggestion, {
                                      className: `p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                                        suggestion.active ? "bg-gray-100" : ""
                                      }`,
                                    })}
                                  >
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                      <span className="text-sm">
                                        {suggestion.description}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </PlacesAutocomplete>
                    </div>
                  ) : (
                    <Input
                      placeholder="Loading location services..."
                      className="h-10 bg-white/10 text-white placeholder-gray-300 border-none"
                      disabled
                    />
                  )}
                  {locationError && (
                    <div className="p-3 bg-red-100/20 rounded-lg text-sm text-red-200">
                      {locationError}
                    </div>
                  )}
                  {selectedLocation && (
                    <div className="p-3 bg-emerald-100/20 rounded-lg text-sm text-emerald-200">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>
                          Services will be shown for: {selectedLocation.address}
                        </span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleServicesClick}
                    className="block w-full text-left text-white hover:text-gray-200 font-medium flex items-center justify-between"
                  >
                    <span>Services</span>
                    {selectedLocation && (
                      <span className="w-2 h-2 bg-emerald-300 rounded-full"></span>
                    )}
                  </button>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="block w-full text-left text-white hover:text-gray-200 font-medium"
                  >
                    How it Works
                  </button>
                  <button
                    onClick={() => scrollToSection("testimonials")}
                    className="block w-full text-left text-white hover:text-gray-200 font-medium"
                  >
                    Reviews
                  </button>
                </>
              )}
              {user ? (
                <div className="space-y-2">
                  {/* Show My Bookings only if not on provider dashboard */}
                  {!isProviderDashboard && (
                    <Link to="/my-bookings" className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        My Bookings
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    onClick={handleLogout}
                  >
                    Log Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" className="block w-full">
                    <Button className="w-full bg-white text-emerald-700 hover:bg-gray-100">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </Fragment>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
