import axios from "axios";
import { getToken } from "../utils/tokenManager";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
class ReviewApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/reviews`;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
    });
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const is404 = error.response?.status === 404;
        const isBookingEndpoint = error.config?.url?.includes("/booking/");
        if (is404 && isBookingEndpoint) {
        } else {
          console.error("Review API Error:", error);
        }
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
      const is404 = error.response?.status === 404;
      const isBookingEndpoint = endpoint?.includes("/booking/");
      if (!(is404 && isBookingEndpoint)) {
        console.error("Review API Request failed:", error);
      }
      throw error;
    }
  }
  async submitReview(reviewData) {
    return this.request("/submit", {
      method: "POST",
      body: reviewData,
    });
  }
  async getProviderReviews(
    providerId,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc"
  ) {
    return this.request(
      `/provider/${providerId}?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      {
        method: "GET",
      }
    );
  }
  async getReviewByBooking(bookingId) {
    try {
      return await this.request(`/booking/${bookingId}`, {
        method: "GET",
      });
    } catch (error) {
      if (
        error.message.includes("Review not found") ||
        error.message.includes("404")
      ) {
        throw new Error("REVIEW_NOT_FOUND");
      }
      throw error;
    }
  }
  async getUserReviews(page = 1, limit = 10) {
    return this.request(`/my-reviews?page=${page}&limit=${limit}`, {
      method: "GET",
    });
  }
  async updateReview(reviewId, reviewData) {
    return this.request(`/${reviewId}`, {
      method: "PUT",
      body: reviewData,
    });
  }
  async deleteReview(reviewId) {
    return this.request(`/${reviewId}`, {
      method: "DELETE",
    });
  }
  async canReviewBooking(bookingId) {
    try {
      await this.getReviewByBooking(bookingId);
      return false; // Review already exists
    } catch (error) {
      if (error.message === "REVIEW_NOT_FOUND") {
        return true; // No review found, can review
      }
      throw error;
    }
  }
  async hasReview(bookingId) {
    try {
      await this.request(`/booking/${bookingId}`, {
        method: "GET",
      });
      return true; // Review exists
    } catch {
      return false;
    }
  }
}
const reviewApiService = new ReviewApiService();
export default reviewApiService;
