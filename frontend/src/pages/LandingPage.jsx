"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";

const QuickNestLanding = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Wrench,
      name: "Plumbing",
      description: "Expert plumbers for all your needs",
      color: "bg-blue-500",
      serviceType: "plumbing", // Added service type for filtering
    },
    {
      icon: Zap,
      name: "Electrical",
      description: "Licensed electricians available 24/7",
      color: "bg-yellow-500",
      serviceType: "electrical",
    },
    {
      icon: Scissors,
      name: "Beauty & Salon",
      description: "Professional beauticians at your doorstep",
      color: "bg-pink-500",
      serviceType: "beauty",
    },
    {
      icon: Paintbrush,
      name: "Painting",
      description: "Transform your space with skilled painters",
      color: "bg-green-500",
      serviceType: "painting",
    },
    {
      icon: Car,
      name: "Auto Repair",
      description: "Mobile mechanics for your vehicle",
      color: "bg-red-500",
      serviceType: "auto repair",
    },
    {
      icon: Home,
      name: "Home Cleaning",
      description: "Thorough cleaning services",
      color: "bg-purple-500",
      serviceType: "cleaning",
    },
  ];

  // Handle service booking navigation
  const handleBookService = (serviceType, serviceName) => {
    // Navigate to services page with the selected service type as a filter
    navigate(
      `/services?skill=${encodeURIComponent(
        serviceType
      )}&category=${encodeURIComponent(serviceName)}`
    );
  };

  const features = [
    {
      icon: MapPin,
      title: "Live Tracking",
      description:
        "Track your service professional in real-time from booking to completion",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: Star,
      title: "Verified Ratings",
      description:
        "Choose from top-rated professionals with authentic customer reviews",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Safe and secure payment options with full transaction protection",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Clock,
      title: "Quick Booking",
      description:
        "Book services instantly and get professionals at your doorstep within hours",
      color: "bg-blue-100 text-blue-600",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      content:
        "QuickNest made finding a reliable plumber so easy. The live tracking feature gave me peace of mind!",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "Mike Chen",
      role: "Business Owner",
      content:
        "As an electrician, QuickNest has helped me connect with more customers and grow my business.",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Emily Davis",
      role: "Working Professional",
      content:
        "The beauty services at home are a game-changer. Professional, convenient, and affordable!",
      rating: 5,
      avatar: "ED",
    },
  ];

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-16 pb-20 sm:pt-24 sm:pb-32 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="mb-6">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  🚀 Trusted by 50,000+ customers
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                Your Local
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Service Heroes
                </span>
                On Demand
              </h1>
              <p className="mt-6 text-lg text-gray-600 sm:text-xl">
                Connect with verified local professionals for all your home and
                personal service needs. From plumbing to beauty services - we've
                got you covered with live tracking and secure payments.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    onClick={() => navigate("/services")}
                  >
                    Book a Service
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center bg-transparent"
                  >
                    <Play className="mr-2 w-4 h-4" />
                    Watch Demo
                  </Button>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Verified Professionals
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Secure Payments
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    24/7 Support
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-2xl lg:max-w-md">
                <div className="w-full h-96 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Home className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                    <p className="text-emerald-800 font-semibold">
                      QuickNest App Interface
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                      Live Tracking
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Secure Payment
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Professional Services at Your Fingertips
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose from our wide range of verified local professionals
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mx-auto mb-4`}
                  >
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Button
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700 p-0"
                    onClick={() =>
                      handleBookService(service.serviceType, service.name)
                    }
                  >
                    Book Now <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose QuickNest?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience the future of local service booking
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of satisfied customers and professionals
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
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
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-emerald-600 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-emerald-100">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-emerald-100">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100K+</div>
              <div className="text-emerald-100">Services Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4.9</div>
              <div className="text-emerald-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join QuickNest today and experience hassle-free service booking
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Book Your First Service
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Join as Professional
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuickNestLanding;
