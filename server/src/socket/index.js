/**
 * Socket.io Handler
 * File: src/socket/index.js
 */

const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const userSockets = new Map(); // Map<userId, Set<socketId>>

const getOnlineUserIds = () => Array.from(userSockets.keys());

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karaoke_secret_key');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId} (Socket: ${socket.id})`);

    // Add to userSockets map
    if (!userSockets.has(socket.userId)) {
      userSockets.set(socket.userId, new Set());
    }
    userSockets.get(socket.userId).add(socket.id);

    // Join a room with their own ID for private messaging
    socket.join(`user_${socket.userId}`);

    // Send initial online users list to the newly connected client
    socket.emit('online_users', { userIds: getOnlineUserIds() });

    // Broadcast user online status
    socket.broadcast.emit('user_online', { userId: socket.userId });

    // Client can request a fresh snapshot (useful after reconnect)
    socket.on('get_online_users', () => {
      socket.emit('online_users', { userIds: getOnlineUserIds() });
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
      if (userSockets.has(socket.userId)) {
        userSockets.get(socket.userId).delete(socket.id);
        if (userSockets.get(socket.userId).size === 0) {
          userSockets.delete(socket.userId);
          // Broadcast user offline only if all connections are closed
          socket.broadcast.emit('user_offline', { userId: socket.userId });
        }
      }
    });
  });

  return io;
};

// Helper to get IO instance
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Helper to check if user is online
const isUserOnline = (userId) => {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
};

// Helper to emit event to specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  isUserOnline,
  emitToUser
};
