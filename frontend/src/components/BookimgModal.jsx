// Hyperlocal Service Marketplace/src/components/BookingModal.jsx
import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  CreditCard,
} from "lucide-react";
import bookingApiService from "../api/booking";

const BookingModal = ({ provider, isOpen, onClose, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    service: "",
    servicePrice: 0,
    bookingDate: "",
    timeSlot: { start: "", end: "" },
    address: "",
    coordinates: { latitude: "", longitude: "" },
    contactPhone: "",
    specialInstructions: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !provider) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleServiceChange = (e) => {
    const selectedService = provider.pricing.find(
      (p) => p.service === e.target.value
    );
    setFormData((prev) => ({
      ...prev,
      service: e.target.value,
      servicePrice: selectedService ? selectedService.price : 0,
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (orderData) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error("Razorpay SDK failed to load");
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Service Marketplace",
        description: `Payment for ${formData.service}`,
        order_id: orderData.orderId,
        handler: function (response) {
          resolve({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: orderData.bookingId,
          });
        },
        prefill: {
          name: provider.user?.name || "",
          email: provider.user?.email || "",
          contact: formData.contactPhone,
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled by user"));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      if (
        !formData.service ||
        !formData.bookingDate ||
        !formData.timeSlot.start
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Create order
      console.log("Provider ID:", provider._id);
      const bookingData = {
        providerId: provider._id,
        ...formData,
      };
      console.log("Booking Data:", bookingData);

      const orderResponse = await bookingApiService.createOrder(bookingData);

      // Open Razorpay payment
      const paymentResponse = await handlePayment(orderResponse);

      // Verify payment
      const verificationResponse = await bookingApiService.verifyPayment(
        paymentResponse
      );

      if (verificationResponse.success) {
        onBookingSuccess(verificationResponse.booking);
        onClose();
      }
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Book Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Provider Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                {provider.user?.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {provider.location.address}
              </p>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Select Service *
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleServiceChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a service</option>
                {provider.pricing?.map((service, index) => (
                  <option key={index} value={service.service}>
                    {service.service} - {formatPrice(service.price)}
                  </option>
                ))}
              </select>
              {formData.servicePrice > 0 && (
                <p className="mt-2 text-lg font-semibold text-green-600">
                  Total: {formatPrice(formData.servicePrice)}
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Booking Date *
                </label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleInputChange}
                  min={today}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Time Slot *
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    name="timeSlot.start"
                    value={formData.timeSlot.start}
                    onChange={handleInputChange}
                    required
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    name="timeSlot.end"
                    value={formData.timeSlot.end}
                    onChange={handleInputChange}
                    required
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Service Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="Enter complete address where service is required"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Contact Phone *
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
                placeholder="Your contact number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any special requirements or instructions"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading || !formData.service || formData.servicePrice === 0
              }
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <CreditCard className="h-5 w-5 mr-2" />
              )}
              {loading
                ? "Processing..."
                : `Pay ${formatPrice(formData.servicePrice)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
