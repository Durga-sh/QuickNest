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
  Loader2,
  Eye,
} from "lucide-react";
import apiService from "../api/provider";
import ProviderDetailsModal from "../components/ProvideDetails";
import ProviderDetailsModal2 from "../components/ProviderDetailsModal";
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
  const [showProviderDetails, setShowProviderDetails] = useState(false);
  const [selectedProviderForDetails, setSelectedProviderForDetails] =
    useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const autocompleteRef = useRef(null);
  const locationInputRef = useRef(null);
  const [isGoogleMapsLoading, setIsGoogleMapsLoading] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

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

  // Load Google Maps API if not already loaded
  const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setGoogleMapsLoaded(true);
        resolve(window.google);
        return;
      }

      // Check if already loading
      if (isGoogleMapsLoading) {
        const checkLoaded = setInterval(() => {
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.places
          ) {
            clearInterval(checkLoaded);
            setGoogleMapsLoaded(true);
            resolve(window.google);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkLoaded);
          if (!window.google?.maps?.places) {
            reject(new Error("Google Maps API loading timeout"));
          }
        }, 10000);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        reject(new Error("Google Maps API key is not configured"));
        return;
      }

      const existingScript = document.querySelector(
        `script[src*="maps.googleapis.com"]`
      );
      if (existingScript) {
        const checkLoaded = setInterval(() => {
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.places
          ) {
            clearInterval(checkLoaded);
            setGoogleMapsLoaded(true);
            resolve(window.google);
          }
        }, 100);
        return;
      }

      setIsGoogleMapsLoading(true);
      const callbackName = `googleMapsCallback_${Date.now()}`;

      window[callbackName] = () => {
        setIsGoogleMapsLoading(false);
        if (window.google && window.google.maps && window.google.maps.places) {
          setGoogleMapsLoaded(true);
          resolve(window.google);
        } else {
          reject(new Error("Google Maps API failed to load properly"));
        }
        delete window[callbackName];
      };

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setIsGoogleMapsLoading(false);
        delete window[callbackName];
        reject(new Error("Failed to load Google Maps API"));
      };

      document.head.appendChild(script);
    });
  };

  // Initialize Google Maps Places Autocomplete
  const initializeAutocomplete = async () => {
    try {
      if (!googleMapsLoaded) {
        await loadGoogleMapsAPI();
      }

      if (autocompleteRef.current) {
        try {
          window.google?.maps?.event?.clearInstanceListeners?.(
            autocompleteRef.current
          );
        } catch (e) {
          console.warn("Error clearing autocomplete listeners:", e);
        }
        autocompleteRef.current = null;
      }

      if (
        locationInputRef.current &&
        window.google &&
        window.google.maps &&
        window.google.maps.places
      ) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["geocode"],
            fields: [
              "formatted_address",
              "geometry",
              "place_id",
              "address_components",
            ],
            componentRestrictions: { country: "in" },
          }
        );

        autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
        setLocationError("");
      }
    } catch (error) {
      console.error("Google Places Autocomplete failed to initialize:", error);
      setLocationError(
        "Location search is temporarily unavailable. You can still use current location."
      );
    }
  };

  // Handle place selection from autocomplete
  const handlePlaceSelect = () => {
    try {
      const place = autocompleteRef.current?.getPlace();
      if (place?.geometry?.location && place?.formatted_address) {
        const locationData = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
        };

        setUserLocation(locationData);
        setLocationInput(place.formatted_address);
        localStorage.setItem("selectedLocation", JSON.stringify(locationData));
        localStorage.setItem("locationInput", place.formatted_address);

        // Auto-sort by distance when location is set
        setFilters((prev) => ({
          ...prev,
          sortBy: "distance",
          sortOrder: "asc",
        }));

        setLocationError("");
        console.log("Location selected successfully:", locationData);
      } else {
        setLocationError(
          "Please select a valid location from the suggestions."
        );
      }
    } catch (error) {
      console.error("Error handling place selection:", error);
      setLocationError("Error selecting location. Please try again.");
    }
  };

  // Manual location search using Google Geocoding API
  const searchLocation = async (address) => {
    if (!address.trim()) {
      setLocationError("Please enter a location to search");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError("");

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error("Google Maps API key is not configured");
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&components=country:IN&key=${apiKey}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];
        const locationData = {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          address: result.formatted_address,
        };

        setUserLocation(locationData);
        setLocationInput(result.formatted_address);
        localStorage.setItem("selectedLocation", JSON.stringify(locationData));
        localStorage.setItem("locationInput", result.formatted_address);

        setFilters((prev) => ({
          ...prev,
          sortBy: "distance",
          sortOrder: "asc",
        }));

        setLocationError("");
      } else {
        setLocationError(
          "Location not found. Please try a different search term."
        );
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setLocationError(`Failed to search location: ${error.message}`);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Get current location using Geolocation API
  const getCurrentLocation = () => {
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
            // Fallback without reverse geocoding
            const locationData = {
              lat: latitude,
              lng: longitude,
              address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(
                4
              )}`,
            };
            setUserLocation(locationData);
            setLocationInput(locationData.address);
            localStorage.setItem(
              "selectedLocation",
              JSON.stringify(locationData)
            );
            localStorage.setItem("locationInput", locationData.address);
            setFilters((prev) => ({
              ...prev,
              sortBy: "distance",
              sortOrder: "asc",
            }));
            setLocationError("");
            setIsLoadingLocation(false);
            return;
          }

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
          } else {
            address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(
              4
            )}`;
          }

          const locationData = {
            lat: latitude,
            lng: longitude,
            address,
          };

          setUserLocation(locationData);
          setLocationInput(address);
          localStorage.setItem(
            "selectedLocation",
            JSON.stringify(locationData)
          );
          localStorage.setItem("locationInput", address);

          setFilters((prev) => ({
            ...prev,
            sortBy: "distance",
            sortOrder: "asc",
          }));

          setLocationError("");
        } catch (error) {
          console.error("Error getting location details:", error);
          setLocationError(`Failed to get location details: ${error.message}`);
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        const errorMessages = {
          1: "Location access denied. Please enable location permissions and try again.",
          2: "Location information is unavailable. Please try again later.",
          3: "Location request timed out. Please try again.",
          default: "An unknown error occurred while getting your location.",
        };
        setLocationError(errorMessages[error.code] || errorMessages.default);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000, // Cache for 1 minute
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

    // Fetch providers without location filter
    fetchProviders(1);
    fetchAvailableSkills();
  };

  // Enhanced fetch providers with proper location handling
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

      // Add location-based filtering if user location is available
      if (userLocation && userLocation.lat && userLocation.lng) {
        // Format location as "lat,lng" for the backend
        filterParams.location = `${userLocation.lng},${userLocation.lat}`;
        filterParams.radius = parseInt(filters.radius);

        // Ensure distance sorting when location is available
        if (filterParams.sortBy === "rating" && userLocation) {
          filterParams.sortBy = "distance";
          filterParams.sortOrder = "asc";
        }
      }

      console.log("Fetching providers with location params:", filterParams);
      const response = await apiService.getAllProviders(filterParams);

      // Process the response data
      const providersData = Array.isArray(response.data) ? response.data : [];
      setProviders(providersData);
      setPagination(response.pagination || {});
      setCurrentPage(page);

      console.log(
        `Found ${providersData.length} providers`,
        userLocation ? `within ${filters.radius}km` : ""
      );
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError(err.message || "Failed to fetch providers");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fetch available skills with location consideration
  const fetchAvailableSkills = async () => {
    try {
      // Note: If you want to filter skills by location, you'll need to modify the backend
      // For now, we'll get all skills but could enhance this later
      const response = await apiService.getAvailableSkills();
      setAvailableSkills(response.skills || []);
    } catch (err) {
      console.error("Error fetching skills:", err);
      setAvailableSkills([]);
    }
  };

  // Handle location input change
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);
    setLocationError("");

    // Re-initialize autocomplete if needed
    if (!autocompleteRef.current && googleMapsLoaded && value.length >= 1) {
      setTimeout(() => {
        if (!autocompleteRef.current && locationInputRef.current) {
          initializeAutocomplete();
        }
      }, 300);
    }
  };

  // Handle location search on Enter key or search button
  const handleLocationSearch = (e) => {
    if (e?.key === "Enter" || e?.type === "click") {
      e.preventDefault();
      searchLocation(locationInput);
    }
  };

  // Handle filter changes with automatic refresh
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [filterName]: value,
      };

      // Auto-apply certain filters immediately
      if (filterName === "radius" && userLocation) {
        setTimeout(() => fetchProviders(1), 100);
      }

      return newFilters;
    });
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchProviders(1);
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    const newFilters = {
      skill: "",
      minPrice: "",
      maxPrice: "",
      radius: "25",
      sortBy: userLocation ? "distance" : "rating",
      sortOrder: userLocation ? "asc" : "desc",
      limit: 12,
    };

    setFilters(newFilters);
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

  // Enhanced search with location consideration
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

      // Add location parameters for search if available
      if (userLocation && userLocation.lat && userLocation.lng) {
        searchParams.lat = userLocation.lat;
        searchParams.lng = userLocation.lng;
        searchParams.radius = parseInt(filters.radius);
      }

      const response = await apiService.searchProviders(
        searchQuery,
        1,
        filters.limit
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

  // Utility functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDistance = (distance) => {
    if (!distance) return null;
    const km = (distance / 1000).toFixed(1);
    return `${km} km away`;
  };

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
  const handleViewDetails = (provider) => {
    setSelectedProviderForDetails(provider);
    setShowProviderDetails(true);
  };

  // Handle contact provider
  const handleContactProvider = (provider) => {
    const phone = provider.user?.phone || provider.phone;
    if (phone) {
      window.open(`tel:${phone}`, "_self");
    } else {
      // Fallback to email if phone not available
      const message = `Hi ${provider.user?.name}, I'm interested in your services. Please contact me.`;
      const mailtoLink = `mailto:${
        provider.user?.email
      }?subject=Service Inquiry&body=${encodeURIComponent(message)}`;
      window.open(mailtoLink, "_blank");
    }
  };

  // Handle book now
  const handleBookNow = (provider, service) => {
    setSelectedProviderForBooking({ ...provider, selectedService: service });
    setShowBookingModal(true);
  };

  // Initialize autocomplete
  useEffect(() => {
    if (!isGoogleMapsLoading && !googleMapsLoaded) {
      const initWithRetry = async (retryCount = 0) => {
        try {
          if (retryCount < 3) {
            await initializeAutocomplete();
          }
        } catch (error) {
          console.warn(
            `Autocomplete initialization attempt ${retryCount + 1} failed:`,
            error
          );
          if (retryCount < 2) {
            setTimeout(() => initWithRetry(retryCount + 1), 1000);
          }
        }
      };
      initWithRetry();
    }

    return () => {
      if (autocompleteRef.current) {
        try {
          window.google?.maps?.event?.clearInstanceListeners?.(
            autocompleteRef.current
          );
        } catch (e) {
          console.warn("Error during cleanup:", e);
        }
      }
    };
  }, []);

  // Re-initialize autocomplete when needed
  useEffect(() => {
    if (
      !userLocation &&
      googleMapsLoaded &&
      locationInputRef.current &&
      !autocompleteRef.current
    ) {
      setTimeout(() => {
        initializeAutocomplete();
      }, 200);
    }
  }, [userLocation, googleMapsLoaded]);

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
          throw new Error("Invalid location data");
        }
      } catch (error) {
        console.error("Error parsing saved location:", error);
        localStorage.removeItem("selectedLocation");
        localStorage.removeItem("locationInput");
      }
    }
  }, []);

  // Initial fetch and fetch when location changes
  useEffect(() => {
    fetchProviders(1);
    fetchAvailableSkills();
  }, []);

  // Refetch when location or key filters change
  useEffect(() => {
    if (userLocation) {
      fetchProviders(1);
    }
  }, [userLocation, filters.radius, filters.sortBy, filters.sortOrder]);

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
                    {userLocation && ` within ${filters.radius}km`}
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
          {/* Enhanced Filters Sidebar */}
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

                {/* Enhanced Location Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>

                  {userLocation ? (
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-emerald-800">
                              Current Location
                            </p>
                            <p className="text-xs text-emerald-600 mt-1 break-words">
                              {userLocation.address}
                            </p>
                            <p className="text-xs text-emerald-500 mt-1">
                              Searching within {filters.radius}km radius
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearLocation}
                          className="text-red-600 hover:bg-red-50 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          <p className="text-sm font-medium text-orange-800">
                            No Location Set
                          </p>
                        </div>
                        <p className="text-xs text-orange-600 mb-3">
                          Set your location to find nearby services and get
                          distance-based results
                        </p>
                      </div>

                      <div className="relative">
                        <Input
                          ref={locationInputRef}
                          type="text"
                          placeholder="Search locations (e.g., Bhubaneswar, Cuttack)"
                          value={locationInput}
                          onChange={handleLocationInputChange}
                          onKeyPress={handleLocationSearch}
                          onFocus={() => {
                            if (!autocompleteRef.current && googleMapsLoaded) {
                              initializeAutocomplete();
                            }
                          }}
                          className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                          disabled={isLoadingLocation}
                          autoComplete="off"
                        />
                        <button
                          onClick={handleLocationSearch}
                          disabled={isLoadingLocation || !locationInput.trim()}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 disabled:opacity-50 transition-colors duration-200"
                        >
                          {isLoadingLocation ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <Button
                        onClick={getCurrentLocation}
                        size="sm"
                        variant="outline"
                        className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        disabled={isLoadingLocation}
                      >
                        {isLoadingLocation ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Navigation className="w-4 h-4 mr-2" />
                        )}
                        Use Current Location
                      </Button>
                    </div>
                  )}

                  {locationError && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-600">{locationError}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Search className="w-4 h-4 inline mr-2" />
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
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Service Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Service Type
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200 bg-white"
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
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Price Range (₹)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
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

                {/* Search Radius - Only show when location is set */}
                {userLocation && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Target className="w-4 h-4 inline mr-2" />
                      Search Radius
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200 bg-white"
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
                      <option value="200">Within 200 km</option>
                    </select>
                  </div>
                )}

                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sort By
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200 bg-white"
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

                {/* Apply Filters Button */}
                <Button
                  onClick={applyFilters}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Filter className="w-4 h-4 mr-2" />
                  )}
                  Apply Filters
                </Button>

                {/* Location Stats */}
                {userLocation && providers.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <Target className="w-3 h-3 inline mr-1" />
                      Found {providers.length} providers within {filters.radius}
                      km
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* Skill Filter Pills */}
            <motion.div
              className="mb-6 flex flex-wrap gap-3"
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
                <p className="ml-4 text-gray-600">
                  {userLocation
                    ? "Finding services near you..."
                    : "Loading services..."}
                </p>
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
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium mb-2">
                      No providers found
                    </p>
                    <p className="text-gray-500 mb-4">
                      {userLocation
                        ? `No services available within ${filters.radius}km of your location`
                        : "Try setting your location to find nearby services"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {userLocation && (
                        <Button
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, radius: "100" }));
                            setTimeout(() => fetchProviders(1), 100);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Expand Search to 100km
                        </Button>
                      )}
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        Clear Filters
                      </Button>
                      {!userLocation && (
                        <Button
                          onClick={getCurrentLocation}
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
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
                {/* Results Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {pagination.totalProviders || 0} providers found
                        {userLocation && ` within ${filters.radius}km`}
                        {selectedSkill && ` for "${selectedSkill}"`}
                      </span>
                      {userLocation && (
                        <Badge
                          variant="outline"
                          className="border-emerald-200 text-emerald-700"
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          Location-based results
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {pagination.totalPages || 1}
                    </div>
                  </div>
                </div>

                {/* Provider Cards */}
                {providers.map((provider) => {
                  const filteredServices = filters.skill
                    ? provider.pricing?.filter(
                        (service) =>
                          service?.service.toLowerCase() ===
                          filters.skill.toLowerCase()
                      ) || []
                    : provider.pricing || [];

                  if (filteredServices.length === 0) return null;

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
                                <div className="flex-1">
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
                                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {formatDistance(provider.distance)}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                                  <Award className="w-4 h-4 mr-1" />
                                  {provider.totalJobs || 0} jobs
                                </Badge>
                              </div>

                              {/* Service Details */}
                              <div className="mb-6">
                                <Badge
                                  variant="outline"
                                  className="text-lg border-emerald-200 text-emerald-700 bg-emerald-50 mb-4"
                                >
                                  {service.service}
                                </Badge>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Location */}
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <span className="text-sm text-gray-600 truncate">
                                      {provider.location?.address ||
                                        "Location not specified"}
                                    </span>
                                  </div>

                                  {/* Availability */}
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <span className="text-sm text-gray-600 truncate">
                                      {formatAvailability(
                                        provider.availability
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {/* Pricing */}
                                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <DollarSign className="w-5 h-5 text-emerald-600 mr-2" />
                                      <span className="text-sm font-medium text-gray-700">
                                        Service Price:
                                      </span>
                                    </div>
                                    <div className="text-xl font-bold text-emerald-600">
                                      {formatPrice(service.price || 0)}
                                    </div>
                                  </div>
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
                                onClick={() => handleViewDetails(provider)}
                                className="hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
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

            {/* Enhanced Pagination */}
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
                        • Within {filters.radius}km of your location
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => fetchProviders(currentPage - 1)}
                    disabled={!pagination.hasPrevPage || loading}
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
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              pageNumber === currentPage
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
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
                    disabled={!pagination.hasNextPage || loading}
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
        <ProviderDetailsModal2
          provider={selectedProviderForDetails}
          isOpen={showProviderDetails}
          onClose={() => setShowProviderDetails(false)}
          onBookNow={(provider) => {
            setShowProviderDetails(false);
            setSelectedProviderForBooking(provider);
            setShowBookingModal(true);
          }}
          onContact={handleContactProvider}
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
