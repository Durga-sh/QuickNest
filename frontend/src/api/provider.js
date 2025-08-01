// frontend/src/api/provider.js

import axios from "axios";
import { getToken, setAuthHeader } from "../utils/tokenManager";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Initialize axios instance with base URL and default headers
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
    });

    // Set auth header if token exists
    const token = getToken();
    if (token) {
      setAuthHeader(this.axiosInstance);
    }

    // Add response interceptor to handle errors globally
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);

        // Handle different error types
        if (error.response) {
          // Server responded with error status
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Server error: ${error.response.status}`;
          throw new Error(errorMessage);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error("Network error: Unable to connect to server");
        } else {
          // Something else happened
          throw new Error(error.message || "Unknown error occurred");
        }
      }
    );
  }

  // Generic request method using axios
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

      // Remove body from config if it exists (axios uses 'data')
      delete config.body;

      const response = await this.axiosInstance(config);
      return response.data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Provider-related API methods
  async registerProvider(providerData) {
    console.log("Registering provider with data:", providerData);
    return this.request("/provider/register", {
      method: "POST",
      body: providerData,
    });
  }

  async updateProviderProfile(providerData) {
    return this.request("/provider/profile", {
      method: "PUT",
      body: providerData,
    });
  }

  async getProviderProfile() {
    return this.request("/provider/profile", {
      method: "GET",
    });
  }

  async getProviderById(providerId) {
    return this.request(`/provider/${providerId}`, {
      method: "GET",
    });
  }

  async approveOrRejectProvider(providerId, status) {
    return this.request("/provider/approve-reject", {
      method: "POST",
      body: { providerId, status },
    });
  }

  // New methods for getting all providers with filtering
  async getAllProviders(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        queryParams.append(key, filters[key]);
      }
    });

    const endpoint = `/provider/all${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return this.request(endpoint, {
      method: "GET",
    });
  }

  async getAvailableSkills() {
    return this.request("/provider/skills", {
      method: "GET",
    });
  }

  async searchProviders(query, page = 1, limit = 10) {
    const queryParams = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.request(`/provider/search?${queryParams.toString()}`, {
      method: "GET",
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
