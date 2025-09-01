const app = require("./app");
const config = require("./config/config");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const PORT = config.PORT;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store active tracking sessions
const trackingSessions = new Map(); // bookingId -> { providerId, userId, socketId }

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`📱 User connected: ${socket.id}`);

  // Join tracking room for a specific booking
  socket.on("joinTracking", (data) => {
    const { bookingId, userType, userId } = data;
    console.log(`🚗 ${userType} joining tracking for booking ${bookingId}`);

    socket.join(`tracking_${bookingId}`);

    // Store session info
    if (userType === "provider") {
      const session = trackingSessions.get(bookingId) || {};
      session.providerId = userId;
      session.providerSocketId = socket.id;
      trackingSessions.set(bookingId, session);
    } else if (userType === "user") {
      const session = trackingSessions.get(bookingId) || {};
      session.userId = userId;
      session.userSocketId = socket.id;
      trackingSessions.set(bookingId, session);
    }

    socket.emit("trackingJoined", { bookingId, userType });
  });

  // Handle location updates from provider
  socket.on("locationUpdate", (data) => {
    const { bookingId, latitude, longitude, timestamp } = data;
    console.log(
      `📍 Location update for booking ${bookingId}: ${latitude}, ${longitude}`
    );

    // Broadcast location to users in the same tracking room
    socket.to(`tracking_${bookingId}`).emit("locationReceived", {
      bookingId,
      latitude,
      longitude,
      timestamp: timestamp || new Date().toISOString(),
    });
  });

  // Handle service status updates
  socket.on("serviceStatusUpdate", (data) => {
    const { bookingId, status, message } = data;
    console.log(`🔄 Service status update for booking ${bookingId}: ${status}`);

    socket.to(`tracking_${bookingId}`).emit("serviceStatusReceived", {
      bookingId,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave tracking room
  socket.on("leaveTracking", (data) => {
    const { bookingId } = data;
    console.log(`👋 Leaving tracking for booking ${bookingId}`);
    socket.leave(`tracking_${bookingId}`);

    // Clean up session
    const session = trackingSessions.get(bookingId);
    if (session) {
      if (session.providerSocketId === socket.id) {
        delete session.providerSocketId;
        delete session.providerId;
      }
      if (session.userSocketId === socket.id) {
        delete session.userSocketId;
        delete session.userId;
      }

      if (!session.providerSocketId && !session.userSocketId) {
        trackingSessions.delete(bookingId);
      } else {
        trackingSessions.set(bookingId, session);
      }
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`📱 User disconnected: ${socket.id}`);

    // Clean up tracking sessions
    for (const [bookingId, session] of trackingSessions.entries()) {
      if (
        session.providerSocketId === socket.id ||
        session.userSocketId === socket.id
      ) {
        if (session.providerSocketId === socket.id) {
          delete session.providerSocketId;
          delete session.providerId;
          // Notify users that provider is offline
          socket
            .to(`tracking_${bookingId}`)
            .emit("providerOffline", { bookingId });
        }
        if (session.userSocketId === socket.id) {
          delete session.userSocketId;
          delete session.userId;
        }

        if (!session.providerSocketId && !session.userSocketId) {
          trackingSessions.delete(bookingId);
        } else {
          trackingSessions.set(bookingId, session);
        }
      }
    }
  });
});

// Make io accessible to routes
app.set("io", io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for real-time tracking`);
});
