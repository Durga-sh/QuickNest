import { useState, useEffect, Fragment } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { Home, Menu, X, Navigation, Loader2, MapPin } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { debounce } from "lodash";
const loadGoogleMapsScript = (callback) => {
  if (window.google && window.google.maps && window.google.maps.places) {
    callback(null);
    return;
  }
  const existingScript = document.querySelector(
    `script[src*="maps.googleapis.com/maps/api/js"]`
  );
  if (existingScript) {
    existingScript.remove();
  }
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    callback(
      new Error(
        "Google Maps API key is missing. Please configure VITE_GOOGLE_MAPS_API_KEY."
      )
    );
    return;
  }
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    console.error("Failed to load Google Maps API script");
    callback(new Error("Google Maps API script failed to load"));
  };
  script.onload = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log("Google Maps API and Places library loaded successfully");
      callback(null);
    } else {
      console.error("Google Maps Places API not available after script load");
      callback(new Error("Google Maps Places API not available"));
    }
  };
  document.head.appendChild(script);
};
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser, isProvider } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const debouncedSetLocationInput = debounce(async (value) => {
    setLocationInput(value);
    setLocationError("");
    setIsFetchingSuggestions(true);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (
      !apiKey ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    ) {
      console.error("API key or Places API not available");
      setIsFetchingSuggestions(false);
      setLocationError(
        "Places API is not available. Check your API key and network."
      );
      return;
    }
    let attempt = 0;
    const maxAttempts = 2;
    while (attempt < maxAttempts) {
      try {
        const service = new window.google.maps.places.AutocompleteService();
        const request = {
          input: value,
          types: ["geocode"],
          componentRestrictions: { country: "in" },
        };
        const response = await new Promise((resolve, reject) => {
          service.getPlacePredictions(request, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              console.log("Places API response:", predictions);
              resolve(predictions);
            } else {
              console.error("Places API status:", status);
              reject(new Error(`Places API error: ${status}`));
            }
          });
        });
        setIsFetchingSuggestions(false);
        break; // Exit loop on success
      } catch (error) {
        attempt++;
        console.error(`Attempt ${attempt} failed:`, error.message);
        if (attempt === maxAttempts) {
          setIsFetchingSuggestions(false);
          setLocationError(
            `Failed to load suggestions after ${maxAttempts} attempts: ${error.message}. Check your internet connection or API key.`
          );
        }
      }
    }
    const timeoutId = setTimeout(() => {
      if (isFetchingSuggestions) {
        console.warn("Autocomplete request timed out");
        setIsFetchingSuggestions(false);
        setLocationError(
          "Autocomplete request timed out. Please check your internet connection or try again."
        );
      }
    }, 10000); // 10 seconds
    return () => clearTimeout(timeoutId);
  }, 300);
  const isProviderDashboard = location.pathname === "/provider-dashboard";
  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation");
    const savedLocationInput = localStorage.getItem("locationInput");
    if (savedLocation && savedLocationInput) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        if (
          parsedLocation.lat &&
          parsedLocation.lng &&
          parsedLocation.address
        ) {
          setSelectedLocation(parsedLocation);
          setLocationInput(savedLocationInput);
        } else {
          throw new Error("Invalid location data in localStorage");
        }
      } catch (error) {
        console.error("Error parsing saved location:", error);
        localStorage.removeItem("selectedLocation");
        localStorage.removeItem("locationInput");
        setLocationError(
          "Invalid saved location data. Please set your location again."
        );
      }
    }
  }, []);
  useEffect(() => {
    if (!isScriptLoading && !isGoogleMapsLoaded) {
      setIsScriptLoading(true);
      loadGoogleMapsScript((error) => {
        setIsScriptLoading(false);
        if (error) {
          setLocationError(
            error.message ||
              "Failed to load location services. Please check your internet connection or API key."
          );
        } else {
          setIsGoogleMapsLoaded(true);
        }
      });
    }
  }, [isScriptLoading, isGoogleMapsLoaded]);
  const getCurrentLocation = () => {
    if (!isGoogleMapsLoaded) {
      setLocationError(
        "Location services are not loaded yet. Please try again."
      );
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }
    setIsLoadingLocation(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            throw new Error("Google Maps API key is missing.");
          }
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=en`
          );
          if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.statusText}`);
          }
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
          localStorage.setItem(
            "selectedLocation",
            JSON.stringify(locationData)
          );
          localStorage.setItem("locationInput", formattedAddress);
          navigate(
            `/service?lat=${latitude}&lng=${longitude}&address=${encodeURIComponent(
              formattedAddress
            )}`
          );
        } catch (error) {
          console.error("Geocoding error:", error);
          setLocationError(
            `Failed to get address: ${error.message}. Please try again or enter manually.`
          );
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        const errorMessages = {
          1: "Location access denied. Please enable location permissions in your browser settings.",
          2: "Location information is unavailable. Please check your GPS settings or move to an open area.",
          3: "Location request timed out. Please try again.",
          default: "An unknown error occurred while getting your location.",
        };
        setLocationError(errorMessages[error.code] || errorMessages.default);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };
  const handleSelect = async (address) => {
    setLocationInput(address);
    setLocationError("");
    setIsFetchingSuggestions(false); // Clear loading state on selection
    try {
      const results = await geocodeByAddress(address);
      if (!results || results.length === 0) {
        throw new Error("No results found for the selected address.");
      }
      const { lat, lng } = await getLatLng(results[0]);
      const locationData = {
        lat,
        lng,
        address,
      };
      setSelectedLocation(locationData);
      localStorage.setItem("selectedLocation", JSON.stringify(locationData));
      localStorage.setItem("locationInput", address);
      console.log(`Selected location: ${address}, Coordinates:`, { lat, lng });
      navigate(
        `/service?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`
      );
    } catch (error) {
      console.error("Error selecting location:", error);
      setLocationError(
        "Failed to process location. Please try another address or check your API key."
      );
    }
  };
  const handleServicesClick = () => {
    if (selectedLocation) {
      navigate(
        `/service?lat=${selectedLocation.lat}&lng=${
          selectedLocation.lng
        }&address=${encodeURIComponent(selectedLocation.address)}`
      );
    } else {
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
      localStorage.removeItem("selectedLocation");
      localStorage.removeItem("locationInput");
      setSelectedLocation(null);
      setLocationInput("");
      setLocationError("");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      setLocationError("Failed to log out. Please try again.");
    }
  };
  const clearLocation = () => {
    setLocationInput("");
    setSelectedLocation(null);
    localStorage.removeItem("selectedLocation");
    localStorage.removeItem("locationInput");
    setLocationError("");
    navigate("/service");
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
            {!isProviderDashboard && !isProvider && (
              <>
                <div className="relative flex items-center">
                  {isGoogleMapsLoaded ? (
                    <Fragment>
                      <PlacesAutocomplete
                        value={locationInput}
                        onChange={debouncedSetLocationInput}
                        onSelect={handleSelect}
                        searchOptions={{
                          types: ["geocode"],
                          componentRestrictions: { country: "in" },
                          language: "en",
                        }}
                        debounce={300}
                      >
                        {({
                          getInputProps,
                          suggestions,
                          getSuggestionItemProps,
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
                                  disabled={
                                    isLoadingLocation || isScriptLoading
                                  }
                                  title="Use current location"
                                >
                                  {isLoadingLocation || isScriptLoading ? (
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
                            {(isFetchingSuggestions ||
                              suggestions.length > 0) && (
                              <div className="absolute z-20 w-full bg-white text-gray-900 rounded-md shadow-lg mt-2 max-h-60 overflow-y-auto">
                                {isFetchingSuggestions && (
                                  <div className="p-3 text-gray-500 flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Loading suggestions...
                                  </div>
                                )}
                                {suggestions.map((suggestion, index) => {
                                  const suggestionProps =
                                    getSuggestionItemProps(suggestion, {
                                      className: `p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                                        suggestion.active ? "bg-gray-100" : ""
                                      }`,
                                    });
                                  const { key, ...restProps } = suggestionProps;
                                  return (
                                    <div key={key} {...restProps}>
                                      <div className="flex items-center">
                                        <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">
                                          {suggestion.description}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </PlacesAutocomplete>
                      {locationError && (
                        <div className="absolute top-full mt-2 p-3 bg-red-100/90 rounded-lg text-sm text-red-600 w-full">
                          {locationError}
                        </div>
                      )}
                    </Fragment>
                  ) : (
                    <div className="relative w-80">
                      <Input
                        placeholder="Loading location services..."
                        className="h-9 bg-white/10 text-white placeholder-gray-300 border-none"
                        disabled
                      />
                      {locationError && (
                        <div className="absolute top-full mt-2 p-3 bg-red-100/90 rounded-lg text-sm text-red-600 w-full">
                          {locationError}
                        </div>
                      )}
                    </div>
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
                {!isProviderDashboard && !isProvider && (
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
            {!isProviderDashboard && !isProvider && (
              <>
                <div className="relative">
                  {isGoogleMapsLoaded ? (
                    <Fragment>
                      <PlacesAutocomplete
                        value={locationInput}
                        onChange={debouncedSetLocationInput}
                        onSelect={handleSelect}
                        searchOptions={{
                          types: ["geocode"],
                          componentRestrictions: { country: "in" },
                          language: "en",
                        }}
                        debounce={300}
                      >
                        {({
                          getInputProps,
                          suggestions,
                          getSuggestionItemProps,
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
                                  disabled={
                                    isLoadingLocation || isScriptLoading
                                  }
                                  title="Use current location"
                                >
                                  {isLoadingLocation || isScriptLoading ? (
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
                            {(isFetchingSuggestions ||
                              suggestions.length > 0) && (
                              <div className="absolute z-20 w-full bg-white text-gray-900 rounded-md shadow-lg mt-2 max-h-48 overflow-y-auto">
                                {isFetchingSuggestions && (
                                  <div className="p-3 text-gray-500 flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Loading suggestions...
                                  </div>
                                )}
                                {suggestions.map((suggestion, index) => {
                                  const suggestionProps =
                                    getSuggestionItemProps(suggestion, {
                                      className: `p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                                        suggestion.active ? "bg-gray-100" : ""
                                      }`,
                                    });
                                  const { key, ...restProps } = suggestionProps;
                                  return (
                                    <div key={key} {...restProps}>
                                      <div className="flex items-center">
                                        <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">
                                          {suggestion.description}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </PlacesAutocomplete>
                      {locationError && (
                        <div className="mt-2 p-3 bg-red-100/20 rounded-lg text-sm text-red-200">
                          {locationError}
                        </div>
                      )}
                    </Fragment>
                  ) : (
                    <div className="relative">
                      <Input
                        placeholder="Loading location services..."
                        className="h-10 bg-white/10 text-white placeholder-gray-300 border-none"
                        disabled
                      />
                      {locationError && (
                        <div className="mt-2 p-3 bg-red-100/20 rounded-lg text-sm text-red-200">
                          {locationError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                {!isProviderDashboard && !isProvider && (
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
          </div>
        </div>
      )}
    </nav>
  );
};
export default Header;
