import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  DollarSign,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Briefcase,
  ArrowLeft,
  Sparkles,
  Award,
  Users,
  Target,
  Navigation,
  AlertCircle,
  X,
  SlidersHorizontal,
} from "lucide-react";
import apiService from "../api/provider";
import ProviderDetailsModal from "../components/ProvideDetails";
import BookingModal from "../components/BookimgModal";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";

const ServiceDetailsPage = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProviderForBooking, setSelectedProviderForBooking] =
    useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const autocompleteRef = useRef(null);
  const [filters, setFilters] = useState({
    skill: "",
    minPrice: "",
    maxPrice: "",
    radius: "25",
    sortBy: "rating",
    sortOrder: "desc",
    limit: 12,
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    try {
      if (
        apiKey &&
        window?.google?.maps?.places?.Autocomplete &&
        !autocompleteRef.current
      ) {
        const input = document.getElementById("location-search");
        if (input) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            input,
            {
              types: ["geocode"],
              fields: ["formatted_address", "geometry"],
            }
          );

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace?.();
            if (place?.geometry?.location) {
              const locationData = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address,
              };
              setUserLocation(locationData);
              setLocationInput(place.formatted_address);
              localStorage.setItem(
                "selectedLocation",
                JSON.stringify(locationData)
              );
              localStorage.setItem("locationInput", place.formatted_address);
              setFilters((prev) => ({
                ...prev,
                sortBy: "distance",
                sortOrder: "asc",
              }));
              setLocationError("");
            } else {
              setLocationError(
                "Please select a valid location from the suggestions."
              );
            }
          });
        }
      }
    } catch (e) {
      console.warn("Google Places Autocomplete failed to initialize:", e);
      // Non-fatal. User can still type address or use current location.
    }
  }, []);

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation");
    const savedLocationInput = localStorage.getItem("locationInput");
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        if (
          parsedLocation.lat &&
          parsedLocation.lng &&
          parsedLocation.address
        ) {
          setUserLocation(parsedLocation);
          setLocationInput(savedLocationInput || parsedLocation.address);
          setFilters((prev) => ({
            ...prev,
            sortBy: "distance",
            sortOrder: "asc",
          }));
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

  // Fetch providers with current filters
  const fetchProviders = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const filterParams = {
        ...filters,
        page,
        limit: filters.limit,
        ...(selectedSkill && { skill: selectedSkill }),
      };

      if (userLocation && userLocation.lat && userLocation.lng) {
        filterParams.lat = userLocation.lat;
        filterParams.lng = userLocation.lng;
        filterParams.radius = filters.radius;
      }

      console.log("Fetching providers with params:", filterParams);
      const response = await apiService.getAllProviders(filterParams);
      setProviders(Array.isArray(response.data) ? response.data : []);
      setPagination(response.pagination || {});
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError(err.message || "Failed to fetch providers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available skills
  const fetchAvailableSkills = async () => {
    try {
      const skillsParams = {};
      if (userLocation && userLocation.lat && userLocation.lng) {
        skillsParams.lat = userLocation.lat;
        skillsParams.lng = userLocation.lng;
        skillsParams.radius = filters.radius;
      }

      const response = await apiService.getAvailableSkills(skillsParams);
      setAvailableSkills(response.skills || []);
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Validate Google Maps API key
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            throw new Error(
              "Google Maps API key is missing. Please configure VITE_GOOGLE_MAPS_API_KEY in your environment."
            );
          }

          // Fetch address using Google Maps Geocoding API
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=en`,
            { method: "GET" }
          );

          if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.statusText}`);
          }

          const data = await response.json();

          let address = "Current Location";
          if (data.status === "OK" && data.results && data.results.length > 0) {
            address = data.results[0].formatted_address;
          } else if (data.status !== "OK") {
            console.warn("Geocoding API returned non-OK status:", data.status);
            address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(
              4
            )}`;
          }

          const locationData = {
            lat: latitude,
            lng: longitude,
            address,
          };

          // Update state and localStorage
          setUserLocation(locationData);
          setLocationInput(address);
          localStorage.setItem(
            "selectedLocation",
            JSON.stringify(locationData)
          );
          localStorage.setItem("locationInput", address);

          // Update filters to sort by distance
          setFilters((prev) => ({
            ...prev,
            sortBy: "distance",
            sortOrder: "asc",
          }));

          // Fetch providers and skills with the new location
          await Promise.all([fetchProviders(1), fetchAvailableSkills()]);
        } catch (error) {
          console.error("Error getting location details:", error);
          setLocationError(`Failed to get location details: ${error.message}`);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        const errorMessages = {
          1: "Location access denied. Please enable location permissions in your browser settings.",
          2: "Location information is unavailable. Please try again later.",
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

  // Clear location
  const clearLocation = () => {
    setUserLocation(null);
    setLocationInput("");
    localStorage.removeItem("selectedLocation");
    localStorage.removeItem("locationInput");
    setLocationError("");
    setFilters((prev) => ({
      ...prev,
      sortBy: "rating",
      sortOrder: "desc",
    }));
    fetchProviders(1);
    fetchAvailableSkills();
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchProviders(1);
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      skill: "",
      minPrice: "",
      maxPrice: "",
      radius: "25",
      sortBy: userLocation ? "distance" : "rating",
      sortOrder: userLocation ? "asc" : "desc",
      limit: 12,
    });
    setSelectedSkill("");
    setSearchQuery("");
    setCurrentPage(1);
    fetchProviders(1);
  };

  // Handle skill filter
  const handleSkillFilter = (skill) => {
    setSelectedSkill(skill);
    setFilters((prev) => ({ ...prev, skill }));
    setCurrentPage(1);
    fetchProviders(1);
  };

  // Search providers
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProviders(1);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const searchParams = {
        query: searchQuery,
        page: 1,
        limit: filters.limit,
      };

      if (userLocation && userLocation.lat && userLocation.lng) {
        searchParams.lat = userLocation.lat;
        searchParams.lng = userLocation.lng;
        searchParams.radius = filters.radius;
      }

      const response = await apiService.searchProviders(
        searchQuery,
        1,
        filters.limit,
        searchParams
      );
      setProviders(response.data || []);
      setPagination(response.pagination || {});
      setCurrentPage(1);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  // Format distance
  const formatDistance = (distance) => {
    if (!distance) return null;
    return `${(distance / 1000).toFixed(1)} km away`;
  };

  // Format availability
  const formatAvailability = (availability) => {
    if (!availability || availability.length === 0) return "Not specified";
    return availability
      .slice(0, 3)
      .map(
        (slot) =>
          `${slot.day}: ${slot.timeSlots[0]?.start}-${slot.timeSlots[0]?.end}`
      )
      .join(", ");
  };

  // Handle view details
  const handleViewDetails = (providerId) => {
    setSelectedProviderId(providerId);
    setShowModal(true);
  };

  // Handle contact provider
  const handleContactProvider = (provider) => {
    const message = `Hi ${provider.user?.name}, I'm interested in your services. Please contact me.`;
    const mailtoLink = `mailto:${
      provider.user?.email
    }?subject=Service Inquiry&body=${encodeURIComponent(message)}`;
    window.open(mailtoLink, "_blank");
  };

  // Handle book now
  const handleBookNow = (provider, service) => {
    setSelectedProviderForBooking({ ...provider, selectedService: service });
    setShowBookingModal(true);
  };

  useEffect(() => {
    fetchProviders(1);
    fetchAvailableSkills();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchProviders(1);
      fetchAvailableSkills();
    }
  }, [userLocation, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <motion.h1
                  className="text-3xl font-bold text-gray-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {userLocation ? "Services Near You" : "All Services"}
                </motion.h1>
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {pagination.totalProviders || 0} professionals available
                  </p>
                  {userLocation && (
                    <div className="flex items-center text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      <Target className="w-4 h-4 mr-1" />
                      <span className="truncate max-w-xs">
                        {userLocation.address}
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="lg:hidden flex items-center"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <motion.div
            className={`lg:col-span-1 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-emerald-600" />
                    Filters
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>

                {/* Location Status */}
                {userLocation ? (
                  <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">
                            Current Location
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            {userLocation.address}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearLocation}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <p className="text-sm font-medium text-orange-800">
                        No Location Set
                      </p>
                    </div>
                    <p className="text-xs text-orange-600 mb-3">
                      Set your location to find nearby services
                    </p>
                    <div className="flex flex-col space-y-3">
                      <div className="relative">
                        <Input
                          id="location-search"
                          type="text"
                          placeholder="Search for a location..."
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                        />
                        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      <Button
                        onClick={getCurrentLocation}
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Use Current Location
                      </Button>
                    </div>
                  </div>
                )}

                {locationError && (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600">{locationError}</p>
                  </div>
                )}

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Search Services
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <Button
                      onClick={handleSearch}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Service Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Service Type
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200"
                    value={filters.skill}
                    onChange={(e) =>
                      handleFilterChange("skill", e.target.value)
                    }
                  >
                    <option value="">All Services</option>
                    {availableSkills.map((skillData) => (
                      <option key={skillData.skill} value={skillData.skill}>
                        {skillData.skill} ({skillData.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range (₹)
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Search Radius */}
                {userLocation && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Search Radius
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200"
                      value={filters.radius}
                      onChange={(e) =>
                        handleFilterChange("radius", e.target.value)
                      }
                    >
                      <option value="5">Within 5 km</option>
                      <option value="10">Within 10 km</option>
                      <option value="25">Within 25 km</option>
                      <option value="50">Within 50 km</option>
                      <option value="100">Within 100 km</option>
                    </select>
                  </div>
                )}

                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sort By
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200"
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                  >
                    {userLocation && (
                      <option value="distance">Distance (Nearest First)</option>
                    )}
                    <option value="rating">Rating (Highest First)</option>
                    <option value="totalReviews">Most Reviews</option>
                    <option value="totalJobs">Most Experienced</option>
                    <option value="createdAt">Newest Providers</option>
                  </select>
                </div>

                <Button
                  onClick={applyFilters}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Skill Filter Pills */}
            <motion.div
              className="mt-6 flex flex-wrap gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={() => handleSkillFilter("")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  !selectedSkill
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                All Services
              </motion.button>
              {availableSkills.slice(0, 8).map((skillData) => (
                <motion.button
                  key={skillData.skill}
                  onClick={() => handleSkillFilter(skillData.skill)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedSkill === skillData.skill
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {skillData.skill} ({skillData.count})
                </motion.button>
              ))}
            </motion.div>

            {/* Loading State */}
            {loading ? (
              <motion.div
                className="flex justify-center items-center h-64"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-emerald-400 opacity-20"></div>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4 text-lg font-medium">
                      {error}
                    </p>
                    <Button
                      onClick={() => fetchProviders(1)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : providers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blud-sm">
                  <CardContent className="p-8 text-center">
                    <div className="mb-4">
                      <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg font-medium mb-2">
                        No providers found
                      </p>
                      <p className="text-gray-500 mb-4">
                        {userLocation
                          ? `No services available in your area (${filters.radius}km radius)`
                          : "Try adjusting your search criteria or set your location"}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={clearFilters}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Clear Filters
                      </Button>
                      {!userLocation && (
                        <Button
                          onClick={getCurrentLocation}
                          variant="outline"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Set Location
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {providers.map((provider) => {
                  const filteredServices = filters.skill
                    ? provider.pricing?.filter(
                        (service) =>
                          service?.service.toLowerCase() ===
                          filters.skill.toLowerCase()
                      ) || []
                    : provider.pricing || [];

                  if (filteredServices.length === 0) {
                    console.log(
                      `No services found for provider ${provider.user?.name} with skill ${filters.skill}`
                    );
                    return null;
                  }

                  return filteredServices.map((service, index) => (
                    <motion.div
                      key={`${provider._id}-${service.service}-${index}`}
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-6">
                          <div className="lg:flex lg:items-start lg:justify-between">
                            <div className="flex-1">
                              {/* Provider Header */}
                              <div className="flex items-start justify-between mb-6">
                                <div>
                                  <motion.h3
                                    className="text-xl font-semibold text-gray-900 mb-2"
                                    whileHover={{ color: "#059669" }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {provider.user?.name || "Professional"}
                                  </motion.h3>
                                  <div className="flex items-center flex-wrap gap-4">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < Math.floor(provider.rating || 0)
                                              ? "text-yellow-400 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                      <span className="ml-2 text-sm text-gray-600">
                                        {(provider.rating || 0).toFixed(1)} (
                                        {provider.totalReviews || 0} reviews)
                                      </span>
                                    </div>
                                    {provider.distance && (
                                      <span className="text-sm text-emerald-600 flex items-center bg-emerald-50 px-2 py-1 rounded-full">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {formatDistance(provider.distance)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                                  <Award className="w-4 h-4 mr-1" />
                                  {provider.totalJobs || 0} jobs completed
                                </Badge>
                              </div>

                              {/* Service Name */}
                              <div className="mb-6">
                                <Badge
                                  variant="outline"
                                  className="text-lg border-emerald-200 text-emerald-700 bg-emerald-50"
                                >
                                  {service.service}
                                </Badge>
                              </div>

                              {/* Location */}
                              <div className="flex items-center mb-4">
                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">
                                  {provider.location?.address ||
                                    "Location not specified"}
                                </span>
                              </div>

                              {/* Availability */}
                              <div className="flex items-center mb-4">
                                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">
                                  {formatAvailability(provider.availability)}
                                </span>
                              </div>

                              {/* Pricing */}
                              <div className="mb-6">
                                <div className="flex items-center mb-2">
                                  <DollarSign className="w-4 h-4 text-emerald-600 mr-2" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Price:
                                  </span>
                                </div>
                                <div className="text-lg font-bold text-emerald-600">
                                  {formatPrice(service.price || 0)}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="lg:ml-6 mt-6 lg:mt-0 flex flex-col space-y-3 lg:w-48">
                              <Button
                                onClick={() => handleBookNow(provider, service)}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <Briefcase className="w-4 h-4 mr-2" />
                                Book Now
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 hover:bg-gray-50 transition-all duration-200"
                                onClick={() => handleContactProvider(provider)}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Contact
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(provider._id)}
                                className="hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
                              >
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ));
                })}
              </motion.div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                className="mt-8 flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center text-sm text-gray-600">
                  <span>
                    Showing {(currentPage - 1) * filters.limit + 1} to{" "}
                    {Math.min(
                      currentPage * filters.limit,
                      pagination.totalProviders
                    )}{" "}
                    of {pagination.totalProviders} providers
                    {userLocation && (
                      <span className="text-emerald-600 ml-2">
                        • Within {filters.radius}km
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => fetchProviders(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </motion.button>

                  <div className="flex items-center space-x-2">
                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, i) => {
                        const pageNumber =
                          currentPage <= 3 ? i + 1 : currentPage + i - 2;
                        if (pageNumber > pagination.totalPages) return null;
                        return (
                          <motion.button
                            key={pageNumber}
                            onClick={() => fetchProviders(pageNumber)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              pageNumber === currentPage
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {pageNumber}
                          </motion.button>
                        );
                      }
                    )}
                  </div>

                  <motion.button
                    onClick={() => fetchProviders(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ProviderDetailsModal
          providerId={selectedProviderId}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedProviderId(null);
          }}
        />
        <BookingModal
          provider={selectedProviderForBooking}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={(booking) => {
            console.log("Booking successful:", booking);
            setShowBookingModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
