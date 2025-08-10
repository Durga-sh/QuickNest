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

  // New method for adding services to existing provider
  async addServicesToProvider(serviceData) {
    console.log("Adding services to provider with data:", serviceData);
    return this.request("/provider/add-services", {
      method: "POST",
      body: serviceData,
    });
  }

  // New method for removing a service
  async removeService(serviceName) {
    return this.request(
      `/provider/service/${encodeURIComponent(serviceName)}`,
      {
        method: "DELETE",
      }
    );
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

  // Enhanced getAllProviders with proper location handling
  async getAllProviders(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        // Handle location parameter properly
        if (key === "location" && filters[key]) {
          queryParams.append(key, filters[key]);
        }
        // Handle other numeric parameters
        else if (
          key === "radius" ||
          key === "minPrice" ||
          key === "maxPrice" ||
          key === "page" ||
          key === "limit"
        ) {
          const numValue = parseFloat(filters[key]);
          if (!isNaN(numValue)) {
            queryParams.append(key, numValue.toString());
          }
        }
        // Handle string parameters
        else {
          queryParams.append(key, filters[key].toString());
        }
      }
    });

    const endpoint = `/provider/all${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    console.log("API Request URL:", `${this.baseURL}${endpoint}`);
    return this.request(endpoint, {
      method: "GET",
    });
  }

  async getAvailableSkills() {
    return this.request("/provider/skills", {
      method: "GET",
    });
  }

  // Enhanced searchProviders with location support
  async searchProviders(query, page = 1, limit = 10, additionalParams = {}) {
    const queryParams = new URLSearchParams({
      query: query.toString(),
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add additional parameters like location, radius, etc.
    Object.keys(additionalParams).forEach((key) => {
      if (
        additionalParams[key] !== undefined &&
        additionalParams[key] !== null &&
        additionalParams[key] !== ""
      ) {
        queryParams.append(key, additionalParams[key].toString());
      }
    });

    const endpoint = `/provider/search?${queryParams.toString()}`;
    console.log("Search API Request URL:", `${this.baseURL}${endpoint}`);

    return this.request(endpoint, {
      method: "GET",
    });
  }

  // New method to get providers by specific skill with location filtering
  async getProvidersBySkill(skill, filters = {}) {
    const queryParams = new URLSearchParams();

    // Add skill to filters
    const skillFilters = { ...filters, skill };

    Object.keys(skillFilters).forEach((key) => {
      if (
        skillFilters[key] !== undefined &&
        skillFilters[key] !== null &&
        skillFilters[key] !== ""
      ) {
        if (key === "location" && skillFilters[key]) {
          queryParams.append(key, skillFilters[key]);
        } else if (
          key === "radius" ||
          key === "minPrice" ||
          key === "maxPrice" ||
          key === "page" ||
          key === "limit"
        ) {
          const numValue = parseFloat(skillFilters[key]);
          if (!isNaN(numValue)) {
            queryParams.append(key, numValue.toString());
          }
        } else {
          queryParams.append(key, skillFilters[key].toString());
        }
      }
    });

    const endpoint = `/provider/skill/${encodeURIComponent(skill)}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    console.log("Skill-based API Request URL:", `${this.baseURL}${endpoint}`);
    return this.request(endpoint, {
      method: "GET",
    });
  }

  // Utility method to format location for API calls
  formatLocationForAPI(lat, lng) {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return null;
    }
    return `${lng},${lat}`; // Backend expects longitude,latitude format
  }

  // Method to validate location data
  validateLocation(location) {
    if (!location) return false;

    const { lat, lng } = location;
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
