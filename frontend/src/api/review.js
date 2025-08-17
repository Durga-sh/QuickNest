// frontend/src/api/review.js
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

    // Add response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Review API Error:", error);
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

  // Generic request method
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
      console.error("Review API Request failed:", error);
      throw error;
    }
  }

  // Submit a new review
  async submitReview(reviewData) {
    return this.request("/submit", {
      method: "POST",
      body: reviewData,
    });
  }

  // Get reviews for a provider
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

  // Get review by booking ID
  async getReviewByBooking(bookingId) {
    return this.request(`/booking/${bookingId}`, {
      method: "GET",
    });
  }

  // Get user's reviews
  async getUserReviews(page = 1, limit = 10) {
    return this.request(`/my-reviews?page=${page}&limit=${limit}`, {
      method: "GET",
    });
  }

  // Update a review
  async updateReview(reviewId, reviewData) {
    return this.request(`/${reviewId}`, {
      method: "PUT",
      body: reviewData,
    });
  }

  // Delete a review
  async deleteReview(reviewId) {
    return this.request(`/${reviewId}`, {
      method: "DELETE",
    });
  }

  // Check if user can review a booking
  async canReviewBooking(bookingId) {
    try {
      await this.getReviewByBooking(bookingId);
      return false; // Review already exists
    } catch (error) {
      if (error.message.includes("Review not found")) {
        return true; // No review found, can review
      }
      throw error;
    }
  }
}

// Create and export singleton instance
const reviewApiService = new ReviewApiService();
export default reviewApiService;
