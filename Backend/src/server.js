const app = require("./app");
const config = require("./config/config");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();
const PORT = config.PORT;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const trackingSessions = new Map(); // bookingId -> { providerId, userId, socketId }
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("joinTracking", (data) => {
    const { bookingId, userType, userId } = data;
    console.log(` ${userType} joining tracking for booking ${bookingId}`);
    socket.join(`tracking_${bookingId}`);
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
  socket.on("locationUpdate", (data) => {
    const { bookingId, latitude, longitude, timestamp } = data;
    console.log(
      `Location update for booking ${bookingId}: ${latitude}, ${longitude}`
    );
    socket.to(`tracking_${bookingId}`).emit("locationReceived", {
      bookingId,
      latitude,
      longitude,
      timestamp: timestamp || new Date().toISOString(),
    });
  });
  socket.on("serviceStatusUpdate", (data) => {
    const { bookingId, status, message } = data;
    console.log(`Service status update for booking ${bookingId}: ${status}`);
    socket.to(`tracking_${bookingId}`).emit("serviceStatusReceived", {
      bookingId,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  });
  socket.on("leaveTracking", (data) => {
    const { bookingId } = data;
    console.log(`Leaving tracking for booking ${bookingId}`);
    socket.leave(`tracking_${bookingId}`);
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
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [bookingId, session] of trackingSessions.entries()) {
      if (
        session.providerSocketId === socket.id ||
        session.userSocketId === socket.id
      ) {
        if (session.providerSocketId === socket.id) {
          delete session.providerSocketId;
          delete session.providerId;
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
app.set("io", io);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for real-time tracking`);
});
