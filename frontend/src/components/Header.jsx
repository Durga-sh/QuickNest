import { useState, useEffect, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { Home, Menu, X, Navigation, Loader2, Search } from "lucide-react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);

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
          setLocationInput(formattedAddress);
          setIsLoadingLocation(false);
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
      const latLng = await getLatLng(results[0]);
      console.log(`Selected location: ${address}, Coordinates:`, latLng);
    } catch (error) {
      console.error("Error selecting location:", error);
      setLocationError("Failed to process location. Please try again.");
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
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
            <div className="relative flex items-center">
              {isGoogleMapsLoaded ? (
                <Fragment>
                  <PlacesAutocomplete
                    value={locationInput}
                    onChange={setLocationInput}
                    onSelect={handleSelect}
                  >
                    {({
                      getInputProps,
                      suggestions,
                      getSuggestionItemProps,
                      loading,
                    }) => (
                      <div className="relative w-64">
                        <div className="relative">
                          <Input
                            {...getInputProps({
                              placeholder: "Search location or service...",
                              className:
                                "h-9 bg-white/10 text-white placeholder-gray-300 border-none pr-10",
                            })}
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-70" />
                        </div>
                        {suggestions.length > 0 && (
                          <div className="absolute z-20 w-full bg-white text-gray-900 rounded-md shadow-lg mt-2">
                            {loading && (
                              <div className="p-2 text-gray-500">
                                Loading...
                              </div>
                            )}
                            {suggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                {...getSuggestionItemProps(suggestion, {
                                  className: `p-3 cursor-pointer hover:bg-gray-100 ${
                                    suggestion.active ? "bg-gray-100" : ""
                                  }`,
                                })}
                              >
                                {suggestion.description}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </PlacesAutocomplete>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-9 w-9 p-0 bg-white/10 hover:bg-white/20 text-white"
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
                </Fragment>
              ) : (
                <Input
                  placeholder="Loading location services..."
                  className="h-9 bg-white/10 text-white placeholder-gray-300 border-none"
                  disabled
                />
              )}
            </div>
            <button
              onClick={() => navigate("/service")}
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              Reviews
            </button>
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
              {isGoogleMapsLoaded ? (
                <div className="relative">
                  <PlacesAutocomplete
                    value={locationInput}
                    onChange={setLocationInput}
                    onSelect={handleSelect}
                  >
                    {({
                      getInputProps,
                      suggestions,
                      getSuggestionItemProps,
                      loading,
                    }) => (
                      <div className="relative">
                        <Input
                          {...getInputProps({
                            placeholder: "Search location or service...",
                            className:
                              "h-10 bg-white/10 text-white placeholder-gray-300 border-none pr-10",
                          })}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-70" />
                        {suggestions.length > 0 && (
                          <div className="absolute z-20 w-full bg-white text-gray-900 rounded-md shadow-lg mt-2">
                            {loading && (
                              <div className="p-2 text-gray-500">
                                Loading...
                              </div>
                            )}
                            {suggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                {...getSuggestionItemProps(suggestion, {
                                  className: `p-3 cursor-pointer hover:bg-gray-100 ${
                                    suggestion.active ? "bg-gray-100" : ""
                                  }`,
                                })}
                              >
                                {suggestion.description}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </PlacesAutocomplete>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white"
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
              <button
                onClick={() => scrollToSection("services")}
                className="block w-full text-left text-white hover:text-gray-200 font-medium"
              >
                Services
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
            </Fragment>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
