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
      <section
        id="services"
        className="py-20 bg-gradient-to-b from-white via-gray-50 to-white w-full relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.05),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.05),transparent_50%)]" />

        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200">
              <Sparkles className="w-4 h-4 mr-2" />
              Voice-Enabled Services
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
              Professional Services at Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Fingertips
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our wide range of verified local professionals. Book
              instantly with voice or click.
            </p>
          </motion.div>

          <div className="max-w-7xl mx-auto space-y-6">
            {services.map((service, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div
                    className={`relative flex items-center gap-6 lg:gap-10 ${
                      isEven ? "flex-row" : "flex-row-reverse"
                    } bg-white hover:bg-gradient-to-br hover:from-emerald-50/30 hover:to-teal-50/30 rounded-3xl p-6 lg:p-8 transition-all duration-500 border border-gray-100 hover:border-emerald-200/50 hover:shadow-xl shadow-md`}
                  >
                    {/* Decorative line connector */}
                    <div
                      className={`absolute top-1/2 ${
                        isEven ? "left-0" : "right-0"
                      } w-1 h-16 bg-gradient-to-b from-transparent via-emerald-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    {/* Icon Box - More compact and refined */}
                    <div className="flex-shrink-0">
                      <div
                        className={`relative w-24 h-24 lg:w-28 lg:h-28 ${service.color} rounded-3xl flex items-center justify-center shadow-lg ${service.glowColor} group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500`}
                      >
                        <service.icon className="w-10 h-10 lg:w-12 lg:h-12 text-white relative z-10" />

                        {/* Floating Rating Badge */}
                        <motion.div
                          className="absolute -bottom-3 -right-3 bg-white rounded-xl px-2.5 py-1.5 shadow-lg border-2 border-gray-100 flex items-center gap-1"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{
                            delay: 0.3 + index * 0.1,
                            type: "spring",
                          }}
                          viewport={{ once: true }}
                        >
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-gray-900">
                            4.9
                          </span>
                        </motion.div>

                        {/* Subtle glow effect */}
                        <div
                          className={`absolute inset-0 ${service.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                        />
                      </div>
                    </div>

                    {/* Content - Better spacing and hierarchy */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5 group-hover:text-emerald-600 transition-colors duration-300">
                            {service.name}
                          </h3>
                          <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      {/* Stats with icon */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium">
                          1,200+ bookings this month
                        </span>
                      </div>

                      {/* Voice Hint - More prominent */}
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl mb-4 group-hover:border-emerald-300 transition-colors duration-300">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700 font-semibold">
                          Say: "Book {service.serviceType} tomorrow morning"
                        </span>
                      </div>

                      {/* Action Buttons - Better styling */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-xl transition-all duration-300 group/btn"
                          onClick={() =>
                            handleBookService(service.serviceType, service.name)
                          }
                        >
                          Book Now
                          <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 bg-white transition-all duration-300"
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
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Stats Bar - More refined */}
          <motion.div
            className="mt-16 max-w-7xl mx-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "50K+", label: "Happy Customers", icon: Users },
                { value: "10K+", label: "Professionals", icon: Award },
                { value: "100K+", label: "Services Done", icon: TrendingUp },
                { value: "4.9★", label: "Avg Rating", icon: Star },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group/stat"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover/stat:bg-white/30 transition-colors">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-emerald-50 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
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
