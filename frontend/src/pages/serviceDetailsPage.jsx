import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import apiService from "../api/provider";
import ProviderDetailsModal from "../components/ProvideDetails";

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
 useState(null); // Store selected provider for booking
  const [filters, setFilters] = useState({
    skill: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "rating",
    sortOrder: "desc",
    limit: 12,
  });

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">All Services</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4" />
              <span>{pagination.totalProviders || 0} Providers Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search providers, services, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Skill Filter Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleSkillFilter("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedSkill
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Services
            </button>
            {availableSkills.slice(0, 8).map((skillData) => (
              <button
                key={skillData.skill}
                onClick={() => handleSkillFilter(skillData.skill)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSkill === skillData.skill
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {skillData.skill} ({skillData.count})
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    value={filters.skill}
                    onChange={(e) =>
                      handleFilterChange("skill", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    placeholder="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rating">Rating</option>
                    <option value="totalReviews">Reviews</option>
                    <option value="totalJobs">Experience</option>
                    <option value="createdAt">Newest</option>
                  </select>
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Apply
                  </button>
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div
                  key={provider.id || provider._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border"
                >
                  <div className="p-6">
                    {/* Provider Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
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
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formatDistance(provider.distance)}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {(provider.skills || [])
                          .slice(0, 3)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                        {(provider.skills || []).length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{(provider.skills || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate">
                        {provider.location?.address || "Location not specified"}
                      </span>
                    </div>

                    {/* Services & Pricing */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Services & Pricing
                      </h4>
                      <div className="space-y-1">
                        {(provider.pricing || [])
                          .slice(0, 2)
                          .map((service, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-gray-600">
                                {service.service}
                              </span>
                              <span className="font-medium text-gray-900">
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
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>{provider.totalJobs || 0} jobs completed</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          Available {(provider.availability || []).length} days
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleViewDetails(provider.id || provider._id)
                        }
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleContactProvider(provider)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium text-sm transition-colors"
                      >
                        Contact
                      </button>
                      <button
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-medium text-sm transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {providers.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No providers found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters to find more
                    providers.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
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

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchProviders(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, i) => {
                        const pageNumber =
                          currentPage <= 3 ? i + 1 : currentPage + i - 2;

                        if (pageNumber > pagination.totalPages) return null;

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => fetchProviders(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              pageNumber === currentPage
                                ? "bg-blue-600 text-white"
                                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => fetchProviders(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
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
      </div>
    </div>
  );
};

export default AllServicesPage;
