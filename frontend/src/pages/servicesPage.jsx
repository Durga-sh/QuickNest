import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import BookingModal from "../components/BookimgModal";
import { Input } from "../components/ui/input";
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Filter,
  Search,
  ArrowLeft,
  Phone,
  Calendar,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  X,
  SlidersHorizontal,
} from "lucide-react";
import apiService from "../api/provider";

const ServicesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get URL parameters
  const selectedSkill = searchParams.get("skill") || "";
  const selectedCategory = searchParams.get("category") || "";

  // State management
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProviderForBooking, setSelectedProviderForBooking] =
    useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    skill: selectedSkill,
    minPrice: "",
    maxPrice: "",
    location: "",
    radius: "50",
    sortBy: "rating",
    sortOrder: "desc",
  });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

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

  // Fetch providers based on filters
  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError("");

      const filterParams = {
        ...filters,
        page: 1,
        limit: 20,
      };

      // Remove empty filters
      Object.keys(filterParams).forEach((key) => {
        if (filterParams[key] === "" || filterParams[key] === null) {
          delete filterParams[key];
        }
      });

      console.log("Fetching providers with params:", filterParams); // Debug log
      const response = await apiService.getAllProviders(filterParams);
      console.log("Fetched providers data:", response.data); // Debug log
      if (Array.isArray(response.data)) {
        setProviders(response.data);
      } else {
        setProviders(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError(err.message || "Failed to fetch providers");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (provider, service) => {
    setSelectedProviderForBooking({ ...provider, selectedService: service });
    setShowBookingModal(true);
  };

  // Fetch available skills for filter dropdown
  const fetchAvailableSkills = async () => {
    try {
      const response = await apiService.getAvailableSkills();
      console.log("Fetched available skills:", response.skills); // Debug log
      setAvailableSkills(response.skills || []);
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  };

  // Search providers by text
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return fetchProviders();
    }

    try {
      setLoading(true);
      const response = await apiService.searchProviders(searchQuery, 1, 20);
      setProviders(response.data || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchProviders();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      skill: "",
      minPrice: "",
      maxPrice: "",
      location: "",
      radius: "50",
      sortBy: "rating",
      sortOrder: "desc",
    });
    setSearchQuery("");
  };

  // Format availability for display
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

  // Calculate distance display
  const formatDistance = (distance) => {
    if (!distance) return "";
    return `${(distance / 1000).toFixed(1)} km away`;
  };

  useEffect(() => {
    fetchProviders();
    fetchAvailableSkills();
  }, []);

  useEffect(() => {
    if (selectedSkill && selectedSkill !== filters.skill) {
      setFilters((prev) => ({ ...prev, skill: selectedSkill }));
    }
  }, [selectedSkill]);

  useEffect(() => {
    if (filters.skill !== selectedSkill) {
      fetchProviders();
    }
  }, [filters.skill]);

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
                  {selectedCategory
                    ? `${selectedCategory} Services`
                    : "Find Services"}
                </motion.h1>
                <motion.p
                  className="text-gray-600 flex items-center mt-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {providers.length} professionals available
                </motion.p>
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
                    {availableSkills.map((skill) => (
                      <option key={skill.skill} value={skill.skill}>
                        {skill.skill} ({skill.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range
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

                {/* Location */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter coordinates (lat, lng)"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    className="mb-3 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Radius (km)
                    </label>
                    <Input
                      type="number"
                      value={filters.radius}
                      onChange={(e) =>
                        handleFilterChange("radius", e.target.value)
                      }
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

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
                    <option value="rating">Rating</option>
                    <option value="totalReviews">Reviews</option>
                    <option value="totalJobs">Experience</option>
                    <option value="createdAt">Newest</option>
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
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button
                      onClick={fetchProviders}
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
                    <div className="mb-4">
                      <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">
                        No providers found matching your criteria.
                      </p>
                    </div>
                    <Button
                      onClick={clearFilters}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Clear Filters
                    </Button>
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

                  console.log(
                    `Provider ${provider._id} filtered services:`,
                    filteredServices
                  ); // Debug log

                  if (filteredServices.length === 0) {
                    console.log(
                      `No services found for provider ${provider.user?.name} with skill ${filters.skill}`
                    ); // Debug log
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
                                      <span className="text-sm text-gray-500 flex items-center">
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
                                  ₹{service.price || "N/A"}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="lg:ml-6 mt-6 lg:mt-0 flex flex-col space-y-3 lg:w-48">
                              <Button
                                onClick={() => handleBookNow(provider, service)}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Book Now
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 hover:bg-gray-50 transition-all duration-200"
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Contact
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/provider/${provider._id}`)
                                }
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
      </div>
    </div>
  );
};

export default ServicesPage;
