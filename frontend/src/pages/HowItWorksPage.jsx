import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  CheckCircle,
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Smartphone,
  CreditCard,
  MessageSquare,
} from "lucide-react";

const HowItWorksPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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

  const steps = [
    {
      icon: Search,
      title: "Browse Services",
      description:
        "Search through our wide range of professional services including cleaning, plumbing, electrical work, and more.",
      details:
        "Use our intuitive search and filter system to find exactly what you need in your area.",
    },
    {
      icon: Calendar,
      title: "Book & Schedule",
      description:
        "Select your preferred date and time slot that works best for your schedule.",
      details:
        "Choose from available time slots and provide any specific requirements for your service.",
    },
    {
      icon: CheckCircle,
      title: "Get Service",
      description:
        "A verified professional arrives at your location at the scheduled time to complete the work.",
      details:
        "All our professionals are background-checked, insured, and equipped with the necessary tools.",
    },
    {
      icon: Star,
      title: "Rate & Review",
      description:
        "Share your experience and help others by rating and reviewing the service provider.",
      details:
        "Your feedback helps maintain quality and helps other customers make informed decisions.",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Professionals",
      description:
        "All service providers undergo thorough background checks and verification processes.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description:
        "Book services at your convenience with flexible time slots available 7 days a week.",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description:
        "Multiple payment options with secure, encrypted transactions for your peace of mind.",
    },
    {
      icon: MessageSquare,
      title: "24/7 Support",
      description:
        "Round-the-clock customer support to assist you before, during, and after your service.",
    },
  ];

  const forCustomers = [
    "Create an account or log in to get started",
    "Browse services by category or search for specific needs",
    "Compare providers based on ratings, reviews, and pricing",
    "Select your preferred date and time slot",
    "Provide service details and any special requirements",
    "Confirm booking and make secure payment",
    "Track your service provider in real-time",
    "Rate and review after service completion",
  ];

  const forProviders = [
    "Register as a service provider on our platform",
    "Complete your professional profile with credentials",
    "Upload portfolio, certifications, and insurance documents",
    "Pass our verification and background check process",
    "Set your service areas, availability, and pricing",
    "Start receiving booking requests from customers",
    "Accept jobs that fit your schedule and expertise",
    "Provide excellent service and build your reputation",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-br from-emerald-600 to-blue-700 text-white py-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" variants={itemVariants}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How QuickNest Works
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto">
              Connecting you with trusted local professionals in just a few
              simple steps
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Steps Section */}
      <motion.section
        className="py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple Steps to Get Started
            </h2>
            <p className="text-xl text-gray-600">
              From booking to completion, we've made it incredibly easy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative bg-white rounded-lg shadow-lg p-6 text-center"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4 mt-4">
                  <step.icon className="w-12 h-12 text-emerald-600" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-3">{step.description}</p>
                <p className="text-sm text-gray-500">{step.details}</p>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-emerald-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-16 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose QuickNest?
            </h2>
            <p className="text-xl text-gray-600">
              We're committed to providing the best service experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-center mb-4">
                  <feature.icon className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Detailed Process Section */}
      <motion.section
        className="py-16 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Customers */}
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Smartphone className="w-8 h-8 text-emerald-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    For Customers
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Getting the service you need has never been easier. Follow
                  these simple steps:
                </p>
                <ul className="space-y-3">
                  {forCustomers.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* For Providers */}
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Users className="w-8 h-8 text-emerald-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    For Service Providers
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Join our network of trusted professionals and grow your
                  business:
                </p>
                <ul className="space-y-3">
                  {forProviders.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16 bg-emerald-600"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Join thousands of satisfied customers who trust QuickNest for
              their service needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/services"
                className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book a Service
              </motion.a>
              <motion.a
                href="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Become a Provider
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HowItWorksPage;
