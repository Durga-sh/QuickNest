import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  User,
  Star,
  DollarSign,
  Settings,
  Edit,
  Eye,
  Bell,
} from "lucide-react";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [providerData] = useState({
    user: { name: "John Smith", email: "john.smith@example.com" },
    skills: ["Plumbing", "Pipe Repair", "Water Heater Installation"],
    location: {
      address: "123 Main Street, Downtown, City 12345",
      coordinates: [-74.006, 40.7128],
    },
    pricing: [
      { service: "Basic Plumbing Repair", price: 75 },
      { service: "Pipe Installation", price: 150 },
      { service: "Water Heater Service", price: 200 },
    ],
    availability: [
      {
        day: "Monday",
        timeSlots: [{ start: "09:00", end: "17:00" }],
      },
      {
        day: "Tuesday",
        timeSlots: [{ start: "09:00", end: "17:00" }],
      },
      {
        day: "Wednesday",
        timeSlots: [{ start: "09:00", end: "17:00" }],
      },
    ],
    status: "approved",
    rating: 4.8,
    totalJobs: 142,
    earnings: 15420,
  });

  // Function to redirect to create service page
  const redirectToCreateService = () => {
    navigate("/create-service");
  };

  // Function to redirect to view bookings page
  const redirectToViewBookings = () => {
    navigate("/provider-bookings");
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-blue-500/5 p-6 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value}
          </p>
        </div>
        <div
          className="p-4 rounded-2xl shadow-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-7 w-7" style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ServiceHub Provider
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/50 px-4 py-2 rounded-full border border-gray-200/50">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {providerData.user.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">
                    Welcome back, {providerData.user.name}!
                  </h2>
                  <p className="text-blue-100 mt-2 text-lg">
                    Status:{" "}
                    <span className="capitalize font-bold bg-white/20 px-3 py-1 rounded-full">
                      {providerData.status}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <div className="p-3 bg-yellow-400/20 rounded-full">
                      <Star className="h-6 w-6 fill-current text-yellow-400" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold block">
                        {providerData.rating}
                      </span>
                      <p className="text-blue-100 text-sm">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Earnings"
              value={`$${providerData.earnings.toLocaleString()}`}
              icon={DollarSign}
              color="#10B981"
            />
            <StatCard
              title="Jobs Completed"
              value={providerData.totalJobs}
              icon={User}
              color="#3B82F6"
            />
            <StatCard
              title="Active Services"
              value={providerData.pricing.length}
              icon={Settings}
              color="#8B5CF6"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-500/5 p-8 border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={redirectToCreateService}
                className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg font-semibold"
              >
                <Plus className="h-6 w-6" />
                <span>Create Service</span>
              </button>
              <button className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg font-semibold">
                <Edit className="h-6 w-6" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={redirectToViewBookings}
                className="flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg font-semibold"
              >
                <Eye className="h-6 w-6" />
                <span>View Bookings</span>
              </button>
              <button className="flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg font-semibold">
                <Bell className="h-6 w-6" />
                <span>Notifications</span>
              </button>
            </div>
          </div>

          {/* Current Services */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-500/5 p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Your Services</h3>
              <button
                onClick={redirectToCreateService}
                className="text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg"
              >
                + Add New Service
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providerData.pricing.map((service, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-105"
                >
                  <h4 className="font-bold text-gray-900 text-lg">
                    {service.service}
                  </h4>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-3">
                    ${service.price}
                  </p>
                  <div className="flex space-x-3 mt-4">
                    <button className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-200 transition-all duration-200 font-semibold">
                      Edit
                    </button>
                    <button className="text-sm bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition-all duration-200 font-semibold">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Provider Profile Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-500/5 p-8 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Your Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {providerData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-500/5 p-8 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-green-50/50 rounded-xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    Completed job: Kitchen Sink Repair
                  </span>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-blue-50/50 rounded-xl">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    New booking request received
                  </span>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-yellow-50/50 rounded-xl">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    Profile updated successfully
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action for New Providers */}
          {providerData.status === "pending" && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-yellow-800 font-bold text-lg">!</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-yellow-800">
                    Profile Under Review
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your provider profile is currently under admin review.
                      You'll be notified once approved.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={redirectToCreateService}
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-6 py-3 rounded-xl text-sm font-bold hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 shadow-lg"
                    >
                      Complete Your Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;
