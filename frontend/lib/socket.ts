import { io } from "socket.io-client";
import { API_URL, SOCKET_EVENTS, APP_CONFIG } from "./config";

export const socket = io(API_URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: APP_CONFIG.RECONNECTION_ATTEMPTS,
  reconnectionDelay: APP_CONFIG.RECONNECTION_DELAY,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

// Connection status tracking
let connectionStatus: "connected" | "disconnected" | "connecting" | "error" = "disconnected";
let reconnectAttempts = 0;

export const getConnectionStatus = () => connectionStatus;
export const getReconnectAttempts = () => reconnectAttempts;

// Setup connection event handlers
socket.on(SOCKET_EVENTS.CONNECT, () => {
  connectionStatus = "connected";
  reconnectAttempts = 0;
  console.log("Socket connected");
});

socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
  connectionStatus = "disconnected";
  console.log("Socket disconnected:", reason);
});

socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
  connectionStatus = "error";
  console.error("Socket connection error:", error);
});

socket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
  connectionStatus = "connected";
  reconnectAttempts = 0;
  console.log("Socket reconnected after", attemptNumber, "attempts");
});

socket.on(SOCKET_EVENTS.RECONNECT_ATTEMPT, (attemptNumber) => {
  reconnectAttempts = attemptNumber;
  connectionStatus = "connecting";
  console.log("Reconnection attempt", attemptNumber);
});

socket.on(SOCKET_EVENTS.RECONNECT_ERROR, (error) => {
  connectionStatus = "error";
  console.error("Reconnection error:", error);
});

socket.on(SOCKET_EVENTS.RECONNECT_FAILED, () => {
  connectionStatus = "error";
  reconnectAttempts = APP_CONFIG.RECONNECTION_ATTEMPTS;
  console.error("Reconnection failed after all attempts");
});

