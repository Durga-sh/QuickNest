"use client";
import { VoiceBookingSafePresets } from "../components/VoiceBookingSafeWrapper";
import VoiceBookingComponent from "../components/VoiceBookingComponent";
import { Link, useNavigate } from "react-router-dom";
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
  Shield,
  MapPin,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  Rocket,
  Globe,
  Cpu,
} from "lucide-react";
import Chatbot from "../components/chatbot";
import { useState } from "react";
import { toast } from "react-hot-toast";

const QuickNestLanding = () => {
  const [showVoiceBooking, setShowVoiceBooking] = useState(false);
  const navigate = useNavigate();

  const services = [
    {
      icon: Wrench,
      name: "Plumbing",
      description: "Expert plumbers for all your needs",
      color: "bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700",
      glowColor: "shadow-cyan-500/25",
      serviceType: "plumber",
    },
    {
      icon: Zap,
      name: "Electrical",
      description: "Licensed electricians available 24/7",
      color: "bg-gradient-to-br from-amber-400 via-orange-500 to-red-600",
      glowColor: "shadow-amber-500/25",
      serviceType: "electrician",
    },
    {
      icon: Scissors,
      name: "Beauty & Salon",
      description: "Professional beauticians at your doorstep",
      color: "bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600",
      glowColor: "shadow-pink-500/25",
      serviceType: "beauty",
    },
    {
      icon: Paintbrush,
      name: "Painting",
      description: "Transform your space with skilled painters",
      color: "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600",
      glowColor: "shadow-emerald-500/25",
      serviceType: "painter",
    },
    {
      icon: Car,
      name: "Auto Repair",
      description: "Mobile mechanics for your vehicle",
      color: "bg-gradient-to-br from-red-500 via-rose-600 to-pink-700",
      glowColor: "shadow-red-500/25",
      serviceType: "mechanic",
    },
    {
      icon: Home,
      name: "Home Cleaning",
      description: "Thorough cleaning services",
      color: "bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700",
      glowColor: "shadow-violet-500/25",
      serviceType: "cleaner",
    },
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "10K+", label: "Professionals", icon: Award },
    { number: "100K+", label: "Services Done", icon: TrendingUp },
    { number: "4.9★", label: "Avg Rating", icon: Star },
  ];

  const handleBookService = (serviceType, serviceName) => {
    navigate(
      `/services?skill=${encodeURIComponent(
        serviceType
      )}&category=${encodeURIComponent(serviceName)}`
    );
  };

  const handleVoiceBookingResult = (bookingData) => {
    console.log("Voice booking result:", bookingData);
    const queryParams = new URLSearchParams({
      service: bookingData.service || "",
      voiceBooking: "true",
      date: bookingData.bookingDate?.toISOString() || "",
      timeStart: bookingData.timeSlot?.start || "",
      timeEnd: bookingData.timeSlot?.end || "",
      urgent: bookingData.urgent ? "true" : "false",
      autoFill: "true",
    });

    setShowVoiceBooking(false);
    toast.success(
      `Voice booking processed! Redirecting to ${bookingData.serviceDisplay} services...`
    );

    setTimeout(() => {
      navigate(`/services?${queryParams.toString()}`);
    }, 1000);
  };

  const handleAutoBookingSuccess = (booking, bookingData) => {
    console.log("Auto-booking successful:", booking);
    setShowVoiceBooking(false);
    toast.success(
      `Booking confirmed! ${bookingData.serviceDisplay} service booked for ${bookingData.dateDisplay}`,
      {
        duration: 5000,
      }
    );

    setTimeout(() => {
      navigate("/dashboard/bookings");
    }, 2000);
  };

  const features = [
    {
      icon: MapPin,
      title: "Live Tracking",
      description:
        "Track your service professional in real-time from booking to completion with GPS precision",
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      bgGradient: "from-emerald-50 via-teal-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      glowColor: "shadow-emerald-500/20",
    },
    {
      icon: Star,
      title: "AI-Powered Matching",
      description:
        "Our smart algorithm matches you with the perfect professional based on ratings, location, and availability",
      gradient: "from-amber-400 via-yellow-500 to-orange-600",
      bgGradient: "from-amber-50 via-yellow-50 to-orange-50",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      glowColor: "shadow-amber-500/20",
    },
    {
      icon: Shield,
      title: "Blockchain Security",
      description:
        "Military-grade encryption and blockchain-secured payments ensure your data and transactions are protected",
      gradient: "from-green-400 via-emerald-500 to-teal-600",
      bgGradient: "from-green-50 via-emerald-50 to-teal-50",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
      glowColor: "shadow-green-500/20",
    },
    {
      icon: Cpu,
      title: "Neural Voice AI",
      description:
        "Advanced neural networks understand natural speech patterns and context for seamless voice booking",
      gradient: "from-purple-400 via-violet-500 to-indigo-600",
      bgGradient: "from-purple-50 via-violet-50 to-indigo-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
      glowColor: "shadow-purple-500/20",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-100 via-cyan-100 to-blue-100 pt-16 pb-20 sm:pt-24 sm:pb-32 w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.2),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.2),transparent_50%)]" />

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
                <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200 shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Now with Neural Voice AI! Just speak to book
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Your Local
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
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
                    Try Voice Booking
                  </Button>
                </div>

                <motion.div
                  className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Auto Voice Booking
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Verified Professionals
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Instant Confirmation
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
              variants={itemVariants}
            >
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden">
                <div className="w-full h-96 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="text-center relative z-10">
                    <Home className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                    <p className="text-emerald-800 font-semibold">
                      QuickNest Voice Booking
                    </p>
                    <p className="text-emerald-600 text-sm mt-2">
                      "Book a plumber tomorrow at 10 AM"
                    </p>
                  </div>
                </div>

                <div className="absolute top-4 right-4 bg-white/90 rounded-xl p-3 shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                      🎤 Voice Active
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-white/90 rounded-xl p-3 shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Auto Booked!
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-20 bg-gradient-to-b from-white via-emerald-50/30 to-white w-full relative overflow-hidden"
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-emerald-200/40 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-teal-200/40 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200 mb-4">
              <Sparkles className="w-3 h-3 mr-2" />6 Premium Categories
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
              Professional Services
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                at Your Fingertips
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our wide range of verified local professionals ready
              to serve you
            </p>
          </motion.div>

          {/* Honeycomb Grid Layout */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Hexagonal Shape Card */}
                  <div className="relative bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-emerald-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 overflow-hidden">
                    {/* Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-teal-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon with Floating Effect */}
                      <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-2xl blur-xl group-hover:scale-125 transition-transform duration-500" />
                        <div
                          className={`relative ${service.color} rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}
                        >
                          <service.icon className="w-10 h-10 text-white" />
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 group-hover:scale-110 transition-transform">
                          <Star className="w-3 h-3 fill-white" />
                          4.9
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed min-h-[3rem]">
                        {service.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>1,200+ bookings this month</span>
                      </div>

                      {/* Voice Command Hint */}
                      <div className="mb-6 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/50">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-emerald-700 font-semibold mb-1">
                              Try Voice Booking:
                            </p>
                            <p className="text-xs text-emerald-600 italic">
                              "Book {service.serviceType} tomorrow at 10 AM"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          onClick={() =>
                            handleBookService(service.serviceType, service.name)
                          }
                        >
                          Book Now
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 bg-transparent text-gray-700 hover:text-emerald-700 transition-all duration-300"
                          onClick={() =>
                            navigate(
                              `/services?skill=${encodeURIComponent(
                                service.serviceType
                              )}`
                            )
                          }
                        >
                          View Professionals
                        </Button>
                      </div>
                    </div>

                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enhanced Stats Bar */}
          <motion.div
            className="mt-20 max-w-6xl mx-auto relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 overflow-hidden shadow-2xl">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]" />
              </div>

              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="group cursor-default"
                  >
                    <div className="flex flex-col items-center">
                      <stat.icon className="w-8 h-8 text-white/80 mb-3 group-hover:scale-125 transition-transform duration-300" />
                      <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                        {stat.number}
                      </div>
                      <div className="text-sm text-white/90 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-gray-50 w-full relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-6">
              <Rocket className="w-5 h-5 text-emerald-600 mr-2" />
              <span className="text-emerald-800 font-semibold">
                Next-Gen Technology
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              Why Choose{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                QuickNest?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of local service booking with cutting-edge
              AI technology, advanced security, and seamless user experience
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants} className="group">
                <Card
                  className={`h-full border-0 shadow-lg hover:shadow-xl ${feature.glowColor} transition-all duration-300 bg-gradient-to-br ${feature.bgGradient} relative overflow-hidden`}
                >
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-start space-x-6">
                      <div
                        className={`flex-shrink-0 w-16 h-16 ${feature.iconBg} ${feature.glowColor} rounded-2xl flex items-center justify-center shadow-lg`}
                      >
                        <feature.icon className="w-8 h-8 text-white relative z-10" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {feature.description}
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

      {/* Impact Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.3),transparent_70%)]" />

        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-6 py-3 bg-white/10 rounded-full border border-white/20 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-400 mr-2" />
              <span className="text-white font-semibold">
                Trusted by Thousands
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
              Our Impact in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Numbers
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              See how QuickNest is revolutionizing the local service industry
              with cutting-edge technology
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {[
              {
                title: "Response Time",
                value: "< 2 sec",
                description: "Lightning-fast AI processing",
                icon: Zap,
                gradient: "from-yellow-400 to-orange-500",
              },
              {
                title: "Success Rate",
                value: "99.9%",
                description: "Reliable service matching",
                icon: CheckCircle,
                gradient: "from-green-400 to-emerald-500",
              },
              {
                title: "Coverage",
                value: "50+ Cities",
                description: "Expanding nationwide",
                icon: Globe,
                gradient: "from-blue-400 to-purple-500",
              },
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <Card className="border-0 bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${metric.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  >
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {metric.value}
                  </div>
                  <div className="text-lg font-semibold text-gray-300 mb-1">
                    {metric.title}
                  </div>
                  <div className="text-sm text-gray-400">
                    {metric.description}
                  </div>
                </Card>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {[
              {
                title: "Response Time",
                value: "< 2 sec",
                description: "Lightning-fast AI processing",
                icon: Zap,
                gradient: "from-yellow-400 to-orange-500",
              },
              {
                title: "Success Rate",
                value: "99.9%",
                description: "Reliable service matching",
                icon: CheckCircle,
                gradient: "from-green-400 to-emerald-500",
              },
              {
                title: "Coverage",
                value: "50+ Cities",
                description: "Expanding nationwide",
                icon: Globe,
                gradient: "from-blue-400 to-purple-500",
              },
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <Card className="border-0 bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${metric.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  >
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {metric.value}
                  </div>
                  <div className="text-lg font-semibold text-gray-300 mb-1">
                    {metric.title}
                  </div>
                  <div className="text-sm text-gray-400">
                    {metric.description}
                  </div>
                </Card>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      <Chatbot />

      {showVoiceBooking && (
        <VoiceBookingComponent
          onClose={() => setShowVoiceBooking(false)}
          onBookingParsed={handleVoiceBookingResult}
          onAutoBookingSuccess={handleAutoBookingSuccess}
        />
      )}

      <div className="fixed bottom-12 right-20 z-30">
        <VoiceBookingSafePresets.FloatingButton
          onBookingParsed={handleVoiceBookingResult}
        />
      </div>
    </div>
  );
};

export default QuickNestLanding;
