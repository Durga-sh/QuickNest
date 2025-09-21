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
  const stats = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "10K+", label: "Professionals", icon: Award },
    { number: "100K+", label: "Services Completed", icon: TrendingUp },
    { number: "4.9", label: "Average Rating", icon: Star },
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    hover: {
      scale: 1.08,
      y: -12,
      rotateY: 5,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };
  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };
  const particleVariants = {
    animate: {
      y: [-20, 20, -20],
      x: [-10, 10, -10],
      rotate: [0, 360],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };
  return (
    <div className="min-h-screen bg-white w-full overflow-hidden">
      {}
      <section className="relative bg-gradient-to-br from-emerald-100 via-cyan-100 to-blue-100 pt-16 pb-20 sm:pt-24 sm:pb-32 w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.2),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.2),transparent_50%)]" />
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-30 blur-sm shadow-lg shadow-emerald-200"
          variants={particleVariants}
          animate="animate"
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-30 blur-sm shadow-lg shadow-cyan-200"
          variants={particleVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-25 blur-sm shadow-lg shadow-purple-200"
          variants={particleVariants}
          animate="animate"
          style={{ animationDelay: "4s" }}
        />
        <motion.div
          className="absolute top-60 right-1/3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 blur-sm shadow-lg shadow-yellow-200"
          variants={particleVariants}
          animate="animate"
          style={{ animationDelay: "1s" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full opacity-25 blur-sm shadow-lg shadow-rose-200"
          variants={particleVariants}
          animate="animate"
          style={{ animationDelay: "3s" }}
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
                <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200 shadow-lg backdrop-blur-sm">
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
                      repeat: Number.POSITIVE_INFINITY,
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
                        repeat: Number.POSITIVE_INFINITY,
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
      {}
      <section
        id="services"
        className="py-16 bg-gradient-to-b from-gray-50 to-white w-full relative overflow-hidden"
      >
        <motion.div
          className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-10 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
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
              <motion.div key={index} variants={cardVariants} custom={index}>
                <Card
                  className={`h-full border-0 shadow-2xl ${service.glowColor} bg-white/90 backdrop-blur-sm relative overflow-hidden group cursor-pointer shadow-emerald-500/20`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-emerald-50/30 to-cyan-50/30 opacity-100 group-hover:opacity-100 transition-opacity duration-500" />
                  <motion.div
                    className={`absolute inset-0 ${service.color} opacity-0 group-hover:opacity-20 transition-all duration-700`}
                    initial={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <motion.div
                    className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-80 shadow-lg shadow-pink-300 transition-opacity duration-300"
                    whileHover={{
                      y: [-10, 10, -10],
                      x: [-5, 5, -5],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute bottom-6 left-6 w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-70 shadow-lg shadow-cyan-300 transition-opacity duration-300"
                    whileHover={{
                      y: [10, -10, 10],
                      x: [5, -5, 5],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  />
                  <motion.div
                    className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full opacity-0 group-hover:opacity-60 shadow-lg shadow-yellow-300 transition-opacity duration-300"
                    whileHover={{
                      y: [-8, 8, -8],
                      x: [-3, 3, -3],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />
                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div
                      className={`w-16 h-16 ${service.color} ${service.glowColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-3xl shadow-emerald-400/30 relative overflow-hidden`}
                      animate={{
                        scale: [1, 1.05, 1],
                        y: [-2, 2, -2],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      whileHover={{
                        scale: 1.2,
                        rotate: 15,
                        y: -5,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      <motion.div
                        className={`absolute inset-0 ${service.color} blur-xl opacity-70 transition-opacity duration-500`}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl opacity-30 blur-md"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />
                      <service.icon className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
                    </motion.div>
                    <motion.h3 className="text-xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 transition-all duration-300">
                      {service.name}
                    </motion.h3>
                    <p className="text-gray-700 mb-6 transition-colors duration-300">
                      {service.description}
                    </p>
                    <div className="flex flex-col gap-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          className="text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-3 group/btn relative overflow-hidden rounded-xl border-transparent transition-all duration-300 shadow-xl shadow-emerald-400/30"
                          onClick={() =>
                            handleBookService(service.serviceType, service.name)
                          }
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-20 blur-sm transition-opacity duration-300" />
                          <span className="group-hover/btn:translate-x-1 transition-transform duration-200 relative z-10 font-semibold">
                            Book Now
                          </span>
                          <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                        </Button>
                      </motion.div>
                      <p className="text-xs text-emerald-700 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-lg px-3 py-1 transition-all duration-300">
                        Try: "Book {service.serviceType} tomorrow morning"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-gray-50 w-full relative overflow-hidden">
        {}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.05),transparent_50%)]" />
        {}
        <motion.div
          className="absolute top-20 left-20 w-24 h-24 border border-emerald-200 rounded-2xl rotate-45 opacity-20"
          animate={{
            rotate: [45, 225, 45],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30"
          animate={{
            y: [-20, 20, -20],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Rocket className="w-5 h-5 text-emerald-600 mr-2" />
              <span className="text-emerald-800 font-semibold">
                Next-Gen Technology
              </span>
            </motion.div>
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
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                className="group"
              >
                <Card
                  className={`h-full border-0 shadow-xl hover:shadow-2xl ${feature.glowColor} transition-all duration-500 bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm relative overflow-hidden`}
                >
                  {}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    initial={false}
                  />
                  {}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-start space-x-6">
                      <motion.div
                        className={`flex-shrink-0 w-16 h-16 ${feature.iconBg} ${feature.glowColor} rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden`}
                        whileHover={{
                          scale: 1.1,
                          rotate: 5,
                          transition: { duration: 0.3 },
                        }}
                      >
                        {}
                        <div
                          className={`absolute inset-0 ${feature.iconBg} blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`}
                        />
                        <feature.icon className="w-8 h-8 text-white relative z-10" />
                      </motion.div>
                      <div className="flex-1">
                        <motion.h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                          {feature.title}
                        </motion.h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {feature.description}
                        </p>
                        {}
                        <motion.div
                          className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: index * 0.2 }}
                        >
                          <motion.div
                            className={`h-full bg-gradient-to-r ${feature.gradient} rounded-full`}
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{
                              delay: index * 0.2 + 0.5,
                              duration: 1.5,
                              ease: "easeOut",
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {}
          </motion.div>
        </div>
      </section>
      {}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900 w-full relative overflow-hidden">
        {}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.3),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.2),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(168,85,247,0.2),transparent_70%)]" />
        {}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.4) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(59,130,246,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        {}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 border border-emerald-400/20 rounded-3xl rotate-45"
          animate={{
            rotate: [45, 225, 45],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full"
          animate={{
            y: [-20, 20, -20],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <TrendingUp className="w-5 h-5 text-emerald-400 mr-2" />
              <span className="text-white font-semibold">
                Trusted by Thousands
              </span>
            </motion.div>
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
            className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Card className="h-full border-0 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                  {}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    initial={false}
                  />
                  {}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:shadow-emerald-500/25 transition-all duration-300"
                      whileHover={{
                        rotate: 10,
                        scale: 1.1,
                      }}
                    >
                      <stat.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.div
                      className="text-4xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-400 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-gray-300 group-hover:text-white transition-colors duration-300 flex items-center justify-center text-sm font-medium">
                      {stat.label}
                    </div>
                    {}
                    <motion.div
                      className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{
                          delay: index * 0.2 + 0.5,
                          duration: 1.5,
                          ease: "easeOut",
                        }}
                      />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          {}
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
              <motion.div
                key={index}
                className="text-center group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                  <motion.div
                    className={`w-12 h-12 bg-gradient-to-r ${metric.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                    whileHover={{ rotate: 10 }}
                  >
                    <metric.icon className="w-6 h-6 text-white" />
                  </motion.div>
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {}
      <section className="py-20 bg-gradient-to-br from-white via-emerald-50 to-teal-50 w-full relative overflow-hidden">
        {}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.1),transparent_50%)]" />
        {}
        <motion.div
          className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-md relative overflow-hidden">
              {}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5"
                animate={{
                  background: [
                    "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(20,184,166,0.05), rgba(6,182,212,0.05))",
                    "linear-gradient(135deg, rgba(20,184,166,0.05), rgba(6,182,212,0.05), rgba(16,185,129,0.05))",
                    "linear-gradient(135deg, rgba(6,182,212,0.05), rgba(16,185,129,0.05), rgba(20,184,166,0.05))",
                  ],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <CardContent className="p-12 text-center relative z-10">
                <motion.div
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-8 border border-emerald-200"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Rocket className="w-5 h-5 text-emerald-600 mr-2" />
                  <span className="text-emerald-800 font-semibold">
                    Ready to Transform Your Experience?
                  </span>
                </motion.div>
                <motion.h2
                  className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Start Your Journey with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                    QuickNest
                  </span>
                </motion.h2>
                <motion.p
                  className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Experience the future of local services with AI-powered voice
                  booking. It's as simple as speaking your needs - no forms, no
                  hassle, just results.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold relative overflow-hidden group"
                      onClick={() => setShowVoiceBooking(true)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center">
                        Try Voice Booking Now
                        <Sparkles className="ml-2 w-5 h-5" />
                      </span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/register">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 px-8 py-4 text-lg font-semibold bg-white/80 backdrop-blur-sm"
                      >
                        Sign Up & Explore Services
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
                {}
                <motion.div
                  className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  {[
                    {
                      icon: Zap,
                      title: "Instant Booking",
                      desc: "Voice to service in seconds",
                    },
                    {
                      icon: Shield,
                      title: "Secure & Safe",
                      desc: "Verified professionals only",
                    },
                    {
                      icon: Star,
                      title: "Top Rated",
                      desc: "4.9/5 customer satisfaction",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="text-center p-4 rounded-xl bg-gradient-to-br from-white/50 to-gray-50/50 backdrop-blur-sm border border-gray-200/50 hover:border-emerald-200 transition-all duration-300 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                        whileHover={{ rotate: 10 }}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      {}
      <Chatbot />
      {}
      {showVoiceBooking && (
        <VoiceBookingComponent
          onClose={() => setShowVoiceBooking(false)}
          onBookingParsed={handleVoiceBookingResult}
          onAutoBookingSuccess={handleAutoBookingSuccess}
        />
      )}
      {}
      <div className="fixed bottom-12 right-20 z-30">
        <VoiceBookingSafePresets.FloatingButton
          onBookingParsed={handleVoiceBookingResult}
        />
      </div>
    </div>
  );
};
export default QuickNestLanding;
