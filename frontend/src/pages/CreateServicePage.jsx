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
  AlertCircle,
  CheckCircle,
  Info,
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
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const CreateServicePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [existingProvider, setExistingProvider] = useState(null);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
  const [demoMode, setDemoMode] = useState(true); // Toggle for demonstration
  const [formData, setFormData] = useState({
    skills: [""],
    location: {
      coordinates: ["", ""],
      address: "",
    },
    pricing: [{ service: "", price: "" }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [geolocationError, setGeolocationError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const autocompleteRef = useRef(null);

  // Check for existing provider profile on component mount
  useEffect(() => {
    const checkExistingProvider = async () => {
      if (!isAuthenticated) return;

      setIsLoadingProfile(true);
      try {
        const response = await apiService.getProviderProfile();
        if (response.success && response.provider) {
          setExistingProvider(response.provider);
          setIsAddingToExisting(true);
          // Pre-fill location data from existing profile
          setFormData((prev) => ({
            ...prev,
            location: response.provider.location,
          }));
        }
      } catch {
        // Provider profile doesn't exist, which is fine for new registrations
        console.log("No existing provider profile found");
        setExistingProvider(null);
        setIsAddingToExisting(false);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (demoMode) {
      checkExistingProvider();
    } else {
      setIsLoadingProfile(false);
    }
  }, [isAuthenticated, demoMode]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    // Mock Google Maps functionality for demonstration
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY") {
      console.log(
        "Google Maps API key not configured - using mock functionality"
      );
      return;
    }

    const loadGoogleScript = () => {
      // Check if script already exists
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        initAutocomplete();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      script.onerror = () => {
        setError("Google Maps API failed to load. Please try again later.");
      };
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (
        window.google &&
        window.google.maps &&
        window.google.maps.places &&
        autocompleteRef.current
      ) {
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
      }
    };

    if (!isLoadingProfile) {
      loadGoogleScript();
    }

    return () => {
      // Clean up script on unmount
      const scripts = document.querySelectorAll(
        'script[src*="maps.googleapis.com"]'
      );
      scripts.forEach((script) => script.remove());
    };
  }, [isLoadingProfile]);

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

  // Show loading state while checking for existing profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Handle getting current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setGeolocationError("Getting your location...");
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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      setGeolocationError("Geolocation is not supported by this browser.");
    }
  };

  // Fetch address using reverse geocoding
  const fetchAddressFromCoordinates = async (lat, lng) => {
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY") {
      // Mock address for demonstration
      const mockAddress = `${lat.toFixed(4)}, ${lng.toFixed(
        4
      )} (Mock Address - Configure Google API Key)`;
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          address: mockAddress,
        },
      }));
      setGeolocationError("");
      return;
    }

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
        setGeolocationError("");
      } else {
        setGeolocationError("Unable to fetch address for the location.");
      }
    } catch (err) {
      setGeolocationError("Error fetching address. Please try again.");
      console.error("Geocoding error:", err);
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
        // availability removed
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

  // availability removed

  // availability removed

  const validateForm = () => {
    setError("");
    const errors = [];

    // Validate skills
    const hasValidSkills = formData.skills.some((skill) => skill.trim() !== "");
    if (!hasValidSkills) {
      errors.push("Please select at least one skill");
    }

    // For existing providers, location validation is optional
    if (!isAddingToExisting) {
      if (!formData.location.address.trim()) {
        errors.push("Please enter or select an address");
      }
      if (
        !formData.location.coordinates[0] ||
        !formData.location.coordinates[1]
      ) {
        errors.push(
          "Please enter or fetch both longitude and latitude coordinates"
        );
      }

      // Validate coordinate ranges
      const lng = parseFloat(formData.location.coordinates[0]);
      const lat = parseFloat(formData.location.coordinates[1]);
      if (lng < -180 || lng > 180) {
        errors.push("Longitude must be between -180 and 180");
      }
      if (lat < -90 || lat > 90) {
        errors.push("Latitude must be between -90 and 90");
      }
    }

    // Validate pricing
    const hasValidPricing = formData.pricing.some(
      (p) => p.service.trim() && p.price
    );
    if (!hasValidPricing) {
      errors.push("Please select at least one service with pricing");
    }

    // Validate price values
    const invalidPrices = formData.pricing.filter(
      (p) => p.price && (isNaN(p.price) || parseFloat(p.price) <= 0)
    );
    if (invalidPrices.length > 0) {
      errors.push("All prices must be positive numbers");
    }

    // Availability validation removed

    if (errors.length > 0) {
      setError(errors.join(". "));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const serviceData = {
        userId: user.id,
        skills: formData.skills.filter((skill) => skill.trim() !== ""),
        pricing: formData.pricing
          .filter((p) => p.service.trim() && p.price)
          .map((p) => ({
            service: p.service,
            price: parseFloat(p.price),
          })),
        // availability removed
      };

      // Only include location for new provider registration
      if (!isAddingToExisting) {
        serviceData.location = {
          coordinates: [
            parseFloat(formData.location.coordinates[0]),
            parseFloat(formData.location.coordinates[1]),
          ],
          address: formData.location.address.trim(),
        };
      }

      console.log("Service data being sent:", serviceData);

      let response;
      if (isAddingToExisting) {
        // Add services to existing provider
        response = await apiService.addServicesToProvider(serviceData);
        setSuccess("✅ Services added to your provider profile successfully!");
      } else {
        // Create new provider profile
        response = await apiService.registerProvider(serviceData);
        setSuccess(
          "✅ Provider profile created successfully! Awaiting admin approval."
        );
      }

      console.log("Provider operation response:", response);

      if (response.success) {
        // Clear form on success
        setFormData({
          skills: [""],
          location: {
            coordinates: ["", ""],
            address: "",
          },
          pricing: [{ service: "", price: "" }],
          availability: [{ day: "Monday", from: "", to: "" }],
        });

        // Navigate after delay to show success message
        setTimeout(() => {
          navigate("/provider-dashboard");
        }, 3000);
      }
    } catch (error) {
      console.error("Error with provider operation:", error);
      setError(
        `❌ ${error.message || "Error processing request. Please try again."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const pageTitle = isAddingToExisting
    ? "Add New Services"
    : "Create Provider Service";
  const submitButtonText = isAddingToExisting
    ? "Add Services"
    : "Create Provider Profile";

  // Calculate form completion percentage
  const calculateFormProgress = () => {
    let completedSections = 0;
    const totalSections = 2; // skills, pricing (location is optional for existing providers)

    // Check skills section
    if (formData.skills.some((skill) => skill.trim() !== "")) {
      completedSections++;
    }

    // Check pricing section
    if (formData.pricing.some((p) => p.service.trim() && p.price)) {
      completedSections++;
    }

    // Availability section removed

    // Check location section (only for new providers)
    if (
      isAddingToExisting ||
      (formData.location.address &&
        formData.location.coordinates[0] &&
        formData.location.coordinates[1])
    ) {
      completedSections++;
    }

    return Math.round((completedSections / totalSections) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gradient-to-b from-gray-300 to-transparent"></div>
              <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {pageTitle}
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full border border-gray-200/50">
              <User className="h-4 w-4" />
              <span>Provider Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Mode Toggle */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6 shadow-xl shadow-blue-500/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Demo Mode</h3>
              <p className="text-xs text-gray-600 mt-1">
                Toggle to simulate different provider scenarios
              </p>
            </div>
            <button
              onClick={() => {
                setDemoMode(!demoMode);
                setError("");
                setSuccess("");
                setIsLoadingProfile(true);
                setTimeout(() => {
                  if (demoMode) {
                    setExistingProvider(null);
                    setIsAddingToExisting(false);
                  } else {
                    setExistingProvider({
                      user: { name: "John Doe", email: "john@example.com" },
                      skills: ["Plumbing", "Electrical Work"],
                      pricing: [
                        { service: "Plumbing", price: 50 },
                        { service: "Electrical Work", price: 75 },
                      ],
                    });
                    setIsAddingToExisting(true);
                  }
                  setIsLoadingProfile(false);
                }, 1000);
              }}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                demoMode
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              {demoMode ? "Demo Mode ON" : "Demo Mode OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden border border-white/20">
          {/* Form Header */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-8 py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white">
                {isAddingToExisting
                  ? "Add New Services to Your Profile"
                  : "Register as a Service Provider"}
              </h2>
              <p className="text-blue-100 mt-2">
                {isAddingToExisting
                  ? "Add more services and skills to expand your offerings"
                  : "Fill out the form below to create your provider profile"}
              </p>

              {/* Progress Indicator */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-white mb-3">
                  <span className="font-medium">Form Progress</span>
                  <span className="font-bold">
                    {calculateFormProgress()}% Complete
                  </span>
                </div>
                <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-white to-blue-100 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${calculateFormProgress()}%` }}
                  ></div>
                </div>
              </div>
              {isAddingToExisting && existingProvider && (
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2 text-white">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">
                      Existing Provider Profile Found
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-blue-100">
                    <p>Current Skills: {existingProvider.skills.join(", ")}</p>
                    <p>
                      Current Services:{" "}
                      {existingProvider.pricing
                        .map((p) => p.service)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mx-8 mt-6 p-6 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="mx-8 mt-6 p-6 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            </div>
          )}
          {geolocationError && (
            <div className="mx-8 mt-6 p-6 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/50 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Info className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-yellow-700 text-sm font-medium">
                  {geolocationError}
                </p>
              </div>
            </div>
          )}

          {/* Form Body */}
          <div className="px-8 py-8 space-y-8">
            {/* Skills Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isAddingToExisting
                    ? "Additional Skills & Expertise"
                    : "Skills & Expertise"}
                </h3>
                <span className="text-red-500 text-lg">*</span>
              </div>
              <p className="text-gray-600 text-sm ml-10">
                {isAddingToExisting
                  ? "Select additional skills to add to your existing profile"
                  : "Select your professional skills and areas of expertise"}
              </p>
              <div className="ml-10 space-y-3">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <select
                      value={skill}
                      onChange={(e) =>
                        handleInputChange("skills", e.target.value, index)
                      }
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-blue-300"
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
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Another Skill</span>
                </button>
              </div>
            </div>

            {/* Location Section - Only show for new providers */}
            {!isAddingToExisting && (
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
            )}

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">
                    {isAddingToExisting ? "2" : "3"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isAddingToExisting
                    ? "Additional Services & Pricing"
                    : "Services & Pricing"}
                </h3>
                <span className="text-red-500 text-sm">*</span>
              </div>
              <p className="text-gray-600 text-sm ml-10">
                {isAddingToExisting
                  ? "Add new services and their respective prices"
                  : "Select your services and their respective prices"}
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
                          Price (per hour/service)
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
                            placeholder="50.00"
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

            {/* Form Summary */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-500" />
                Form Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">
                    Selected Skills:
                  </span>
                  <div className="mt-1">
                    {formData.skills.filter((s) => s.trim()).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {formData.skills
                          .filter((s) => s.trim())
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        None selected
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">
                    Services & Pricing:
                  </span>
                  <div className="mt-1">
                    {formData.pricing.filter((p) => p.service.trim() && p.price)
                      .length > 0 ? (
                      <div className="space-y-1">
                        {formData.pricing
                          .filter((p) => p.service.trim() && p.price)
                          .map((service, index) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium">
                                {service.service}:
                              </span>{" "}
                              ${service.price}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        None configured
                      </span>
                    )}
                  </div>
                </div>
                {/* Availability summary removed */}
                {!isAddingToExisting && (
                  <div>
                    <span className="text-gray-600 font-medium">Location:</span>
                    <div className="mt-1">
                      {formData.location.address ? (
                        <span className="text-xs">
                          {formData.location.address}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">
                          No address set
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Section */}
            <div className="border-t pt-8">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white py-4 px-8 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isAddingToExisting
                        ? "Adding Services..."
                        : "Creating Profile..."}
                    </>
                  ) : (
                    <>
                      {isAddingToExisting ? (
                        <Plus className="h-5 w-5 mr-2" />
                      ) : (
                        <User className="h-5 w-5 mr-2" />
                      )}
                      {submitButtonText}
                    </>
                  )}
                </button>
                <button
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 py-4 px-8 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 border border-gray-200 flex items-center justify-center"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Cancel
                </button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  {isAddingToExisting
                    ? "New services will be added to your existing provider profile."
                    : "Your profile will be reviewed by our admin team before approval."}
                </p>
                {success && (
                  <p className="text-sm text-green-600 mt-2">
                    Redirecting to dashboard in 3 seconds...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-500" />
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Skills & Services
                </h4>
                <ul className="space-y-1">
                  <li>• Select skills that match your expertise</li>
                  <li>• Price your services competitively</li>
                  <li>• You can add more services later</li>
                </ul>
              </div>
              {/* Availability help removed */}
              {!isAddingToExisting && (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <ul className="space-y-1">
                      <li>• Use "Current Location" for accuracy</li>
                      <li>• Address helps customers find you</li>
                      <li>• Coordinates enable distance-based search</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Approval Process
                    </h4>
                    <ul className="space-y-1">
                      <li>• Admin review typically takes 24-48 hours</li>
                      <li>• You'll be notified via email</li>
                      <li>• Complete profiles are approved faster</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateServicePage;
