// frontend/src/api/chatbot.js

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Send message to chatbot
export const sendChatMessage = async (message, context = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.trim(),
        context,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send message");
    }

    return data;
  } catch (error) {
    console.error("Chat message error:", error);
    throw error;
  }
};

// Get chat suggestions
export const getChatSuggestions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chatbot/suggestions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get suggestions");
    }

    return data;
  } catch (error) {
    console.error("Get suggestions error:", error);
    throw error;
  }
};
