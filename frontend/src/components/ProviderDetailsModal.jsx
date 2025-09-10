import React from "react";
import {
  X,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  User,
  Award,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { Button } from "./ui/button";

const ProviderDetailsModal = ({
  provider,
  isOpen,
  onClose,
  onBookNow,
  onContact,
}) => {
  if (!isOpen || !provider) return null;

  const formatAvailability = (availability) => {
    if (!availability || availability.length === 0) return "Not specified";
    return availability
      .map((slot) => {
        const timeSlots = slot.timeSlots
          ?.map((time) => `${time.start}-${time.end}`)
          .join(", ");
        return `${slot.day}: ${timeSlots || "Not specified"}`;
      })
      .join(" | ");
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                {provider.user?.name || "Provider Name"}
              </h2>
              <p className="text-blue-100 mb-2">
                {provider.user?.email || "No email provided"}
              </p>
              <div className="flex items-center space-x-1">
                {renderStars(provider.rating || 0)}
                <span className="ml-2 text-sm">
                  {provider.rating?.toFixed(1) || "0.0"} (
                  {provider.totalReviews || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {provider.user?.phone || "No phone number"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {provider.user?.email || "No email"}
                </span>
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {provider.location?.address || "Location not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Skills & Expertise */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {provider.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Services & Pricing */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
              Services & Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {provider.pricing?.map((service, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">
                      {service.service}
                    </h4>
                    <span className="text-lg font-bold text-green-600">
                      ₹{service.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          {provider.availability && provider.availability.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Availability
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {formatAvailability(provider.availability)}
                </p>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {provider.reviews && provider.reviews.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Recent Reviews
              </h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {provider.reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      - {review.user?.name || "Anonymous"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={() => onBookNow(provider)}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Now
            </Button>
            <Button
              variant="outline"
              onClick={() => onContact(provider)}
              className="flex-1 border-2 hover:bg-gray-50 transition-all duration-200"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact Provider
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 hover:bg-gray-50 transition-all duration-200"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsModal;
