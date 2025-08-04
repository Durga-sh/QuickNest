import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  Mail,
  Calendar,
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
    const [showBookingModal, setShowBookingModal] = useState(false); // New state for BookingModal
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

      const response = await apiService.getAllProviders(filterParams);
      setProviders(response.data || []);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError(err.message || "Failed to fetch providers");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (provider) => {
      setSelectedProviderForBooking(provider);
      setShowBookingModal(true);
    };

  // Fetch available skills for filter dropdown
  const fetchAvailableSkills = async () => {
    try {
      const response = await apiService.getAvailableSkills();
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

  // Handle provider bookin

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCategory
                    ? `${selectedCategory} Services`
                    : "Find Services"}
                </h1>
                <p className="text-gray-600">
                  {providers.length} professionals available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button onClick={handleSearch} size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Service Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter coordinates (lat, lng)"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                  />
                  <div className="mt-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      Radius (km)
                    </label>
                    <Input
                      type="number"
                      value={filters.radius}
                      onChange={(e) =>
                        handleFilterChange("radius", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
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

                <Button onClick={applyFilters} className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchProviders} className="mt-4">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : providers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">
                    No providers found matching your criteria.
                  </p>
                  <Button onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {providers.map((provider) => (
                  <Card
                    key={provider._id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="lg:flex lg:items-start lg:justify-between">
                        <div className="flex-1">
                          {/* Provider Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {provider.user?.name || "Professional"}
                              </h3>
                              <div className="flex items-center mt-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.floor(provider.rating)
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-2 text-sm text-gray-600">
                                    {provider.rating?.toFixed(1) || "0.0"} (
                                    {provider.totalReviews || 0} reviews)
                                  </span>
                                </div>
                                {provider.distance && (
                                  <span className="ml-4 text-sm text-gray-500">
                                    {formatDistance(provider.distance)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {provider.totalJobs || 0} jobs completed
                            </Badge>
                          </div>

                          {/* Skills */}
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {provider.skills?.map((skill, index) => (
                                <Badge key={index} variant="outline">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center mb-3">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {provider.location?.address ||
                                "Location not specified"}
                            </span>
                          </div>

                          {/* Availability */}
                          <div className="flex items-center mb-3">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formatAvailability(provider.availability)}
                            </span>
                          </div>

                          {/* Pricing */}
                          <div className="mb-4">
                            <div className="flex items-center mb-2">
                              <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-sm font-medium text-gray-700">
                                Services & Pricing:
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {provider.pricing
                                ?.slice(0, 4)
                                .map((service, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-gray-600">
                                      {service.service}
                                    </span>
                                    <span className="font-medium">
                                      ₹{service.price}
                                    </span>
                                  </div>
                                ))}
                              {provider.pricing?.length > 4 && (
                                <div className="text-sm text-gray-500">
                                  +{provider.pricing.length - 4} more services
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="lg:ml-6 mt-4 lg:mt-0 flex flex-col space-y-2 lg:w-48">
                          <Button
                            onClick={() => handleBookNow(provider)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Now
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/provider/${provider._id}`)
                            }
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <BookingModal
              provider={selectedProviderForBooking}
              isOpen={showBookingModal}
              onClose={() => setShowBookingModal(false)}
              onBookingSuccess={(booking) => {
                console.log("Booking successful:", booking);
                setShowBookingModal(false); // Close modal on success
                // Optionally refresh providers or show a success message
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
