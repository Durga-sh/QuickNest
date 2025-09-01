import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      const serverUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5000";

      this.socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        autoConnect: true,
      });

      this.socket.on("connect", () => {
        console.log("📡 Connected to Socket.io server");
        this.isConnected = true;
      });

      this.socket.on("disconnect", () => {
        console.log("📡 Disconnected from Socket.io server");
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("📡 Socket connection error:", error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Tracking related methods
  joinTracking(bookingId, userType, userId) {
    if (this.socket) {
      this.socket.emit("joinTracking", {
        bookingId,
        userType,
        userId,
      });
    }
  }

  leaveTracking(bookingId) {
    if (this.socket) {
      this.socket.emit("leaveTracking", { bookingId });
    }
  }

  updateLocation(bookingId, latitude, longitude) {
    if (this.socket) {
      this.socket.emit("locationUpdate", {
        bookingId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    }
  }

  updateServiceStatus(bookingId, status, message) {
    if (this.socket) {
      this.socket.emit("serviceStatusUpdate", {
        bookingId,
        status,
        message,
      });
    }
  }

  // Event listeners
  onTrackingJoined(callback) {
    if (this.socket) {
      this.socket.on("trackingJoined", callback);
    }
  }

  onLocationReceived(callback) {
    if (this.socket) {
      this.socket.on("locationReceived", callback);
    }
  }

  onServiceStatusReceived(callback) {
    if (this.socket) {
      this.socket.on("serviceStatusReceived", callback);
    }
  }

  onTrackingStarted(callback) {
    if (this.socket) {
      this.socket.on("trackingStarted", callback);
    }
  }

  onTrackingStopped(callback) {
    if (this.socket) {
      this.socket.on("trackingStopped", callback);
    }
  }

  onProviderOffline(callback) {
    if (this.socket) {
      this.socket.on("providerOffline", callback);
    }
  }

  // Remove event listeners
  offTrackingJoined(callback) {
    if (this.socket) {
      this.socket.off("trackingJoined", callback);
    }
  }

  offLocationReceived(callback) {
    if (this.socket) {
      this.socket.off("locationReceived", callback);
    }
  }

  offServiceStatusReceived(callback) {
    if (this.socket) {
      this.socket.off("serviceStatusReceived", callback);
    }
  }

  offTrackingStarted(callback) {
    if (this.socket) {
      this.socket.off("trackingStarted", callback);
    }
  }

  offTrackingStopped(callback) {
    if (this.socket) {
      this.socket.off("trackingStopped", callback);
    }
  }

  offProviderOffline(callback) {
    if (this.socket) {
      this.socket.off("providerOffline", callback);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
