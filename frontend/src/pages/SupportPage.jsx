import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  HelpCircle,
  Send,
  MapPin,
} from "lucide-react";

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Support form submitted:", formData);
    alert("Thank you for contacting us! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      category: "general",
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How Can We Help You?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to support you 24/7. Get in touch with our customer
            service team for any questions, concerns, or assistance you need.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-emerald-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-gray-600">+91 7205882737</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-emerald-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-gray-600">support@quicknest.com</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 text-emerald-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-gray-600">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-emerald-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Office Address</p>
                    <p className="text-gray-600">
                      123 Tech Park, Hyderabad, India
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-emerald-500 mr-2" />
                  <h3 className="font-medium text-gray-900">Support Hours</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Monday - Friday: 9:00 AM - 8:00 PM
                  <br />
                  Saturday - Sunday: 10:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="booking">Booking Support</option>
                    <option value="payment">Payment Issues</option>
                    <option value="provider">Provider Support</option>
                    <option value="technical">Technical Issues</option>
                    <option value="feedback">Feedback & Suggestions</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6"
          variants={itemVariants}
        >
          <div className="flex items-center mb-6">
            <HelpCircle className="w-6 h-6 text-emerald-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "How do I book a service?",
                answer:
                  "Simply browse our services, select the one you need, choose your preferred date and time, and confirm your booking. You'll receive instant confirmation.",
              },
              {
                question: "What if I need to cancel or reschedule?",
                answer:
                  "You can cancel or reschedule your booking up to 24 hours before the scheduled time through your account dashboard or by contacting support.",
              },
              {
                question: "How do I become a service provider?",
                answer:
                  "Register as a provider, complete your profile with credentials and portfolio, pass our verification process, and start accepting bookings.",
              },
              {
                question: "Is my payment information secure?",
                answer:
                  "Yes, we use industry-standard encryption and secure payment gateways to protect your financial information. We never store your payment details.",
              },
              {
                question: "What if I'm not satisfied with the service?",
                answer:
                  "We offer a satisfaction guarantee. Contact our support team within 24 hours of service completion, and we'll work to resolve any issues.",
              },
              {
                question: "How are service providers verified?",
                answer:
                  "All providers undergo background checks, credential verification, and skill assessments before being approved to offer services on our platform.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="border-l-4 border-emerald-500 pl-4"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-medium text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SupportPage;
