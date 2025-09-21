import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
class VoiceBookingAPI {
  constructor() {
    this.baseURL = `${API_URL}/voice`;
  }
  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
  /**
   * Process voice command with AI
   * @param {string} transcript - Voice transcript
   * @param {boolean} autoBook - Whether to auto-book if possible
   */
  async processVoiceCommand(transcript, autoBook = false) {
    try {
      const response = await axios.post(
        `${this.baseURL}/process-with-ai`,
        { transcript, autoBook },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Voice command processing error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to process voice command"
      );
    }
  }
  /**
   * Get voice booking history
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  async getVoiceBookings(page = 1, limit = 10) {
    try {
      const response = await axios.get(
        `${this.baseURL}/bookings?page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Voice bookings fetch error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch voice bookings"
      );
    }
  }
  /**
   * Get available providers for a service
   * @param {string} service - Service type
   * @param {string} location - Location (optional)
   */
  async getProvidersForService(service, location = null) {
    try {
      const response = await axios.post(
        `${this.baseURL}/get-providers`,
        { service, location },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Get providers error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get providers"
      );
    }
  }
  /**
   * Validate voice command data
   * @param {Object} extractedData - Extracted voice data
   */
  async validateVoiceCommand(extractedData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/validate-command`,
        { extractedData },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Voice command validation error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to validate voice command"
      );
    }
  }
}
export default new VoiceBookingAPI();
