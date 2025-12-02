/**
 * Configuration centralisée de l'application
 */

const STORAGE_KEY = "instant_chat_server_url";
const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Get the server URL from localStorage or default
 */
export const getServerUrl = (): string => {
  if (typeof window === "undefined") {
    return DEFAULT_API_URL;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored || DEFAULT_API_URL;
};

/**
 * Set the server URL in localStorage
 */
export const setServerUrl = (url: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, url);
};

/**
 * Validate server URL by attempting to connect
 */
export const validateServerUrl = async (url: string): Promise<boolean> => {
  try {
    // Remove trailing slash
    const cleanUrl = url.replace(/\/$/, "");
    
    // Try to fetch a simple endpoint (like /api/me or health check)
    // We'll use a timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(`${cleanUrl}/api/me`, {
        method: "GET",
        signal: controller.signal,
        // Don't send auth, just check if server responds
      });
      clearTimeout(timeoutId);
      // Any response (even 401) means server is reachable
      return true;
    } catch (error) {
      clearTimeout(timeoutId);
      // If it's an abort, try a simpler check
      if (error instanceof Error && error.name === "AbortError") {
        // Try a simple fetch without auth
        try {
          await fetch(`${cleanUrl}/api/channels`, {
            method: "GET",
            signal: AbortSignal.timeout(3000),
          });
          return true;
        } catch {
          return false;
        }
      }
      // Network errors mean server is not reachable
      return false;
    }
  } catch {
    return false;
  }
};

/**
 * Get the current API URL
 */
export const getAPIUrl = (): string => {
  return getServerUrl();
};

// For backward compatibility, export API_URL as a getter
// Note: This is evaluated once at module load. Use getServerUrl() for dynamic access.
export const API_URL = getServerUrl();

/**
 * API Endpoints - dynamically generated based on current server URL
 * Uses a Proxy to always return current server URL
 */
const createAPIEndpoints = () => {
  return new Proxy({} as ReturnType<typeof getAPIEndpoints>, {
    get(_target, prop) {
      const baseUrl = getServerUrl();
      const endpoints = {
        // Authentication
        LOGIN: `${baseUrl}/api/login`,
        REGISTER: `${baseUrl}/api/register`,
        ME: `${baseUrl}/api/me`,
        
        // Users
        USERS: `${baseUrl}/api/users`,
        USER_PROFILE: (id: number) => `${baseUrl}/api/users/${id}/profile`,
        USER_STATUS: `${baseUrl}/api/user/status`,
        
        // Channels
        CHANNELS: `${baseUrl}/api/channels`,
        CHANNEL: (id: number) => `${baseUrl}/api/channels/${id}`,
        CHANNEL_MEMBERS: (id: number) => `${baseUrl}/api/channels/${id}/members`,
        
        // Messages
        MESSAGES_PIN: `${baseUrl}/api/messages/pin`,
        MESSAGES_UNPIN: `${baseUrl}/api/messages/unpin`,
        
        // Files
        UPLOAD: `${baseUrl}/api/upload`,
        FILE: (filename: string) => `${baseUrl}/api/files/${filename}`,
        AVATAR_PROXY: (url: string) => `${baseUrl}/api/avatar-proxy?url=${encodeURIComponent(url)}`,
        
        // Search
        SEARCH: `${baseUrl}/api/search`,
      };
      return endpoints[prop as keyof typeof endpoints];
    },
  });
};

// Export API_ENDPOINTS as a Proxy for backward compatibility
export const API_ENDPOINTS = createAPIEndpoints();

/**
 * Helper function to get API endpoints (alternative to using the Proxy)
 */
export const getAPIEndpoints = () => {
  const baseUrl = getServerUrl();
  return {
    // Authentication
    LOGIN: `${baseUrl}/api/login`,
    REGISTER: `${baseUrl}/api/register`,
    ME: `${baseUrl}/api/me`,
    
    // Users
    USERS: `${baseUrl}/api/users`,
    USER_PROFILE: (id: number) => `${baseUrl}/api/users/${id}/profile`,
    USER_STATUS: `${baseUrl}/api/user/status`,
    
    // Channels
    CHANNELS: `${baseUrl}/api/channels`,
    CHANNEL: (id: number) => `${baseUrl}/api/channels/${id}`,
    CHANNEL_MEMBERS: (id: number) => `${baseUrl}/api/channels/${id}/members`,
    
    // Messages
    MESSAGES_PIN: `${baseUrl}/api/messages/pin`,
    MESSAGES_UNPIN: `${baseUrl}/api/messages/unpin`,
    
    // Files
    UPLOAD: `${baseUrl}/api/upload`,
    FILE: (filename: string) => `${baseUrl}/api/files/${filename}`,
    AVATAR_PROXY: (url: string) => `${baseUrl}/api/avatar-proxy?url=${encodeURIComponent(url)}`,
    
    // Search
    SEARCH: `${baseUrl}/api/search`,
  } as const;
};

// Helper to get file URL
export const getFileUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${getServerUrl()}${path}`;
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  RECONNECT: "reconnect",
  RECONNECT_ATTEMPT: "reconnect_attempt",
  RECONNECT_ERROR: "reconnect_error",
  RECONNECT_FAILED: "reconnect_failed",
  
  // User
  USER_LOGIN: "user_login",
  USER_STATUS_UPDATE: "user_status_update",
  USER_STATUS_UPDATED: "user_status_updated",
  USER_UPDATED: "user_updated",
  USER_TYPING: "user_typing",
  USER_STOPPED_TYPING: "user_stopped_typing",
  
  // Channels
  JOIN_CHANNEL: "join_channel",
  CREATE_CHANNEL: "create_channel",
  DELETE_CHANNEL: "delete_channel",
  CHANNEL_CREATED: "channel_created",
  CHANNEL_DELETED: "channel_deleted",
  
  // Messages
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  MESSAGE_HISTORY: "message_history",
  MORE_MESSAGES: "more_messages",
  LOAD_MORE_MESSAGES: "load_more_messages",
  MESSAGE_EDITED: "message_edited",
  MESSAGE_DELETED: "message_deleted",
  EDIT_MESSAGE: "edit_message",
  DELETE_MESSAGE: "delete_message",
  REACTION_UPDATE: "reaction_update",
  MESSAGE_PINNED: "message_pinned",
  GET_PINNED_MESSAGES: "get_pinned_messages",
  PINNED_MESSAGES: "pinned_messages",
  
  // DM
  JOIN_DM: "join_dm",
  NEW_CONVERSATION: "new_conversation",
  
  // Voice
  JOIN_VOICE_ROOM: "joinVoiceRoom",
  LEAVE_VOICE_ROOM: "leaveVoiceRoom",
  VOICE_ROOM_JOINED: "voiceRoomJoined",
  USER_JOINED_VOICE: "userJoinedVoice",
  USER_LEFT_VOICE: "userLeftVoice",
  SCREEN_SHARE_OFFER: "screenShareOffer",
  SCREEN_SHARE_ANSWER: "screenShareAnswer",
  USER_STARTED_SCREEN_SHARE: "userStartedScreenShare",
  USER_STOPPED_SCREEN_SHARE: "userStoppedScreenShare",
} as const;

export const APP_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MESSAGE_PAGE_SIZE: 30, // Messages per page load
  INITIAL_MESSAGE_LIMIT: 20, // Initial load limit (Discord-like)
  TYPING_TIMEOUT: 2000,
  DRAFT_SAVE_DELAY: 500, // ms
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  VIRTUALIZATION_OVERSCAN: 5, // Number of items to render outside visible area
  SCROLL_THRESHOLD: 200, // Pixels from top to trigger loading more messages
} as const;

