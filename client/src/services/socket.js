/**
 * Socket.io Client Service
 * File: src/services/socket.js
 */

import { io } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";

let socket;
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : '';

export const connectSocket = () => {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (!token) return;

  if (socket && socket.connected) return;

  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on("connect", () => {
    console.log("🟢 Connected to Socket.io:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("🔴 Socket connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Disconnected from Socket.io:", reason);
  });

  return socket;
};

export const getSocket = () => {
    if(!socket) {
        return connectSocket();
    }
    return socket;
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
