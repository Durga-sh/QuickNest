import VoiceBookingSafeWrapper, {
  VoiceBookingSafePresets,
} from "../components/VoiceBookingSafeWrapper";
import VoiceBookingComponent from "../components/VoiceBookingComponent";
import { Link, useNavigate } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Star,
  Wrench,
  Zap,
  Scissors,
  Paintbrush,
  Car,
  Home,
  ArrowRight,
  CheckCircle,
  Play,
  Shield,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import Chatbot from "../components/chatbot";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const QuickNestLanding = () => {
  const [showVoiceBooking, setShowVoiceBooking] = useState(false);
  const navigate = useNavigate();

  const services = [
    {
      icon: Wrench,
      name: "Plumbing",
      description: "Expert plumbers for all your needs",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      serviceType: "plumber",
    },
    {
      icon: Zap,
      name: "Electrical",
      description: "Licensed electricians available 24/7",
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      serviceType: "electrician",
    },
    {
      icon: Scissors,
      name: "Beauty & Salon",
      description: "Professional beauticians at your doorstep",
      color: "bg-gradient-to-br from-pink-500 to-rose-500",
      serviceType: "beauty",
    },
    {
      icon: Paintbrush,
      name: "Painting",
      description: "Transform your space with skilled painters",
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      serviceType: "painter",
    },
    {
      icon: Car,
      name: "Auto Repair",
      description: "Mobile mechanics for your vehicle",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      serviceType: "mechanic",
    },
    {
      icon: Home,
      name: "Home Cleaning",
      description: "Thorough cleaning services",
      color: "bg-gradient-to-br from-purple-500 to-violet-500",
      serviceType: "cleaner",
    },
  ];

  // Handle service booking navigation
  const handleBookService = (serviceType, serviceName) => {
    navigate(
      `/services?skill=${encodeURIComponent(
        serviceType
      )}&category=${encodeURIComponent(serviceName)}`
    );
  };

  // Handle voice booking result
  const handleVoiceBookingResult = (bookingData) => {
    console.log("Voice booking result:", bookingData);

    // Navigate to services page with pre-filled data
    const queryParams = new URLSearchParams({
      service: bookingData.service || "",
      voiceBooking: "true",
      date: bookingData.bookingDate?.toISOString() || "",
      timeStart: bookingData.timeSlot?.start || "",
      timeEnd: bookingData.timeSlot?.end || "",
      urgent: bookingData.urgent ? "true" : "false",
      autoFill: "true",
    });

    // Close voice modal
    setShowVoiceBooking(false);

    // Show success message
    toast.success(
      `Voice booking processed! Redirecting to ${bookingData.serviceDisplay} services...`
    );

    // Navigate with a small delay for better UX
    setTimeout(() => {
      navigate(`/services?${queryParams.toString()}`);
    }, 1000);
  };

  // Handle auto-booking success
  const handleAutoBookingSuccess = (booking, bookingData) => {
    console.log("Auto-booking successful:", booking);

    // Close voice modal
    setShowVoiceBooking(false);

    // Show success toast
    toast.success(
      `🎉 Booking confirmed! ${bookingData.serviceDisplay} service booked for ${bookingData.dateDisplay}`,
      {
        duration: 5000,
      }
    );

    // Navigate to bookings page to show the new booking
    setTimeout(() => {
      navigate("/dashboard/bookings");
    }, 2000);
  };

  const features = [
    {
      icon: MapPin,
      title: "Live Tracking",
      description:
        "Track your service professional in real-time from booking to completion",
      color: "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700",
    },
    {
      icon: Star,
      title: "Verified Ratings",
      description:
        "Choose from top-rated professionals with authentic customer reviews",
      color: "bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-700",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Safe and secure payment options with full transaction protection",
      color: "bg-gradient-to-br from-green-100 to-emerald-100 text-green-700",
    },
    {
      icon: Clock,
      title: "Voice Booking",
      description:
        "Book services instantly with voice commands - just say what you need!",
      color: "bg-gradient-to-br from-purple-100 to-violet-100 text-purple-700",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      content:
        "QuickNest's voice booking is amazing! I just said 'book a plumber tomorrow morning' and it was done automatically!",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "Mike Chen",
      role: "Business Owner",
      content:
        "As an electrician, QuickNest has helped me connect with more customers. The voice booking brings in many new clients.",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Emily Davis",
      role: "Working Professional",
      content:
        "Voice booking saves me so much time! I can book services while driving or cooking. So convenient!",
      rating: 5,
      avatar: "ED",
    },
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "10K+", label: "Professionals", icon: Award },
    { number: "100K+", label: "Services Completed", icon: TrendingUp },
    { number: "4.9", label: "Average Rating", icon: Star },
  ];

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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      y: -8,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-16 pb-20 sm:pt-24 sm:pb-32 w-full overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-teal-200 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <motion.div
            className="lg:grid lg:grid-cols-12 lg:gap-8 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
              variants={itemVariants}
            >
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Now with Voice Booking! Just speak to book
                </Badge>
              </motion.div>
              <motion.h1
                className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Your Local
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Service Heroes
                </span>
                On Demand
              </motion.h1>
              <motion.p
                className="mt-6 text-lg text-gray-600 sm:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Connect with verified local professionals for all your home and
                personal service needs. Now with{" "}
                <strong>AI-powered voice booking</strong> - just say "Book an
                electrician tomorrow at 10 AM" and we'll handle the rest!
              </motion.p>
              <motion.div
                className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate("/services")}
                  >
                    Book a Service
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center bg-transparent border-2 hover:bg-gray-50 transition-all duration-300"
                    onClick={() => {
                      // Simple voice booking trigger
                      if (
                        "webkitSpeechRecognition" in window ||
                        "SpeechRecognition" in window
                      ) {
                        setShowVoiceBooking(true);
                      } else {
                        alert(
                          "Voice recognition not supported in this browser. Please use Chrome or Firefox."
                        );
                      }
                    }}
                  >
                    🎤 Try Voice Booking
                  </Button>
                </div>
                <motion.div
                  className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <motion.div
                    className="flex items-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Auto Voice Booking
                  </motion.div>
                  <motion.div
                    className="flex items-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Verified Professionals
                  </motion.div>
                  <motion.div
                    className="flex items-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Instant Confirmation
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
              variants={itemVariants}
            >
              <motion.div
                className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden"
                variants={cardVariants}
                whileHover="hover"
                initial="hidden"
                animate="visible"
              >
                <div className="w-full h-96 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-teal-200/20"
                    animate={{
                      background: [
                        "linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))",
                        "linear-gradient(45deg, rgba(20, 184, 166, 0.1), rgba(16, 185, 129, 0.1))",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="text-center relative z-10">
                    <motion.div
                      animate={{
                        y: [-5, 5, -5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Home className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-emerald-800 font-semibold">
                      QuickNest Voice Booking
                    </p>
                    <p className="text-emerald-600 text-sm mt-2">
                      "Book a plumber tomorrow at 10 AM"
                    </p>
                  </div>
                </div>
                <motion.div
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200"
                  variants={floatingVariants}
                  animate="animate"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                      🎤 Voice Active
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200"
                  variants={floatingVariants}
                  animate="animate"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Auto Booked!
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-16 bg-gradient-to-b from-gray-50 to-white w-full"
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Professional Services at Your Fingertips
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose from our wide range of verified local professionals - book
              instantly with voice or traditional booking
            </p>
          </motion.div>
          <motion.div
            className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                custom={index}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <service.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        className="text-emerald-600 hover:text-emerald-700 p-0 group"
                        onClick={() =>
                          handleBookService(service.serviceType, service.name)
                        }
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          Book Now
                        </span>
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                      <p className="text-xs text-gray-500">
                        💡 Try: "Book {service.serviceType} tomorrow morning"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose QuickNest?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience the future of local service booking with AI-powered
              voice commands
            </p>
          </motion.div>
          <motion.div
            className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`w-20 h-20 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-10 h-10" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-16 bg-gradient-to-b from-gray-50 to-white w-full"
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of satisfied customers loving our voice booking
              feature
            </p>
          </motion.div>
          <motion.div
            className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <motion.div
                      className="flex items-center mb-6"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <p className="text-gray-600 mb-6 italic text-lg leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-4 shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {testimonial.avatar}
                        </span>
                      </motion.div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 w-full relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))",
              "linear-gradient(45deg, rgba(20, 184, 166, 0.1), rgba(16, 185, 129, 0.1))",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <motion.div
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-4xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-emerald-100 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 mr-2" />
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join QuickNest today and experience hassle-free voice booking -
              it's as easy as speaking!
            </p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setShowVoiceBooking(true)}
              >
                🎤 Try Voice Booking Now
              </Button>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 hover:bg-gray-50 transition-all duration-300"
                >
                  Sign Up & Book Traditional
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Add the Chatbot Component */}
      <Chatbot />

      {/* Voice Booking Modal */}
      {showVoiceBooking && (
        <VoiceBookingComponent
          onClose={() => setShowVoiceBooking(false)}
          onBookingParsed={handleVoiceBookingResult}
          onAutoBookingSuccess={handleAutoBookingSuccess}
        />
      )}

      {/* Voice Booking Floating Button - moved to right side for side-by-side visibility with chatbot */}
      <div className="fixed bottom-12 right-20 z-30">
        <VoiceBookingSafePresets.FloatingButton
          onBookingParsed={handleVoiceBookingResult}
        />
      </div>
    </div>
  );
};

export default QuickNestLanding;
