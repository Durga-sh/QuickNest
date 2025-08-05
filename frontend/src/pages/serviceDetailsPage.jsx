import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
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
  TrendingUp,
  Award,
  Users,
} from "lucide-react";
import apiService from "../api/provider";
import ProviderDetailsModal from "../components/ProvideDetails";
import BookingModal from "../components/BookimgModal";

const AllServicesPage = () => {
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
  const [filters, setFilters] = useState({
    skill: "",
    minPrice: "",
    maxPrice: "",
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

  // Fetch providers with current filters
  const fetchProviders = async (page = 1) => {
    try {
      setLoading(true);
      const filterParams = {
        ...filters,
        page,
        ...(selectedSkill && { skill: selectedSkill }),
      };

      const response = await apiService.getAllProviders(filterParams);
      setProviders(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available skills for filtering
  const fetchAvailableSkills = async () => {
    try {
      const response = await apiService.getAvailableSkills();
      setAvailableSkills(response.skills);
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  };

  // Search providers
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProviders(1);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchProviders(
        searchQuery,
        1,
        filters.limit
      );
      setProviders(response.data);
      setPagination(response.pagination);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      sortBy: "rating",
      sortOrder: "desc",
      limit: 12,
    });
    setSelectedSkill("");
    setSearchQuery("");
    setCurrentPage(1);
    fetchProviders(1);
  };

  // Handle skill filter change
  const handleSkillFilter = (skill) => {
    setSelectedSkill(skill);
    setCurrentPage(1);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  // Calculate distance in km
  const formatDistance = (distance) => {
    if (!distance) return null;
    return (distance / 1000).toFixed(1) + " km away";
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
  const handleBookNow = (provider) => {
    setSelectedProviderForBooking(provider);
    setShowBookingModal(true);
  };

  useEffect(() => {
    fetchProviders();
    fetchAvailableSkills();
  }, []);

  useEffect(() => {
    if (selectedSkill) {
      fetchProviders(1);
    }
  }, [selectedSkill]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-gray-900">All Services</h1>
              <p className="text-gray-600 mt-1">
                Discover professional service providers
              </p>
            </motion.div>
            <motion.div
              className="flex items-center space-x-2 text-sm text-gray-600"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Users className="h-5 w-5 text-emerald-600" />
              <span>{pagination.totalProviders || 0} Providers Available</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search providers, services, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <motion.button
                onClick={handleSearch}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Search
              </motion.button>
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-200 font-medium flex items-center space-x-2 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </motion.button>
            </div>
          </div>

          {/* Skill Filter Pills */}
          <motion.div
            className="mt-6 flex flex-wrap gap-3"
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

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              className="mt-8 p-6 bg-gray-50 rounded-xl border"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Service Type
                  </label>
                  <select
                    value={filters.skill}
                    onChange={(e) =>
                      handleFilterChange("skill", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="">All Services</option>
                    {availableSkills.map((skillData) => (
                      <option key={skillData.skill} value={skillData.skill}>
                        {skillData.skill}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    placeholder="10000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="rating">Rating</option>
                    <option value="totalReviews">Reviews</option>
                    <option value="totalJobs">Experience</option>
                    <option value="createdAt">Newest</option>
                  </select>
                </div>

                <div className="flex items-end space-x-3">
                  <motion.button
                    onClick={applyFilters}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Apply
                  </motion.button>
                  <motion.button
                    onClick={clearFilters}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-medium transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-red-700 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              {error}
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-pulse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <>
            {/* Providers Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {providers.map((provider) => (
                <motion.div
                  key={provider.id || provider._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className="p-8">
                    {/* Provider Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {provider.user?.name || "Unknown Provider"}
                            </h3>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">
                                {(provider.rating || 0).toFixed(1)} (
                                {provider.totalReviews || 0} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {provider.distance && (
                        <motion.span
                          className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {formatDistance(provider.distance)}
                        </motion.span>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {(provider.skills || [])
                          .slice(0, 3)
                          .map((skill, index) => (
                            <motion.span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              {skill}
                            </motion.span>
                          ))}
                        {(provider.skills || []).length > 3 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{(provider.skills || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-600 mb-6">
                      <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                      <span className="truncate">
                        {provider.location?.address || "Location not specified"}
                      </span>
                    </div>

                    {/* Services & Pricing */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Services & Pricing
                      </h4>
                      <div className="space-y-2">
                        {(provider.pricing || [])
                          .slice(0, 2)
                          .map((service, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg"
                            >
                              <span className="text-gray-600">
                                {service.service}
                              </span>
                              <span className="font-medium text-emerald-600">
                                {formatPrice(service.price)}
                              </span>
                            </div>
                          ))}
                        {(provider.pricing || []).length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{(provider.pricing || []).length - 2} more services
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-gray-600 mb-6">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-emerald-600" />
                        <span>{provider.totalJobs || 0} jobs completed</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                        <span>
                          Available {(provider.availability || []).length} days
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={() =>
                          handleViewDetails(provider.id || provider._id)
                        }
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Details
                      </motion.button>
                      <motion.button
                        onClick={() => handleContactProvider(provider)}
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Contact
                      </motion.button>
                      <motion.button
                        onClick={() => handleBookNow(provider)}
                        className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Book Now
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {providers.length === 0 && !loading && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    No providers found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or filters to find more
                    providers.
                  </p>
                  <motion.button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear Filters
                  </motion.button>
                </div>
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
          </>
        )}

        {/* Provider Details Modal */}
        <ProviderDetailsModal
          providerId={selectedProviderId}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedProviderId(null);
          }}
        />

        {/* Booking Modal */}
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

export default AllServicesPage;
