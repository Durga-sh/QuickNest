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
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toString();
        const lon = position.coords.longitude.toString();
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch address");
          }
          const data = await response.json();
          if (data.error) {
            throw new Error(data.error.message || "Address not found");
          }
          setFormData((prev) => ({
            ...prev,
            address: data.display_name || "",
            coordinates: { latitude: lat, longitude: lon },
          }));
        } catch (err) {
          setError(`Failed to get address: ${err.message}`);
          setFormData((prev) => ({
            ...prev,
            coordinates: { latitude: lat, longitude: lon },
          }));
        }
      },
      (err) => {
        setError(`Location access error: ${err.message}`);
      }
    );
  };
  const timeSlots = [
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
    "17:00-18:00",
  ];
  const handleTimeSlotChange = (e) => {
    const [start, end] = e.target.value.split("-");
    setFormData((prev) => ({
      ...prev,
      timeSlot: { start, end },
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
      if (
        !formData.service ||
        !formData.bookingDate ||
        !formData.timeSlot.start ||
        !formData.timeSlot.end
      ) {
        throw new Error("Please fill in all required fields");
      }
      console.log("Provider ID:", provider._id);
      const bookingData = {
        providerId: provider._id,
        ...formData,
      };
      console.log("Booking Data:", bookingData);
      const orderResponse = await bookingApiService.createOrder(bookingData);
      const paymentResponse = await handlePayment(orderResponse);
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
  const selectedTimeSlot =
    formData.timeSlot.start && formData.timeSlot.end
      ? `${formData.timeSlot.start}-${formData.timeSlot.end}`
      : "";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Book Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        {}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            {}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                {provider.user?.name}
              </h3>
            </div>
            {}
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
            {}
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
                <select
                  name="timeSlot"
                  value={selectedTimeSlot}
                  onChange={handleTimeSlotChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {}
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
              <button
                type="button"
                onClick={getCurrentLocation}
                className="mt-2 bg-blue-100 text-blue-600 py-1 px-3 rounded hover:bg-blue-200 transition-colors"
              >
                Use Current Location
              </button>
            </div>
            {}
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
            {}
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
            {}
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
