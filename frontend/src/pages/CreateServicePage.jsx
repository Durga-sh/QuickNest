import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Plus,
  Minus,
  MapPin,
  Clock,
  DollarSign,
  User,
  Navigation,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import apiService from "../api/provider";
import { useNavigate } from "react-router-dom";

// Define available service types for dropdowns
const serviceTypes = [
  "Plumbing",
  "Electrical Work",
  "HVAC",
  "Carpentry",
  "Painting",
  "Beauty Services",
  "Cleaning",
  "Gardening",
  "Appliance Repair",
  "Pest Control",
];

// Replace with your actual Google Geocoding API key
const GOOGLE_API_KEY = "AIzaSyCDm-q6ndRI_Sm40AWx8y3E7tDtMiigjxo";

const CreateServicePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    skills: [""],
    location: {
      coordinates: ["", ""],
      address: "",
    },
    pricing: [{ service: "", price: "" }],
    availability: [{ day: "Monday", from: "", to: "" }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [geolocationError, setGeolocationError] = useState("");
  const autocompleteRef = useRef(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteRef.current,
          { types: ["address"] }
        );
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            setFormData((prev) => ({
              ...prev,
              location: {
                coordinates: [
                  place.geometry.location.lng().toString(),
                  place.geometry.location.lat().toString(),
                ],
                address: place.formatted_address,
              },
            }));
            setGeolocationError("");
          } else {
            setError("Please select a valid address from the suggestions");
          }
        });
      } else {
        setError("Google Maps API failed to load. Please try again later.");
      }
    };

    loadGoogleScript();

    return () => {
      // Clean up script
      const scripts = document.querySelectorAll(
        'script[src*="maps.googleapis.com"]'
      );
      scripts.forEach((script) => script.remove());
    };
  }, []);

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to create a provider profile.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Handle getting current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: [longitude.toString(), latitude.toString()],
            },
          }));
          setGeolocationError("");
          // Fetch address using reverse geocoding
          fetchAddressFromCoordinates(latitude, longitude);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setGeolocationError("Permission to access location was denied.");
              break;
            case error.POSITION_UNAVAILABLE:
              setGeolocationError("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setGeolocationError("The request to get location timed out.");
              break;
            default:
              setGeolocationError("An unknown error occurred.");
              break;
          }
        }
      );
    } else {
      setGeolocationError("Geolocation is not supported by this browser.");
    }
  };

  // Fetch address using reverse geocoding with Geocoding API
  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results[0]) {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            address: data.results[0].formatted_address,
          },
        }));
      } else {
        setGeolocationError("Unable to fetch address for the location.");
      }
    } catch (err) {
      setGeolocationError("Error fetching address. Please try again.");
    }
  };

  const handleInputChange = (field, value, index = null, subField = null) => {
    setFormData((prev) => {
      const newData = { ...prev };
      if (field === "skills") {
        newData.skills[index] = value;
      } else if (field === "location") {
        if (subField === "coordinates") {
          newData.location.coordinates[index] = value;
        } else {
          newData.location[subField] = value;
        }
      } else if (field === "pricing") {
        newData.pricing[index][subField] = value;
      } else if (field === "availability") {
        newData.availability[index][subField] = value;
      }
      return newData;
    });
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  const removeSkill = (index) => {
    if (formData.skills.length > 1) {
      setFormData((prev) => ({
        ...prev,
        skills: prev.skills.filter((_, i) => i !== index),
      }));
    }
  };

  const addPricing = () => {
    setFormData((prev) => ({
      ...prev,
      pricing: [...prev.pricing, { service: "", price: "" }],
    }));
  };

  const removePricing = (index) => {
    if (formData.pricing.length > 1) {
      setFormData((prev) => ({
        ...prev,
        pricing: prev.pricing.filter((_, i) => i !== index),
      }));
    }
  };

  const addAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, { day: "Monday", from: "", to: "" }],
    }));
  };

  const removeAvailability = (index) => {
    if (formData.availability.length > 1) {
      setFormData((prev) => ({
        ...prev,
        availability: prev.availability.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    setError("");
    const hasValidSkills = formData.skills.some((skill) => skill.trim() !== "");
    if (!hasValidSkills) {
      setError("Please select at least one skill");
      return false;
    }
    if (!formData.location.address.trim()) {
      setError("Please enter or select an address");
      return false;
    }
    if (
      !formData.location.coordinates[0] ||
      !formData.location.coordinates[1]
    ) {
      setError("Please enter or fetch both longitude and latitude coordinates");
      return false;
    }
    const hasValidPricing = formData.pricing.some(
      (p) => p.service.trim() && p.price
    );
    if (!hasValidPricing) {
      setError("Please select at least one service with pricing");
      return false;
    }
    const hasValidAvailability = formData.availability.some(
      (a) => a.from && a.to
    );
    if (!hasValidAvailability) {
      setError("Please add at least one availability time slot");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const serviceData = {
        userId: user.id,
        skills: formData.skills.filter((skill) => skill.trim() !== ""),
        location: {
          coordinates: [
            parseFloat(formData.location.coordinates[0]),
            parseFloat(formData.location.coordinates[1]),
          ],
          address: formData.location.address,
        },
        pricing: formData.pricing
          .filter((p) => p.service.trim() && p.price)
          .map((p) => ({
            service: p.service,
            price: parseFloat(p.price),
          })),
        availability: formData.availability
          .filter((a) => a.from && a.to)
          .map((a) => ({
            day: a.day,
            from: a.from,
            to: a.to,
          })),
      };
      console.log("Service data being sent:", serviceData);
      const response = await apiService.registerProvider(serviceData);
      console.log("Provider registration response:", response);
      if (response.success) {
        setSuccess(
          "Provider profile created successfully! Awaiting admin approval."
        );
        setTimeout(() => {
          navigate("/provider-dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating service:", error);
      setError(error.message || "Error creating service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Create Provider Service
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Provider Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              Register as a Service Provider
            </h2>
            <p className="text-blue-100 mt-2">
              Fill out the form below to create your provider profile
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}
          {geolocationError && (
            <div className="mx-8 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">{geolocationError}</p>
            </div>
          )}

          {/* Form Body */}
          <div className="px-8 py-8 space-y-8">
            {/* Skills Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Skills & Expertise
                </h3>
                <span className="text-red-500 text-sm">*</span>
              </div>
              <p className="text-gray-600 text-sm ml-10">
                Select your professional skills and areas of expertise
              </p>
              <div className="ml-10 space-y-3">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <select
                      value={skill}
                      onChange={(e) =>
                        handleInputChange("skills", e.target.value, index)
                      }
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" disabled>
                        Select a skill
                      </option>
                      {serviceTypes.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeSkill(index)}
                      disabled={formData.skills.length === 1}
                      className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSkill}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Another Skill</span>
                </button>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                    2
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Service Location
                </h3>
                <span className="text-red-500 text-sm">*</span>
              </div>
              <p className="text-gray-600 text-sm ml-10">
                Specify your service area and location coordinates
              </p>
              <div className="ml-10 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Service Address
                  </label>
                  <input
                    type="text"
                    ref={autocompleteRef}
                    value={formData.location.address}
                    onChange={(e) =>
                      handleInputChange(
                        "location",
                        e.target.value,
                        null,
                        "address"
                      )
                    }
                    placeholder="123 Main Street, City, State, ZIP Code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleGetCurrentLocation}
                    className="mt-2 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Use Current Location</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.location.coordinates[0]}
                      onChange={(e) =>
                        handleInputChange(
                          "location",
                          e.target.value,
                          0,
                          "coordinates"
                        )
                      }
                      placeholder="72.8777"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.location.coordinates[1]}
                      onChange={(e) =>
                        handleInputChange(
                          "location",
                          e.target.value,
                          1,
                          "coordinates"
                        )
                      }
                      placeholder="19.0760"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">
                    3
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Services & Pricing
                </h3>
                <span className="text-red-500 text-sm">*</span>
              </div>
              <p className="text-gray-600 text-sm ml-10">
                Select your services and their respective prices
              </p>
              <div className="ml-10 space-y-4">
                {formData.pricing.map((pricing, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Name
                        </label>
                        <select
                          value={pricing.service}
                          onChange={(e) =>
                            handleInputChange(
                              "pricing",
                              e.target.value,
                              index,
                              "service"
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" disabled>
                            Select a service
                          </option>
                          {serviceTypes.map((service) => (
                            <option key={service} value={service}>
                              {service}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <DollarSign className="h-4 w-4 inline mr-1" />
                          Price
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={pricing.price}
                            onChange={(e) =>
                              handleInputChange(
                                "pricing",
                                e.target.value,
                                index,
                                "price"
                              )
                            }
                            placeholder="400"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => removePricing(index)}
                            disabled={formData.pricing.length === 1}
                            className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addPricing}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Another Service</span>
                </button>
              </div>
            </div>

            {/* Availability Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">
                    4
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Availability Schedule
                </h3>
                <span className="text-red-500 text-sm">*</span>
              </div>
              <p className="text-gray-600 text-sm ml-10">
                Set your working hours for each day
              </p>
              <div className="ml-10 space-y-4">
                {formData.availability.map((avail, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Day
                        </label>
                        <select
                          value={avail.day}
                          onChange={(e) =>
                            handleInputChange(
                              "availability",
                              e.target.value,
                              index,
                              "day"
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ].map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="h-4 w-4 inline mr-1" />
                          From Time
                        </label>
                        <input
                          type="time"
                          value={avail.from}
                          onChange={(e) =>
                            handleInputChange(
                              "availability",
                              e.target.value,
                              index,
                              "from"
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          To Time
                        </label>
                        <input
                          type="time"
                          value={avail.to}
                          onChange={(e) =>
                            handleInputChange(
                              "availability",
                              e.target.value,
                              index,
                              "to"
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <button
                          onClick={() => removeAvailability(index)}
                          disabled={formData.availability.length === 1}
                          className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addAvailability}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Another Day</span>
                </button>
              </div>
            </div>

            {/* Submit Section */}
            <div className="border-t pt-8">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Profile...
                    </>
                  ) : (
                    "Create Provider Profile"
                  )}
                </button>
                <button
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Your profile will be reviewed by our admin team before approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateServicePage;
