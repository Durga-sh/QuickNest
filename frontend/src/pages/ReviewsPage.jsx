import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ThumbsUp, Filter, Search } from "lucide-react";
const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [filterRating, setFilterRating] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const serviceCategories = [
    "House Cleaning",
    "Plumbing",
    "Electrical Work",
    "Gardening",
    "Home Security",
    "Appliance Repair",
    "Pest Control",
    "HVAC Service",
    "Painting",
    "Carpentry",
  ];
  useEffect(() => {
    const mockReviews = [
      {
        id: 1,
        customerName: "Sarah Johnson",
        service: "House Cleaning",
        rating: 5,
        date: "2024-12-15",
        review:
          "Exceptional service! The cleaning team was thorough, professional, and left my house spotless. They paid attention to every detail and were very respectful of my belongings. Highly recommend!",
        providerName: "CleanPro Services",
        verified: true,
      },
      {
        id: 2,
        customerName: "Michael Chen",
        service: "Plumbing",
        rating: 5,
        date: "2024-12-10",
        review:
          "Quick response time and expert workmanship. Fixed my leaking pipe efficiently and explained the issue clearly. Fair pricing and excellent customer service.",
        providerName: "Mike's Plumbing Solutions",
        verified: true,
      },
      {
        id: 3,
        customerName: "Emily Rodriguez",
        service: "Electrical Work",
        rating: 4,
        date: "2024-12-08",
        review:
          "Professional electrician who arrived on time and completed the work safely. Minor delay in scheduling, but overall great experience. Would use again.",
        providerName: "PowerFix Electrical",
        verified: true,
      },
      {
        id: 4,
        customerName: "David Thompson",
        service: "Gardening",
        rating: 5,
        date: "2024-12-05",
        review:
          "Transformed my backyard into a beautiful garden! The team was knowledgeable about plants and design. They exceeded my expectations in every way.",
        providerName: "Green Thumb Landscaping",
        verified: true,
      },
      {
        id: 5,
        customerName: "Lisa Wang",
        service: "Home Security",
        rating: 5,
        date: "2024-12-01",
        review:
          "Professional installation of security system. Technician explained everything thoroughly and provided excellent training on how to use the system.",
        providerName: "SecureHome Tech",
        verified: true,
      },
      {
        id: 6,
        customerName: "Robert Martinez",
        service: "Appliance Repair",
        rating: 4,
        date: "2024-11-28",
        review:
          "Fixed my washing machine quickly and efficiently. Reasonable pricing and good communication throughout the process.",
        providerName: "FixIt Appliance Services",
        verified: true,
      },
      {
        id: 7,
        customerName: "Jennifer Kim",
        service: "Pest Control",
        rating: 5,
        date: "2024-11-25",
        review:
          "Excellent pest control service! They were thorough in their treatment and provided great advice for prevention. Haven't seen any pests since!",
        providerName: "BugFree Solutions",
        verified: true,
      },
      {
        id: 8,
        customerName: "Mark Anderson",
        service: "HVAC Service",
        rating: 4,
        date: "2024-11-20",
        review:
          "Professional HVAC maintenance service. Technician was knowledgeable and identified potential issues before they became problems.",
        providerName: "Climate Control Experts",
        verified: true,
      },
      {
        id: 9,
        customerName: "Amanda Foster",
        service: "Painting",
        rating: 5,
        date: "2024-11-15",
        review:
          "Outstanding painting job! The painters were meticulous, clean, and finished on time. The quality of work exceeded my expectations.",
        providerName: "Perfect Paint Solutions",
        verified: true,
      },
      {
        id: 10,
        customerName: "James Wilson",
        service: "Carpentry",
        rating: 5,
        date: "2024-11-10",
        review:
          "Skilled carpenter who built custom shelves exactly as requested. Attention to detail and craftsmanship was exceptional. Highly recommended!",
        providerName: "Woodwork Masters",
        verified: true,
      },
    ];
    setReviews(mockReviews);
    setFilteredReviews(mockReviews);
  }, []);
  useEffect(() => {
    let filtered = reviews;
    if (filterRating !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(filterRating)
      );
    }
    if (filterService !== "all") {
      filtered = filtered.filter((review) => review.service === filterService);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          review.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredReviews(filtered);
  }, [filterRating, filterService, searchTerm, reviews]);
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };
  const getAverageRating = () => {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
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
        {}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Customer Reviews
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our customers say about their experiences with QuickNest
            services
          </p>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {getAverageRating()}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(parseFloat(getAverageRating())))}
              </div>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {reviews.length}
              </div>
              <p className="text-gray-600">Total Reviews</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {Math.round(
                  (reviews.filter((r) => r.rating >= 4).length /
                    reviews.length) *
                    100
                )}
                %
              </div>
              <p className="text-gray-600">Satisfied Customers</p>
            </div>
          </div>
          {}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rating Distribution
            </h3>
            {Object.entries(getRatingDistribution())
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className="flex items-center mb-2">
                  <div className="flex items-center w-20">
                    <span className="text-sm font-medium mr-2">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${(count / reviews.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-10">{count}</span>
                </div>
              ))}
          </div>
        </motion.div>
        {}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            {}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            {}
            <div>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Services</option>
                {serviceCategories.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
        {}
        <motion.div className="space-y-6" variants={containerVariants}>
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              className="bg-white rounded-lg shadow-lg p-6"
              variants={itemVariants}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div className="flex items-center mb-2 md:mb-0">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-emerald-600 font-semibold text-lg">
                      {review.customerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {review.customerName}
                    </h3>
                    <p className="text-sm text-gray-600">{review.service}</p>
                  </div>
                  {review.verified && (
                    <div className="ml-2 bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                      Verified
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center mb-1">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Quote className="absolute top-0 left-0 w-6 h-6 text-emerald-200 -mt-2 -ml-2" />
                <p className="text-gray-700 leading-relaxed pl-4">
                  {review.review}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Service provided by:{" "}
                  <span className="font-medium">{review.providerName}</span>
                </p>
                <div className="flex items-center">
                  <ThumbsUp className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">Helpful</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {filteredReviews.length === 0 && (
          <motion.div className="text-center py-12" variants={itemVariants}>
            <p className="text-gray-500 text-lg">
              No reviews found matching your criteria.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
export default ReviewsPage;
