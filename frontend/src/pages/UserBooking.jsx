// Hyperlocal Service Marketplace/src/pages/UserBookings.jsx
import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
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
} from "lucide-react";
import bookingApiService from "../api/booking";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
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

  useEffect(() => {
    fetchBookings();
  }, [pagination.page, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await bookingApiService.getUserBookings(
        pagination.page,
        pagination.limit
      );

      let filteredBookings = response.bookings;
      if (statusFilter !== "all") {
        filteredBookings = response.bookings.filter(
          (booking) => booking.status === statusFilter
        );
      }

      setBookings(filteredBookings);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
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
              <p className="text-gray-600">
                {statusFilter === "all"
                  ? "You haven't made any bookings yet."
                  : `No ${statusFilter} bookings found.`}
              </p>
            </motion.div>
          ) : (
            bookings.map((booking) => (
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Provider Info */}
                    <motion.div
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
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
                      <p className="text-sm text-gray-600">{booking.address}</p>
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

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm">
                      Booked on {formatDate(booking.createdAt)}
                    </p>
                    <div className="flex space-x-3">
                      <motion.button
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </motion.button>
                      {booking.status === "completed" && !booking.rating && (
                        <motion.button
                          className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-all duration-200 text-sm flex items-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Rate Service
                        </motion.button>
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
    </div>
  );
};

export default UserBookings;
