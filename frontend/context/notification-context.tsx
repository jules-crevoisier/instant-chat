"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export interface Notification {
  id: string;
  type: "message" | "mention" | "dm" | "channel";
  title: string;
  body: string;
  channelId?: number;
  userId?: number;
  channelName?: string;
  username?: string;
  avatar?: string;
  avatarColor?: string;
  timestamp: Date;
  read: boolean;
  messageId?: number;
}

interface ActiveChat {
  type: "channel" | "dm";
  id: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  unreadByChannel: Map<number, number>;
  unreadByUser: Map<number, number>;
  markAsRead: (notificationId: string) => void;
  markChannelAsRead: (channelId: number) => void;
  markUserAsRead: (userId: number) => void;
  clearAll: () => void;
  playSound: () => void;
  enableSound: boolean;
  setEnableSound: (enabled: boolean) => void;
  enableDesktopNotifications: boolean;
  setEnableDesktopNotifications: (enabled: boolean) => void;
  setActiveChat: (chat: ActiveChat | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadByChannel, setUnreadByChannel] = useState<Map<number, number>>(new Map());
  const [unreadByUser, setUnreadByUser] = useState<Map<number, number>>(new Map());
  const [activeChat, setActiveChatState] = useState<ActiveChat | null>(null);
  const [enableSound, setEnableSound] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notification_sound_enabled");
      return stored !== null ? stored === "true" : true;
    }
    return true;
  });
  const [enableDesktopNotifications, setEnableDesktopNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notification_desktop_enabled");
      return stored !== null ? stored === "true" : true;
    }
    return true;
  });

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem("notification_sound_enabled", String(enableSound));
  }, [enableSound]);

  // Save desktop notification preference
  useEffect(() => {
    localStorage.setItem("notification_desktop_enabled", String(enableDesktopNotifications));
  }, [enableDesktopNotifications]);

  // Play notification sound
  const playSound = useCallback(() => {
    if (!enableSound) return;
    
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZVA4PVKzn77BdGAg+ltryy3kpBSl+zfLZijcIGWi77+efTQ8MUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQYxh9Hz04IzBh5uwO/jmVQOD1Ss5++wXRgIPpba8st5KQUpfs3y2Yo3CBlo");
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if audio can't play
      });
    } catch (error) {
      // Fallback: use a simple beep
      console.log("Notification sound");
    }
  }, [enableSound]);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 100)); // Keep last 100

    // Update unread counts
    if (notification.channelId) {
      setUnreadByChannel((prev) => {
        const newMap = new Map(prev);
        newMap.set(notification.channelId!, (newMap.get(notification.channelId!) || 0) + 1);
        return newMap;
      });
    }
    if (notification.userId) {
      setUnreadByUser((prev) => {
        const newMap = new Map(prev);
        newMap.set(notification.userId!, (newMap.get(notification.userId!) || 0) + 1);
        return newMap;
      });
    }

    // Play sound
    playSound();

    // Show desktop notification
    if (enableDesktopNotifications && !document.hasFocus()) {
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.avatar || "/icon.png",
          tag: notification.channelId ? `channel-${notification.channelId}` : notification.userId ? `user-${notification.userId}` : undefined,
        });
      }
    }

    // Show toast notification
    toast.info(notification.title, {
      description: notification.body,
    });
  }, [playSound, enableDesktopNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all notifications for a channel as read
  const markChannelAsRead = useCallback((channelId: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.channelId === channelId ? { ...n, read: true } : n))
    );
    setUnreadByChannel((prev) => {
      const newMap = new Map(prev);
      newMap.delete(channelId);
      return newMap;
    });
  }, []);

  // Mark all notifications for a user as read
  const markUserAsRead = useCallback((userId: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, read: true } : n))
    );
    setUnreadByUser((prev) => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadByChannel(new Map());
    setUnreadByUser(new Map());
  }, []);

  // Listen for messages via socket
  useEffect(() => {
    const handleReceiveMessage = (msg: any) => {
      // Don't notify for messages from the current user
      if (msg.sender_id === user?.id) {
        return;
      }
      
      // Check if this message is for the current active chat
      const isForActiveChat = 
        (activeChat?.type === "channel" && msg.channel_id === activeChat.id) ||
        (activeChat?.type === "dm" && (
          msg.sender_id === activeChat.id || 
          msg.recipient_id === activeChat.id
        ));
      
      // Only notify if:
      // 1. Window is not focused, OR
      // 2. Message is not for the active chat
      const shouldNotify = !document.hasFocus() || !isForActiveChat;
      
      if (shouldNotify) {
        if (msg.channel_id) {
          addNotification({
            type: "channel",
            title: `#${msg.channelName || "Channel"}`,
            body: `${msg.username}: ${msg.message || "Sent an attachment"}`,
            channelId: msg.channel_id,
            channelName: msg.channelName,
            username: msg.username,
            avatar: msg.avatar,
            avatarColor: msg.avatar_color,
            messageId: msg.id,
          });
        } else if (msg.recipient_id || msg.sender_id) {
          addNotification({
            type: "dm",
            title: msg.username,
            body: msg.message || "Sent an attachment",
            userId: msg.sender_id,
            username: msg.username,
            avatar: msg.avatar,
            avatarColor: msg.avatar_color,
            messageId: msg.id,
          });
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [addNotification, activeChat, user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const setActiveChat = useCallback((chat: ActiveChat | null) => {
    setActiveChatState(chat);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        unreadByChannel,
        unreadByUser,
        markAsRead,
        markChannelAsRead,
        markUserAsRead,
        clearAll,
        playSound,
        enableSound,
        setEnableSound,
        enableDesktopNotifications,
        setEnableDesktopNotifications,
        setActiveChat,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

