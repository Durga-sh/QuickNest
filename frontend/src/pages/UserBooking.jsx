import React, { useState, useEffect, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Phone,
  User,
  Star,
  Eye,
  Filter,
  RefreshCw,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock as ClockIcon,
  Mail,
  X,
  Send,
  MessageSquare,
  Award,
  Navigation,
} from "lucide-react";
import bookingApiService from "../api/booking";
import apiService from "../api/provider";
import reviewApiService from "../api/review";
import VoiceBookingButton, {
  VoiceBookingButtonPresets,
} from "../components/VoiceBookingButton";
import RealTimeTrackingMap from "../components/RealTimeTrackingMap";
import { getToken } from "../utils/tokenManager";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Check authentication on component mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError("Please log in to view your bookings");
      setLoading(false);
    }
  }, []);

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  const fetchBookings = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Fetching bookings...");

      const response = await bookingApiService.getUserBookings(
        pagination.page,
        pagination.limit
      );

      console.log("API Response:", response);

      // Handle different response structures
      let allBookings = [];
      if (response.bookings) {
        allBookings = response.bookings;
      } else if (Array.isArray(response)) {
        allBookings = response;
      } else if (response.data && Array.isArray(response.data)) {
        allBookings = response.data;
      }

      console.log("All bookings:", allBookings);

      // Check for existing reviews for each booking
      const bookingsWithReviewStatus = await Promise.all(
        allBookings.map(async (booking) => {
          try {
            const hasReview = await reviewApiService.hasReview(booking._id);
            return { ...booking, hasReview };
          } catch (error) {
            console.warn(
              `Unexpected error checking review for booking ${booking._id}:`,
              error
            );
            return { ...booking, hasReview: false };
          }
        })
      );

      let filteredBookings = bookingsWithReviewStatus;
      if (statusFilter !== "all") {
        filteredBookings = bookingsWithReviewStatus.filter(
          (booking) => booking.status === statusFilter
        );
      }

      setBookings(filteredBookings);

      // Handle pagination
      if (response.pagination) {
        setPagination(response.pagination);
      } else {
        setPagination((prev) => ({
          ...prev,
          total: bookingsWithReviewStatus.length,
          pages: Math.ceil(bookingsWithReviewStatus.length / pagination.limit),
        }));
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    // Only fetch if user is authenticated
    const token = getToken();
    if (token) {
      fetchBookings();
    }
  }, [fetchBookings]);

  const fetchProviderDetails = async (providerId) => {
    try {
      const provider = await apiService.getProviderById(providerId);
      setProviderDetails(provider);
    } catch (err) {
      console.error("Error fetching provider details:", err);
      setError("Failed to load provider details");
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    fetchProviderDetails(booking.provider._id);
    setShowDetailsModal(true);
  };

  const handleReviewClick = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    if (!reviewData.rating || reviewData.rating < 1) {
      alert("Please select a rating");
      return;
    }

    try {
      setSubmittingReview(true);

      // Submit review using the API service
      const response = await reviewApiService.submitReview({
        bookingId: selectedBooking._id,
        providerId: selectedBooking.provider._id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      console.log("Review submitted successfully:", response);

      // Update the booking to show it's been reviewed
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === selectedBooking._id
            ? { ...booking, hasReview: true }
            : booking
        )
      );

      setShowReviewModal(false);
      setReviewData({ rating: 0, comment: "" });
      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);
      alert(`Failed to submit review: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <TrendingUp className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const StarRating = ({ rating, onRatingChange, readOnly = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={() => !readOnly && onRatingChange(star)}
            className={`${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            } ${!readOnly ? "hover:text-yellow-400 cursor-pointer" : ""}`}
            whileHover={!readOnly ? { scale: 1.1 } : {}}
            whileTap={!readOnly ? { scale: 0.9 } : {}}
            disabled={readOnly}
          >
            <Star className="w-6 h-6 fill-current" />
          </motion.button>
        ))}
      </div>
    );
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-emerald-400 opacity-20"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-3xl font-bold text-gray-900 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                My Bookings
              </motion.h1>
              <motion.p
                className="text-gray-600 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
                Track and manage your service bookings
              </motion.p>
            </div>
            <motion.button
              onClick={fetchBookings}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-emerald-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
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
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </p>
          </motion.div>
        )}

        {/* Bookings List */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {bookings.length === 0 ? (
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-12 text-center"
              variants={itemVariants}
            >
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === "all"
                  ? "You haven't made any bookings yet."
                  : `No ${statusFilter} bookings found.`}
              </p>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm">Error: {error}</p>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Debug: Loading={loading.toString()}, Error={error || "none"},
                Filter={statusFilter}
              </div>
            </motion.div>
          ) : (
            bookings
              .filter((booking) => booking && booking._id && booking.service)
              .map((booking) => (
                <motion.div
                  key={booking._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-2xl font-semibold text-gray-900">
                            {booking.service}
                          </h3>
                          <motion.span
                            className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center space-x-2 ${getStatusColor(
                              booking.status
                            )}`}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            {getStatusIcon(booking.status)}
                            <span>
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </span>
                          </motion.span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Booking ID: {booking.bookingId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-emerald-600">
                          {formatPrice(booking.servicePrice)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {booking.paymentDetails.status === "completed"
                            ? "Paid"
                            : "Payment Pending"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* Provider Info */}
                      <motion.div
                        className="col-span-2 flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-gray-900">
                              {booking.provider?.user?.name || "Provider"}
                            </p>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">
                                {booking.provider?.rating?.toFixed(1) || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">
                              {booking.provider?.user?.email ||
                                "No email provided"}
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Date & Time */}
                      <motion.div
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Calendar className="h-6 w-6 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatDate(booking.bookingDate)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTime(booking.timeSlot.start)} -{" "}
                            {formatTime(booking.timeSlot.end)}
                          </p>
                        </div>
                      </motion.div>

                      {/* Contact */}
                      <motion.div
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Phone className="h-6 w-6 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Contact</p>
                          <p className="text-sm text-gray-600">
                            {booking.contactPhone}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Address */}
                    <motion.div
                      className="flex items-start space-x-4 mb-6 p-4 bg-gray-50 rounded-xl"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MapPin className="h-6 w-6 text-emerald-600 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Service Address
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.address}
                        </p>
                      </div>
                    </motion.div>

                    {/* Special Instructions */}
                    {booking.specialInstructions && (
                      <motion.div
                        className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="font-semibold text-gray-900 text-sm mb-2">
                          Special Instructions:
                        </p>
                        <p className="text-gray-700 text-sm">
                          {booking.specialInstructions}
                        </p>
                      </motion.div>
                    )}

                    {/* Real-time Tracking for In-Progress Bookings */}
                    {booking.status === "in-progress" && (
                      <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Navigation className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-900">
                              Live Provider Tracking
                            </h4>
                          </div>
                          <p className="text-blue-800 text-sm">
                            Track your service provider's location in real-time
                            as they make their way to you.
                          </p>
                        </div>
                        <RealTimeTrackingMap
                          bookingId={booking._id}
                          userLocation={
                            booking.coordinates?.latitude &&
                            booking.coordinates?.longitude
                              ? {
                                  lat: booking.coordinates.latitude,
                                  lng: booking.coordinates.longitude,
                                }
                              : null
                          }
                          onTrackingError={(error) => {
                            // Silently handle tracking errors for better UX
                            console.warn(
                              "Tracking not available:",
                              error.message
                            );
                          }}
                        />
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <p className="text-gray-500 text-sm">
                        Booked on {formatDate(booking.createdAt)}
                      </p>
                      <div className="flex space-x-3">
                        <motion.button
                          onClick={() => handleViewDetails(booking)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm flex items-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </motion.button>
                        {/* Allow reviews only for completed bookings */}
                        {booking.status === "completed" &&
                          !booking.hasReview && (
                            <motion.button
                              onClick={() => handleReviewClick(booking)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 text-sm flex items-center shadow-md"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Give Review
                            </motion.button>
                          )}
                        {/* Show if review already exists */}
                        {booking.hasReview && (
                          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Review Submitted
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
          )}
        </motion.div>

        {/* Pagination */}
        {bookings.length > 0 && pagination.pages > 1 && (
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                Showing {bookings.length} of {pagination.total} bookings
              </p>
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Previous
                </motion.button>
                <span className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg">
                  {pagination.page} of {pagination.pages}
                </span>
                <motion.button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Rate Your Experience
                  </h3>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedBooking?.provider?.user?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedBooking?.service}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rating *
                  </label>
                  <StarRating
                    rating={reviewData.rating}
                    onRatingChange={(rating) =>
                      setReviewData({ ...reviewData, rating })
                    }
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Review
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, comment: e.target.value })
                    }
                    placeholder="Share your experience with this provider..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={4}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleReviewSubmit}
                    disabled={submittingReview || !reviewData.rating}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submittingReview ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Voice Booking Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <VoiceBookingButtonPresets.FloatingButton />
      </div>

      {/* Provider Details Modal */}
      <AnimatePresence>
        {showDetailsModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Provider Details
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {providerDetails ? (
                  <div className="space-y-6">
                    {/* Provider Header */}
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900">
                          {providerDetails.user?.name || "Provider Name"}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">
                              {providerDetails.rating?.toFixed(1) || "N/A"}(
                              {providerDetails.reviewCount || 0} reviews)
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Award className="h-4 w-4" />
                            <span>
                              {providerDetails.yearsOfExperience || 0} years
                              exp.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-emerald-600" />
                        Contact Information
                      </h5>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {providerDetails.user?.email || "No email provided"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {providerDetails.user?.phone ||
                              selectedBooking?.contactPhone ||
                              "No phone provided"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                        Location
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Service Area:</span>{" "}
                            {providerDetails.serviceAreas?.join(", ") ||
                              "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Address:</span>{" "}
                            {providerDetails.address || "Not provided"}
                          </p>
                        </div>
                        {providerDetails.location?.coordinates && (
                          <motion.button
                            className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                            whileHover={{ scale: 1.02 }}
                            onClick={() => {
                              const [lng, lat] =
                                providerDetails.location.coordinates;
                              window.open(
                                `https://www.google.com/maps?q=${lat},${lng}`,
                                "_blank"
                              );
                            }}
                          >
                            <Navigation className="h-4 w-4" />
                            <span>View on Map</span>
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-emerald-600" />
                        Services Offered
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {providerDetails.services &&
                        providerDetails.services.length > 0 ? (
                          providerDetails.services.map((service, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded-lg border border-gray-200"
                            >
                              <p className="font-medium text-gray-900 text-sm">
                                {service.name || service}
                              </p>
                              {service.price && (
                                <p className="text-emerald-600 text-sm font-semibold">
                                  {formatPrice(service.price)}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm col-span-2">
                            No services listed
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {providerDetails.skills &&
                      providerDetails.skills.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h5 className="font-semibold text-gray-900 mb-3">
                            Skills & Expertise
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {providerDetails.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Bio/Description */}
                    {providerDetails.bio && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h5 className="font-semibold text-gray-900 mb-3">
                          About
                        </h5>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {providerDetails.bio}
                        </p>
                      </div>
                    )}

                    {/* Booking Details */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                        Your Booking Details
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Service:</p>
                          <p className="font-medium text-gray-900">
                            {selectedBooking?.service}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date:</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(selectedBooking?.bookingDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Time:</p>
                          <p className="font-medium text-gray-900">
                            {formatTime(selectedBooking?.timeSlot.start)} -{" "}
                            {formatTime(selectedBooking?.timeSlot.end)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status:</p>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              selectedBooking?.status
                            )}`}
                          >
                            {selectedBooking?.status?.charAt(0).toUpperCase() +
                              selectedBooking?.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-emerald-200">
                        <p className="text-gray-600 text-sm">
                          Service Address:
                        </p>
                        <p className="font-medium text-gray-900 text-sm">
                          {selectedBooking?.address}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <motion.button
                        onClick={() => setShowDetailsModal(false)}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Close
                      </motion.button>
                      {selectedBooking?.provider?.user?.phone && (
                        <motion.button
                          onClick={() => {
                            window.open(
                              `tel:${selectedBooking.provider.user.phone}`
                            );
                          }}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Provider
                        </motion.button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">
                        Loading provider details...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserBookings;
