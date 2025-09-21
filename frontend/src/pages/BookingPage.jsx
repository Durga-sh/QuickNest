import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Briefcase,
  Star,
  Shield,
  Sparkles,
  Home,
  Wrench,
  Zap,
  Droplets,
  Bug,
} from "lucide-react";
const services = [
  {
    id: "salon-women",
    name: "Salon for Women",
    category: "Beauty & Grooming",
    price: 899,
    originalPrice: 1299,
    duration: "60-90 mins",
    rating: 4.9,
    reviews: 15623,
    description:
      "Professional beauty services including haircut, facial, manicure, pedicure at home",
    includes: [
      "Haircut & Styling",
      "Facial Treatment",
      "Manicure & Pedicure",
      "Premium Products",
    ],
    excludes: ["Hair Coloring", "Advanced Treatments"],
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-pink-500 to-rose-500",
    image: "/placeholder.svg?height=200&width=300&text=Salon+for+Women",
  },
  {
    id: "massage-therapy",
    name: "Therapeutic Massage",
    category: "Beauty & Grooming",
    price: 1599,
    originalPrice: 2199,
    duration: "60-90 mins",
    rating: 4.8,
    reviews: 8934,
    description:
      "Relaxing full body massage therapy to relieve stress and muscle tension",
    includes: [
      "Full Body Massage",
      "Aromatic Oils",
      "Stress Relief",
      "Professional Therapist",
    ],
    excludes: ["Deep Tissue Massage", "Hot Stone Therapy"],
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-pink-500 to-rose-500",
    image: "/placeholder.svg?height=200&width=300&text=Therapeutic+Massage",
  },
  {
    id: "men-grooming",
    name: "Men's Grooming",
    category: "Beauty & Grooming",
    price: 599,
    originalPrice: 899,
    duration: "45-60 mins",
    rating: 4.7,
    reviews: 12456,
    description:
      "Complete grooming package including haircut, beard styling, facial cleanup",
    includes: [
      "Haircut & Styling",
      "Beard Trimming",
      "Facial Cleanup",
      "Head Massage",
    ],
    excludes: ["Hair Coloring", "Advanced Facials"],
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-pink-500 to-rose-500",
    image: "/placeholder.svg?height=200&width=300&text=Men+Grooming",
  },
  {
    id: "bridal-makeup",
    name: "Bridal Makeup",
    category: "Beauty & Grooming",
    price: 4999,
    originalPrice: 7999,
    duration: "2-3 hours",
    rating: 4.9,
    reviews: 3456,
    description:
      "Professional bridal makeover with HD makeup, hair styling, draping assistance",
    includes: [
      "HD Makeup",
      "Hair Styling",
      "Draping Assistance",
      "Touch-up Kit",
    ],
    excludes: ["Jewelry", "Outfit", "Photography"],
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-pink-500 to-rose-500",
    image: "/placeholder.svg?height=200&width=300&text=Bridal+Makeup",
  },
  {
    id: "deep-cleaning",
    name: "Full Home Deep Cleaning",
    category: "Home Cleaning",
    price: 2499,
    originalPrice: 3499,
    duration: "3-4 hours",
    rating: 4.8,
    reviews: 18934,
    description:
      "Comprehensive deep cleaning of entire home with eco-friendly products",
    includes: [
      "All Rooms Cleaning",
      "Kitchen Deep Clean",
      "Bathroom Sanitization",
      "Floor Mopping",
    ],
    excludes: ["Exterior Cleaning", "Carpet Shampooing", "Appliance Interior"],
    icon: <Home className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    image: "/placeholder.svg?height=200&width=300&text=Home+Deep+Cleaning",
  },
  {
    id: "bathroom-cleaning",
    name: "Bathroom Deep Cleaning",
    category: "Home Cleaning",
    price: 1299,
    originalPrice: 1799,
    duration: "90-120 mins",
    rating: 4.7,
    reviews: 12789,
    description:
      "Intensive bathroom cleaning and sanitization with anti-bacterial treatment",
    includes: [
      "Tile & Grout Cleaning",
      "Fixture Polishing",
      "Drain Cleaning",
      "Anti-bacterial Treatment",
    ],
    excludes: ["Plumbing Repairs", "Tile Replacement"],
    icon: <Home className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    image: "/placeholder.svg?height=200&width=300&text=Bathroom+Cleaning",
  },
  {
    id: "kitchen-cleaning",
    name: "Kitchen Deep Cleaning",
    category: "Home Cleaning",
    price: 1599,
    originalPrice: 2299,
    duration: "2-3 hours",
    rating: 4.6,
    reviews: 9876,
    description:
      "Complete kitchen cleaning including appliances, cabinets, chimney degreasing",
    includes: [
      "Appliance Cleaning",
      "Cabinet Cleaning",
      "Countertop Polishing",
      "Chimney Degreasing",
    ],
    excludes: ["Appliance Repair", "Pest Control"],
    icon: <Home className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    image: "/placeholder.svg?height=200&width=300&text=Kitchen+Cleaning",
  },
  {
    id: "sofa-cleaning",
    name: "Sofa & Carpet Cleaning",
    category: "Home Cleaning",
    price: 999,
    originalPrice: 1499,
    duration: "60-90 mins",
    rating: 4.8,
    reviews: 7654,
    description:
      "Professional upholstery cleaning using steam cleaning and fabric-safe products",
    includes: [
      "Steam Cleaning",
      "Stain Removal",
      "Fabric Protection",
      "Odor Elimination",
    ],
    excludes: ["Leather Cleaning", "Curtain Cleaning"],
    icon: <Home className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    image: "/placeholder.svg?height=200&width=300&text=Sofa+Carpet+Cleaning",
  },
  {
    id: "ac-service",
    name: "AC Service & Repair",
    category: "Appliance Repair",
    price: 499,
    originalPrice: 699,
    duration: "45-60 mins",
    rating: 4.8,
    reviews: 25847,
    description:
      "Complete AC maintenance including gas refill, deep cleaning, filter replacement",
    includes: [
      "Gas Refill",
      "Deep Cleaning",
      "Filter Replacement",
      "Performance Check",
    ],
    excludes: ["Spare Parts Cost", "Major Repairs"],
    icon: <Wrench className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    image: "/placeholder.svg?height=200&width=300&text=AC+Service+Repair",
  },
  {
    id: "washing-machine",
    name: "Washing Machine Repair",
    category: "Appliance Repair",
    price: 349,
    originalPrice: 549,
    duration: "30-45 mins",
    rating: 4.6,
    reviews: 15632,
    description:
      "Expert washing machine repair including drum cleaning, motor repair",
    includes: ["Diagnosis", "Cleaning", "Minor Repairs", "Performance Test"],
    excludes: ["Major Parts", "Motor Replacement"],
    icon: <Wrench className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    image: "/placeholder.svg?height=200&width=300&text=Washing+Machine+Repair",
  },
  {
    id: "refrigerator",
    name: "Refrigerator Repair",
    category: "Appliance Repair",
    price: 399,
    originalPrice: 599,
    duration: "45-60 mins",
    rating: 4.7,
    reviews: 11234,
    description:
      "Professional fridge repair including cooling issues, compressor problems",
    includes: [
      "Cooling Check",
      "Compressor Service",
      "Thermostat Repair",
      "Gas Refill",
    ],
    excludes: ["Compressor Replacement", "Major Parts"],
    icon: <Wrench className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    image: "/placeholder.svg?height=200&width=300&text=Refrigerator+Repair",
  },
  {
    id: "microwave",
    name: "Microwave Repair",
    category: "Appliance Repair",
    price: 299,
    originalPrice: 449,
    duration: "30-45 mins",
    rating: 4.5,
    reviews: 8765,
    description:
      "Microwave oven repair including heating issues, turntable problems",
    includes: ["Heating Test", "Safety Check", "Component Repair", "Cleaning"],
    excludes: ["Magnetron Replacement", "Major Electronics"],
    icon: <Wrench className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    image: "/placeholder.svg?height=200&width=300&text=Microwave+Repair",
  },
  {
    id: "electrician",
    name: "Electrician Services",
    category: "Electrical Services",
    price: 149,
    originalPrice: 249,
    duration: "30-60 mins",
    rating: 4.7,
    reviews: 19876,
    description:
      "Professional electrical services including wiring, switch installation, safety checks",
    includes: [
      "Wiring Repairs",
      "Switch Installation",
      "Safety Check",
      "Basic Materials",
    ],
    excludes: ["Heavy Appliances", "Major Rewiring"],
    icon: <Zap className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    image: "/placeholder.svg?height=200&width=300&text=Electrician+Services",
  },
  {
    id: "fan-installation",
    name: "Fan Installation & Repair",
    category: "Electrical Services",
    price: 199,
    originalPrice: 349,
    duration: "30-45 mins",
    rating: 4.6,
    reviews: 13456,
    description:
      "Professional installation and repair of ceiling fans, exhaust fans",
    includes: ["Installation", "Wiring", "Speed Control", "Balancing"],
    excludes: ["Fan Purchase", "Ceiling Modification"],
    icon: <Zap className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    image: "/placeholder.svg?height=200&width=300&text=Fan+Installation",
  },
  {
    id: "light-fitting",
    name: "Light & Switch Installation",
    category: "Electrical Services",
    price: 99,
    originalPrice: 199,
    duration: "15-30 mins",
    rating: 4.8,
    reviews: 16789,
    description:
      "Professional installation of lights, switches, dimmers and electrical fixtures",
    includes: ["Light Installation", "Switch Fitting", "Wiring", "Testing"],
    excludes: ["Fixture Purchase", "Decorative Lights"],
    icon: <Zap className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    image:
      "/placeholder.svg?height=200&width=300&text=Light+Switch+Installation",
  },
  {
    id: "wiring",
    name: "Home Wiring Services",
    category: "Electrical Services",
    price: 799,
    originalPrice: 1199,
    duration: "2-3 hours",
    rating: 4.5,
    reviews: 7654,
    description:
      "Comprehensive home wiring services including new connections, rewiring",
    includes: [
      "Wiring Installation",
      "Safety Measures",
      "Testing",
      "Documentation",
    ],
    excludes: ["Electrical Panel", "Meter Connection"],
    icon: <Zap className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    image: "/placeholder.svg?height=200&width=300&text=Home+Wiring+Services",
  },
  {
    id: "plumber",
    name: "Plumber Services",
    category: "Plumbing Services",
    price: 199,
    originalPrice: 299,
    duration: "30-45 mins",
    rating: 4.6,
    reviews: 22876,
    description:
      "Professional plumbing services for leaks, blockages, installations",
    includes: [
      "Leak Repairs",
      "Pipe Installation",
      "Drain Cleaning",
      "Basic Tools",
    ],
    excludes: ["Material Cost", "Major Installations"],
    icon: <Droplets className="w-6 h-6" />,
    color: "from-blue-600 to-indigo-600",
    image: "/placeholder.svg?height=200&width=300&text=Plumber+Services",
  },
  {
    id: "tap-repair",
    name: "Tap & Pipe Repair",
    category: "Plumbing Services",
    price: 149,
    originalPrice: 249,
    duration: "20-30 mins",
    rating: 4.7,
    reviews: 18765,
    description: "Expert repair and installation of taps, pipes, and fittings",
    includes: ["Tap Repair", "Pipe Fixing", "Leak Sealing", "Pressure Check"],
    excludes: ["Tap Purchase", "Major Pipe Work"],
    icon: <Droplets className="w-6 h-6" />,
    color: "from-blue-600 to-indigo-600",
    image: "/placeholder.svg?height=200&width=300&text=Tap+Pipe+Repair",
  },
  {
    id: "toilet-repair",
    name: "Toilet & Basin Repair",
    category: "Plumbing Services",
    price: 249,
    originalPrice: 399,
    duration: "30-45 mins",
    rating: 4.5,
    reviews: 12456,
    description:
      "Professional repair of toilets, washbasins, and bathroom fittings",
    includes: [
      "Flush Repair",
      "Basin Fixing",
      "Drainage Check",
      "Seal Replacement",
    ],
    excludes: ["Toilet Purchase", "Major Renovation"],
    icon: <Droplets className="w-6 h-6" />,
    color: "from-blue-600 to-indigo-600",
    image: "/placeholder.svg?height=200&width=300&text=Toilet+Basin+Repair",
  },
  {
    id: "water-tank",
    name: "Water Tank Cleaning",
    category: "Plumbing Services",
    price: 899,
    originalPrice: 1299,
    duration: "60-90 mins",
    rating: 4.8,
    reviews: 9876,
    description: "Thorough cleaning and sanitization of water tanks",
    includes: ["Tank Emptying", "Scrubbing", "Sanitization", "Refilling"],
    excludes: ["Tank Repair", "Pump Service"],
    icon: <Droplets className="w-6 h-6" />,
    color: "from-blue-600 to-indigo-600",
    image: "/placeholder.svg?height=200&width=300&text=Water+Tank+Cleaning",
  },
  {
    id: "general-pest",
    name: "General Pest Control",
    category: "Pest Control",
    price: 999,
    originalPrice: 1499,
    duration: "60-90 mins",
    rating: 4.6,
    reviews: 15432,
    description:
      "Complete pest control treatment for cockroaches, ants, spiders",
    includes: [
      "Multi-pest Treatment",
      "Safe Chemicals",
      "Spray Treatment",
      "3-month Warranty",
    ],
    excludes: ["Termite Treatment", "Fumigation"],
    icon: <Bug className="w-6 h-6" />,
    color: "from-red-500 to-pink-500",
    image: "/placeholder.svg?height=200&width=300&text=General+Pest+Control",
  },
  {
    id: "cockroach",
    name: "Cockroach Control",
    category: "Pest Control",
    price: 799,
    originalPrice: 1199,
    duration: "45-60 mins",
    rating: 4.7,
    reviews: 12876,
    description: "Specialized cockroach control treatment using gel baits",
    includes: [
      "Gel Bait Treatment",
      "Crack & Crevice Spray",
      "Kitchen Treatment",
      "2-month Warranty",
    ],
    excludes: ["Other Pests", "Fumigation"],
    icon: <Bug className="w-6 h-6" />,
    color: "from-red-500 to-pink-500",
    image: "/placeholder.svg?height=200&width=300&text=Cockroach+Control",
  },
  {
    id: "termite",
    name: "Termite Treatment",
    category: "Pest Control",
    price: 1499,
    originalPrice: 2299,
    duration: "90-120 mins",
    rating: 4.5,
    reviews: 8765,
    description:
      "Advanced termite treatment using drilling method and chemical barriers",
    includes: [
      "Drilling Treatment",
      "Chemical Barrier",
      "Wood Treatment",
      "5-year Warranty",
    ],
    excludes: ["Structural Repair", "Wood Replacement"],
    icon: <Bug className="w-6 h-6" />,
    color: "from-red-500 to-pink-500",
    image: "/placeholder.svg?height=200&width=300&text=Termite+Treatment",
  },
  {
    id: "bed-bugs",
    name: "Bed Bug Treatment",
    category: "Pest Control",
    price: 1299,
    originalPrice: 1899,
    duration: "60-90 mins",
    rating: 4.6,
    reviews: 6543,
    description:
      "Effective bed bug treatment using heat treatment and chemical spraying",
    includes: [
      "Heat Treatment",
      "Chemical Spray",
      "Mattress Treatment",
      "Furniture Treatment",
    ],
    excludes: ["Mattress Replacement", "Furniture Cleaning"],
    icon: <Bug className="w-6 h-6" />,
    color: "from-red-500 to-pink-500",
    image: "/placeholder.svg?height=200&width=300&text=Bed+Bug+Treatment",
  },
];
const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];
export default function Booking() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    service: "",
    date: "",
    time: "",
    price: 0,
  });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    const selectedService = localStorage.getItem("selectedService");
    if (selectedService) {
      const serviceData = JSON.parse(selectedService);
      setFormData((prev) => ({
        ...prev,
        service: serviceData.service,
        price: serviceData.price,
      }));
      localStorage.removeItem("selectedService");
    }
  }, []);
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  const handleServiceChange = (serviceName) => {
    const selectedService = services.find((s) => s.name === serviceName);
    setFormData((prev) => ({
      ...prev,
      service: serviceName,
      price: selectedService?.price || 0,
    }));
    if (errors.service) {
      setErrors((prev) => ({ ...prev, service: "" }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.service) newErrors.service = "Service selection is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      localStorage.setItem("bookingData", JSON.stringify(formData));
      navigate("/payment");
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 min-h-screen flex items-center justify-center p-4 py-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
    >
      <div className="w-full max-w-4xl">
        {}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Trusted by 10M+ customers
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Book Your Service
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Professional home services at your doorstep
          </p>
        </motion.div>
        {}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
                  <User className="inline w-4 h-4 mr-2 text-blue-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 font-medium">
                    {errors.name}
                  </p>
                )}
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
                  <Phone className="inline w-4 h-4 mr-2 text-blue-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
                  placeholder="+91 98765 43210"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-2 font-medium">
                    {errors.phone}
                  </p>
                )}
              </motion.div>
            </div>
            {}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
                <MapPin className="inline w-4 h-4 mr-2 text-blue-600" />
                Service Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none font-medium"
                placeholder="Enter your complete address with landmark"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-2 font-medium">
                  {errors.address}
                </p>
              )}
            </motion.div>
            {}
            <motion.div>
              <label className="block text-gray-700 font-semibold mb-4 text-sm uppercase tracking-wide">
                <Briefcase className="inline w-4 h-4 mr-2 text-blue-600" />
                Select Service
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <motion.div
                    key={service.name}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      formData.service === service.name
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 shadow-md hover:shadow-lg"
                    }`}
                    onClick={() => handleServiceChange(service.name)}
                  >
                    <div className="text-gray-800 font-semibold text-sm mb-2">
                      {service.name}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-blue-600 font-bold text-lg">
                        â‚¹{service.price}
                      </div>
                      <div className="flex items-center text-yellow-500 text-xs">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {service.rating}
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {service.category}
                    </div>
                  </motion.div>
                ))}
              </div>
              {errors.service && (
                <p className="text-red-500 text-sm mt-2 font-medium">
                  {errors.service}
                </p>
              )}
            </motion.div>
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
                  <Calendar className="inline w-4 h-4 mr-2 text-blue-600" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-2 font-medium">
                    {errors.date}
                  </p>
                )}
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
                  <Clock className="inline w-4 h-4 mr-2 text-blue-600" />
                  Preferred Time
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
                >
                  <option value="">Select preferred time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {errors.time && (
                  <p className="text-red-500 text-sm mt-2 font-medium">
                    {errors.time}
                  </p>
                )}
              </motion.div>
            </div>
            {}
            {formData.service && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200"
              >
                <div className="text-center">
                  <div className="text-gray-600 font-medium mb-2">
                    Service Cost
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    â‚¹{formData.price}
                  </div>
                  <div className="text-gray-500 text-sm mt-2">
                    *Inclusive of all taxes
                  </div>
                </div>
              </motion.div>
            )}
            {}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg font-bold"
            >
              Continue to Payment â†’
            </motion.button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
