import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add useNavigate
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
  const navigate = useNavigate(); // Initialize useNavigate
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
    navigate("/create-service"); // Use navigate instead of window.location.href
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className="p-3 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                ServiceHub Provider
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Welcome back, {providerData.user.name}!
                </h2>
                <p className="text-blue-100 mt-1">
                  Status:{" "}
                  <span className="capitalize font-semibold">
                    {providerData.status}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <span className="text-xl font-bold">
                    {providerData.rating}
                  </span>
                </div>
                <p className="text-blue-100 text-sm">Rating</p>
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={redirectToCreateService}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 transform hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Create Service</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 transform hover:scale-105">
                <Edit className="h-5 w-5" />
                <span>Edit Profile</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 transform hover:scale-105">
                <Eye className="h-5 w-5" />
                <span>View Bookings</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 transform hover:scale-105">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </button>
            </div>
          </div>

          {/* Current Services */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Services
              </h3>
              <button
                onClick={redirectToCreateService}
                className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                + Add New Service
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providerData.pricing.map((service, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-gray-900">
                    {service.service}
                  </h4>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    ${service.price}
                  </p>
                  <div className="flex space-x-2 mt-3">
                    <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                      Edit
                    </button>
                    <button className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors">
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {providerData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Completed job: Kitchen Sink Repair
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    New booking request received
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Profile updated successfully
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action for New Providers */}
          {providerData.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-yellow-800 font-bold text-sm">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
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
                      className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
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
