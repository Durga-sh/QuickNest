// frontend/src/services/api.js

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
  }

  // Generic request method using axios
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = getToken();

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await this.axiosInstance({
        url,
        method: options.method || "GET",
        data: options.body ? JSON.stringify(options.body) : undefined,
        ...config,
      });

      return response.data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error.response?.data || new Error("Request failed");
    }
  }

  // Provider-related API methods
  async registerProvider(providerData) {
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
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
