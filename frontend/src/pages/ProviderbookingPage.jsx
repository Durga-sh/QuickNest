import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowLeft,
  User,
  FileText,
  AlertCircle,
  Star,
  Eye,
} from "lucide-react";
import bookingApiService from "../api/booking";

const ProviderBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingBooking, setUpdatingBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApiService.getProviderBookings(
        currentPage,
        10
      );
      setBookings(response.bookings || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingBooking(bookingId);
      await bookingApiService.updateBookingStatus(bookingId, newStatus);

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      // Show success message
      alert(`Booking ${newStatus} successfully!`);
    } catch (err) {
      console.error("Error updating booking:", err);
      alert(err.message || "Failed to update booking status");
    } finally {
      setUpdatingBooking(null);
    }
  };

  const canCompleteBooking = (booking) => {
    const today = new Date();
    const bookingDate = new Date(booking.bookingDate);

    // Set both dates to midnight for date-only comparison
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    return (
      booking.status === "confirmed" && today.getTime() >= bookingDate.getTime()
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const openLocationInMaps = (address, coordinates) => {
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      const url = `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
      window.open(url, "_blank");
    } else if (address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/provider-dashboard")}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Bookings
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-white/20">
          <div className="flex flex-wrap gap-3">
            {[
              "all",
              "pending",
              "confirmed",
              "in-progress",
              "completed",
              "cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filter === status
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all"
                  ? "All Bookings"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== "all" && (
                  <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                    {bookings.filter((b) => b.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-white/20">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500">
              {filter === "all"
                ? "You don't have any bookings yet."
                : `You don't have any ${filter} bookings.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {booking.service}
                      </h3>
                      <p className="text-gray-600">
                        Booking ID: {booking.bookingId || booking._id.slice(-8)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${booking.servicePrice}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <User className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.user?.name || "Customer"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-600" />
                      <p className="text-gray-700">{booking.contactPhone}</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Date & Time */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold text-gray-900">
                          Date
                        </span>
                      </div>
                      <p className="text-gray-700 ml-7">
                        {formatDate(booking.bookingDate)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-purple-500" />
                        <span className="font-semibold text-gray-900">
                          Time
                        </span>
                      </div>
                      <p className="text-gray-700 ml-7">
                        {formatTime(booking.timeSlot.start)} -{" "}
                        {formatTime(booking.timeSlot.end)}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-red-500" />
                        <span className="font-semibold text-gray-900">
                          Location
                        </span>
                      </div>
                      <p className="text-gray-700 ml-7 mb-2">
                        {booking.address}
                      </p>
                      <button
                        onClick={() =>
                          openLocationInMaps(
                            booking.address,
                            booking.coordinates
                          )
                        }
                        className="ml-7 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View on Map</span>
                      </button>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-gray-900">
                          Payment
                        </span>
                      </div>
                      <p className="text-gray-700 ml-7">
                        Status: {booking.paymentDetails?.status || "Pending"}
                      </p>
                      <p className="text-gray-700 ml-7">
                        Amount: ${booking.servicePrice}
                      </p>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {booking.specialInstructions && (
                    <div className="bg-blue-50/50 rounded-xl p-4 mb-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold text-gray-900">
                          Special Instructions
                        </span>
                      </div>
                      <p className="text-gray-700 ml-7">
                        {booking.specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "confirmed")
                          }
                          disabled={updatingBooking === booking._id}
                          className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          <CheckCircle className="h-5 w-5" />
                          <span>
                            {updatingBooking === booking._id
                              ? "Confirming..."
                              : "Confirm Booking"}
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "cancelled")
                          }
                          disabled={updatingBooking === booking._id}
                          className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          <XCircle className="h-5 w-5" />
                          <span>
                            {updatingBooking === booking._id
                              ? "Cancelling..."
                              : "Cancel Booking"}
                          </span>
                        </button>
                      </>
                    )}

                    {booking.status === "confirmed" && (
                      <>
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "in-progress")
                          }
                          disabled={updatingBooking === booking._id}
                          className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          <Clock className="h-5 w-5" />
                          <span>
                            {updatingBooking === booking._id
                              ? "Starting..."
                              : "Start Job"}
                          </span>
                        </button>

                        {canCompleteBooking(booking) && (
                          <button
                            onClick={() =>
                              updateBookingStatus(booking._id, "completed")
                            }
                            disabled={updatingBooking === booking._id}
                            className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>
                              {updatingBooking === booking._id
                                ? "Completing..."
                                : "Mark Complete"}
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "cancelled")
                          }
                          disabled={updatingBooking === booking._id}
                          className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          <XCircle className="h-5 w-5" />
                          <span>
                            {updatingBooking === booking._id
                              ? "Cancelling..."
                              : "Cancel"}
                          </span>
                        </button>
                      </>
                    )}

                    {booking.status === "in-progress" &&
                      canCompleteBooking(booking) && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "completed")
                          }
                          disabled={updatingBooking === booking._id}
                          className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          <CheckCircle className="h-5 w-5" />
                          <span>
                            {updatingBooking === booking._id
                              ? "Completing..."
                              : "Mark Complete"}
                          </span>
                        </button>
                      )}

                    {!canCompleteBooking(booking) &&
                      booking.status === "confirmed" && (
                        <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                          <AlertCircle className="h-4 w-4 inline mr-2" />
                          Can only complete on or after booking date
                        </div>
                      )}
                  </div>

                  {/* Booking Created Date */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Booking created:{" "}
                      {new Date(booking.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderBookings;
