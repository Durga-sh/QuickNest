import axios from "axios";
import { getToken } from "../utils/tokenManager";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const trackingApiService = {
  startTracking: async (bookingId, location) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_URL}/tracking/${bookingId}/start`,
        {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Start tracking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to start tracking"
      );
    }
  },
  updateLocation: async (bookingId, location) => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${API_URL}/tracking/${bookingId}/location`,
        {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Update location error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update location"
      );
    }
  },
  stopTracking: async (bookingId) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_URL}/tracking/${bookingId}/stop`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Stop tracking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to stop tracking"
      );
    }
  },
  getTrackingStatus: async (bookingId) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_URL}/tracking/${bookingId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Get tracking status error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get tracking status"
      );
    }
  },
  getProviderTrackingBookings: async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_URL}/tracking/provider/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Get provider tracking bookings error:", error);
      throw new Error(
        error.response?.data?.message ||
          "Failed to get provider tracking bookings"
      );
    }
  },
};
export default trackingApiService;
