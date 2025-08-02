"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import {
  Star,
  MapPin,
  Shield,
  Clock,
  Wrench,
  Zap,
  Scissors,
  Paintbrush,
  Car,
  Home,
  Menu,
  X,
  ArrowRight,
  CheckCircle,
  Play,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Loader2,
  Navigation,
} from "lucide-react";

// Load Google Maps API script with check for existing load
const loadGoogleMapsScript = (callback) => {
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  const existingScript = document.querySelector(
    `script[src*="maps.googleapis.com/maps/api/js"]`
  );
  if (existingScript) {
    existingScript.remove(); // Remove any existing script to avoid conflicts
  }
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
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

const QuickNestLanding = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);

  // Load Google Maps API only once
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

  const services = [
    {
      icon: Wrench,
      name: "Plumbing",
      description: "Expert plumbers for all your needs",
      color: "bg-blue-500",
    },
    {
      icon: Zap,
      name: "Electrical",
      description: "Licensed electricians available 24/7",
      color: "bg-yellow-500",
    },
    {
      icon: Scissors,
      name: "Beauty & Salon",
      description: "Professional beauticians at your doorstep",
      color: "bg-pink-500",
    },
    {
      icon: Paintbrush,
      name: "Painting",
      description: "Transform your space with skilled painters",
      color: "bg-green-500",
    },
    {
      icon: Car,
      name: "Auto Repair",
      description: "Mobile mechanics for your vehicle",
      color: "bg-red-500",
    },
    {
      icon: Home,
      name: "Home Cleaning",
      description: "Thorough cleaning services",
      color: "bg-purple-500",
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Live Tracking",
      description:
        "Track your service professional in real-time from booking to completion",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: Star,
      title: "Verified Ratings",
      description:
        "Choose from top-rated professionals with authentic customer reviews",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Safe and secure payment options with full transaction protection",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Clock,
      title: "Quick Booking",
      description:
        "Book services instantly and get professionals at your doorstep within hours",
      color: "bg-blue-100 text-blue-600",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      content:
        "QuickNest made finding a reliable plumber so easy. The live tracking feature gave me peace of mind!",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "Mike Chen",
      role: "Business Owner",
      content:
        "As an electrician, QuickNest has helped me connect with more customers and grow my business.",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Emily Davis",
      role: "Working Professional",
      content:
        "The beauty services at home are a game-changer. Professional, convenient, and affordable!",
      rating: 5,
      avatar: "ED",
    },
  ];

  // Function to get current location with Google Maps reverse geocoding
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
          console.log("Geolocation coordinates:", {
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
          });

          // Add language and region bias for better accuracy
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&language=en&result_type=street_address|locality|country`
          );
          console.log("Geocode API response status:", response.status);

          const data = await response.json();
          console.log("Geocode API response data:", data);

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

          // Use the most specific result
          const formattedAddress = data.results[0].formatted_address;
          setLocationInput(formattedAddress);
          setIsLoadingLocation(false);
          console.log(`Location detected: ${formattedAddress}`);
        } catch (error) {
          console.error("Geocoding error:", error);
          setLocationError(
            `Failed to get address: ${error.message}. Please try again or enter manually.`
          );
          setIsLoadingLocation(false);

          // Fallback: Use approximate location if geocoding fails
          if (error.message.includes("No results")) {
            setLocationInput(
              `Approximate location near ${position.coords.latitude}, ${position.coords.longitude}`
            );
          }
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
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      }
    );
  };

  // Handle location selection from autocomplete
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

  // Fallback if script fails to load
  if (!isGoogleMapsLoaded && !isScriptLoading) {
    return (
      <div className="p-4 text-center text-red-600">
        Failed to load location services. Please refresh the page or check your
        internet connection.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  QuickNest
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {isGoogleMapsLoaded ? (
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
                    <div className="relative flex-1 max-w-xs">
                      <Input
                        {...getInputProps({
                          placeholder: "Enter your location or service...",
                          className: "h-10 text-base pr-10",
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-emerald-50"
                        onClick={getCurrentLocation}
                        disabled={isLoadingLocation}
                        title="Use current location"
                      >
                        {isLoadingLocation ? (
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        ) : (
                          <Navigation className="w-4 h-4 text-emerald-600" />
                        )}
                      </Button>
                      {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                          {loading && (
                            <div className="p-2 text-gray-500">Loading...</div>
                          )}
                          {suggestions.map((suggestion, index) => {
                            const suggestionProps = getSuggestionItemProps(
                              suggestion,
                              {
                                className: `p-2 cursor-pointer hover:bg-gray-100 ${
                                  suggestion.active ? "bg-gray-100" : ""
                                }`,
                              }
                            );
                            // Extract key and spread remaining props
                            const { key, ...restProps } = suggestionProps;
                            return (
                              <div key={key || index} {...restProps}>
                                {suggestion.description}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </PlacesAutocomplete>
              ) : (
                <div className="flex-1 max-w-xs">
                  <Input
                    placeholder="Loading location services..."
                    className="h-10 text-base"
                    disabled
                  />
                </div>
              )}
              <button
                onClick={() => navigate("/service")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Reviews
              </button>
              <Link to="/login">
                <Button variant="outline" className="mr-2 bg-transparent">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Get Started
                </Button>
              </Link>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
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

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {isGoogleMapsLoaded ? (
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
                    <div className="px-3 py-2 relative">
                      <Input
                        {...getInputProps({
                          placeholder: "Enter your location or service...",
                          className: "h-10 text-base pr-10",
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-4 top-3 h-8 w-8 p-0 hover:bg-emerald-50"
                        onClick={getCurrentLocation}
                        disabled={isLoadingLocation}
                        title="Use current location"
                      >
                        {isLoadingLocation ? (
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        ) : (
                          <Navigation className="w-4 h-4 text-emerald-600" />
                        )}
                      </Button>
                      {suggestions.length > 0 && (
                        <div className="absolute z-10 w-[calc(100%-24px)] bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                          {loading && (
                            <div className="p-2 text-gray-500">Loading...</div>
                          )}
                          {suggestions.map((suggestion, index) => {
                            const suggestionProps = getSuggestionItemProps(
                              suggestion,
                              {
                                className: `p-2 cursor-pointer hover:bg-gray-100 ${
                                  suggestion.active ? "bg-gray-100" : ""
                                }`,
                              }
                            );
                            // Extract key and spread remaining props
                            const { key, ...restProps } = suggestionProps;
                            return (
                              <div key={key || index} {...restProps}>
                                {suggestion.description}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </PlacesAutocomplete>
              ) : (
                <div className="px-3 py-2">
                  <Input
                    placeholder="Loading location services..."
                    className="h-10 text-base"
                    disabled
                  />
                </div>
              )}
              {locationError && (
                <div className="px-3 py-2">
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {locationError}
                  </div>
                </div>
              )}
              <button
                onClick={() => scrollToSection("services")}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
              >
                Reviews
              </button>
              <div className="px-3 py-2 space-y-2">
                <Link to="/login" className="block w-full">
                  <Button variant="outline" className="w-full bg-transparent">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="block w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-16 pb-20 sm:pt-24 sm:pb-32 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="mb-6">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  🚀 Trusted by 50,000+ customers
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                Your Local
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Service Heroes
                </span>
                On Demand
              </h1>
              <p className="mt-6 text-lg text-gray-600 sm:text-xl">
                Connect with verified local professionals for all your home and
                personal service needs. From plumbing to beauty services - we've
                got you covered with live tracking and secure payments.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    Book a Service
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center bg-transparent"
                  >
                    <Play className="mr-2 w-4 h-4" />
                    Watch Demo
                  </Button>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Verified Professionals
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Secure Payments
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    24/7 Support
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-2xl lg:max-w-md">
                <div className="w-full h-96 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Home className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                    <p className="text-emerald-800 font-semibold">
                      QuickNest App Interface
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                      Live Tracking
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Secure Payment
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose QuickNest?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience the future of local service booking
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Professional Services at Your Fingertips
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose from our wide range of verified local professionals
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mx-auto mb-4`}
                  >
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Button
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700 p-0"
                  >
                    Book Now <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How QuickNest Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get professional services in just three simple steps
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="relative text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Choose Service
              </h3>
              <p className="text-gray-600">
                Select from our wide range of professional services and describe
                your needs
              </p>
            </div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Matched
              </h3>
              <p className="text-gray-600">
                We'll instantly connect you with verified professionals in your
                area
              </p>
            </div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Track & Pay
              </h3>
              <p className="text-gray-600">
                Monitor progress in real-time and pay securely after service
                completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of satisfied customers and professionals
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-emerald-600 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-emerald-100">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-emerald-100">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100K+</div>
              <div className="text-emerald-100">Services Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4.9</div>
              <div className="text-emerald-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join QuickNest today and experience hassle-free service booking
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Book Your First Service
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Join as Professional
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">QuickNest</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Your trusted platform for connecting with local service
                professionals. Quality services, verified professionals, secure
                payments.
              </p>
              <div className="flex space-x-4">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Plumbing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Electrical
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Beauty & Salon
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Home Cleaning
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Auto Repair
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Painting
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>hello@quicknest.com</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>New York, NY</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 QuickNest. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QuickNestLanding;
