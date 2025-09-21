import axios from "axios";
import { getToken } from "../utils/tokenManager";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
class BookingApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/booking`;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
    });
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Booking API Error:", error);
        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Server error: ${error.response.status}`;
          throw new Error(errorMessage);
        } else if (error.request) {
          throw new Error("Network error: Unable to connect to server");
        } else {
          throw new Error(error.message || "Unknown error occurred");
        }
      }
    );
  }
  async request(endpoint, options = {}) {
    const token = getToken();
    try {
      const config = {
        url: endpoint,
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        data: options.body,
        ...options,
      };
      delete config.body;
      const response = await this.axiosInstance(config);
      return response.data;
    } catch (error) {
      console.error("Booking API Request failed:", error);
      throw error;
    }
  }
  async createOrder(bookingData) {
    return this.request("/create-order", {
      method: "POST",
      body: bookingData,
    });
  }
  async verifyPayment(paymentData) {
    return this.request("/verify-payment", {
      method: "POST",
      body: paymentData,
    });
  }
  async getUserBookings(page = 1, limit = 10) {
    return this.request(`/user?page=${page}&limit=${limit}`, {
      method: "GET",
    });
  }
  async getProviderBookings(page = 1, limit = 10) {
    return this.request(`/provider?page=${page}&limit=${limit}`, {
      method: "GET",
    });
  }
  async getBookingById(bookingId) {
    return this.request(`/${bookingId}`, {
      method: "GET",
    });
  }
  async updateBookingStatus(bookingId, status) {
    return this.request(`/${bookingId}/status`, {
      method: "PUT",
      body: { status },
    });
  }
}
const bookingApiService = new BookingApiService();
export default bookingApiService;
