/**
 * Configuration centralisée de l'application
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Helper to get file URL
export const getFileUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
};

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_URL}/api/login`,
  REGISTER: `${API_URL}/api/register`,
  ME: `${API_URL}/api/me`,
  
  // Users
  USERS: `${API_URL}/api/users`,
  USER_PROFILE: (id: number) => `${API_URL}/api/users/${id}/profile`,
  USER_STATUS: `${API_URL}/api/user/status`,
  
  // Channels
  CHANNELS: `${API_URL}/api/channels`,
  CHANNEL: (id: number) => `${API_URL}/api/channels/${id}`,
  CHANNEL_MEMBERS: (id: number) => `${API_URL}/api/channels/${id}/members`,
  
  // Messages
  MESSAGES_PIN: `${API_URL}/api/messages/pin`,
  MESSAGES_UNPIN: `${API_URL}/api/messages/unpin`,
  
  // Files
  UPLOAD: `${API_URL}/api/upload`,
  FILE: (filename: string) => `${API_URL}/api/files/${filename}`,
  AVATAR_PROXY: (url: string) => `${API_URL}/api/avatar-proxy?url=${encodeURIComponent(url)}`,
  
  // Search
  SEARCH: `${API_URL}/api/search`,
} as const;

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

