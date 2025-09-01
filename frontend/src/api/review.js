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
        // Check if it's a review not found error (404 with specific message)
        const is404 = error.response?.status === 404;
        const isBookingEndpoint = error.config?.url?.includes("/booking/");

        // Suppress all 404 errors on booking endpoints - they're expected
        if (is404 && isBookingEndpoint) {
          // Don't log anything for expected 404s on booking endpoints
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
      // Only log unexpected errors for request method (suppress 404 on booking endpoints)
      const is404 = error.response?.status === 404;
      const isBookingEndpoint = endpoint?.includes("/booking/");

      if (!(is404 && isBookingEndpoint)) {
        console.error("Review API Request failed:", error);
      }
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
    try {
      return await this.request(`/booking/${bookingId}`, {
        method: "GET",
      });
    } catch (error) {
      // Don't log "Review not found" as an error - it's expected for bookings without reviews
      if (
        error.message.includes("Review not found") ||
        error.message.includes("404")
      ) {
        throw new Error("REVIEW_NOT_FOUND");
      }
      throw error;
    }
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
      if (error.message === "REVIEW_NOT_FOUND") {
        return true; // No review found, can review
      }
      throw error;
    }
  }

  // Check if a review exists for a booking (returns boolean, doesn't throw)
  async hasReview(bookingId) {
    try {
      await this.request(`/booking/${bookingId}`, {
        method: "GET",
      });
      return true; // Review exists
    } catch {
      // All errors mean no review exists (404, network issues, etc.)
      return false;
    }
  }
}

// Create and export singleton instance
const reviewApiService = new ReviewApiService();
export default reviewApiService;
