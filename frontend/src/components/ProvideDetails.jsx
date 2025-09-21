import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Award,
  Users,
  CheckCircle,
} from "lucide-react";
import apiService from "../api/provider";
const ProviderDetailsModal = ({ providerId, isOpen, onClose }) => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  useEffect(() => {
    if (isOpen && providerId) {
      fetchProviderDetails();
    }
  }, [isOpen, providerId]);
  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getProviderById(providerId);
      setProvider(response.provider);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleBookingSuccess = (booking) => {
    setBookingSuccess(booking);
    setBookingModalOpen(false);
    setTimeout(() => {
      setBookingSuccess(null);
    }, 5000);
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Provider Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          {}
          {bookingSuccess && (
            <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-green-800 font-medium">
                    Booking Confirmed!
                  </p>
                  <p className="text-green-700 text-sm">
                    Booking ID: {bookingSuccess.bookingId}
                  </p>
                </div>
              </div>
            </div>
          )}
          {}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            ) : provider ? (
              <div className="p-4 space-y-6">
                {}
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-600">
                      {provider.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {provider.user?.name}
                    </h3>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="font-semibold">
                          {(provider.rating || 0).toFixed(1)}
                        </span>
                        <span className="text-gray-600">
                          ({provider.totalReviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span>{provider.totalJobs} jobs completed</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.location.address}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{provider.user?.email}</span>
                    </div>
                  </div>
                </div>
                {}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-600" />
                    Skills & Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    Services & Pricing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {provider.pricing.map((service, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg border"
                      >
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium text-gray-900">
                            {service.service}
                          </h5>
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(service.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    Availability Schedule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {provider.availability.map((schedule, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg border"
                      >
                        <h5 className="font-medium text-gray-900 mb-2">
                          {schedule.day}
                        </h5>
                        <div className="space-y-1">
                          {schedule.timeSlots.map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              className="text-sm text-gray-600"
                            >
                              {slot.start} - {slot.end}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-red-600" />
                    Location
                  </h4>
                  <div className="bg-gray-100 rounded-lg p-4 border">
                    <p className="text-gray-700 mb-2">
                      {provider.location.address}
                    </p>
                    <div className="text-sm text-gray-600">
                      <span>Coordinates: </span>
                      <span>
                        {provider.location.coordinates[1].toFixed(6)},{" "}
                        {provider.location.coordinates[0].toFixed(6)}
                      </span>
                    </div>
                    {}
                    <div className="mt-3 h-40 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">
                        Map integration goes here
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {}
          {provider && (
            <div className="border-t border-gray-200 p-2 mt-[-10px]">
              <div className="flex flex-col sm:flex-row gap-1 justify-center sm:justify-between">
                <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Provider
                </button>
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Service
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {}
      <BookingModal
        provider={provider}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </>
  );
};
export default ProviderDetailsModal;
