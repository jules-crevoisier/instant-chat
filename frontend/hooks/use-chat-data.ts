import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { socket } from "@/lib/socket";
import { API_ENDPOINTS, SOCKET_EVENTS } from "@/lib/config";

export interface Channel {
  id: number;
  name: string;
  description: string;
  icon: string;
  voice_channel: number; // 0 or 1
}

export interface User {
  id: number;
  username: string;
  bio?: string;
  avatar?: string;
  avatar_color?: string;
  status: string;
}

export function useChatData() {
  const { token } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [channelsRes, usersRes] = await Promise.all([
          fetch(API_ENDPOINTS.CHANNELS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_ENDPOINTS.USERS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (channelsRes.ok) {
          setChannels(await channelsRes.json());
        }
        if (usersRes.ok) {
          setUsers(await usersRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch chat data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Listen for real-time updates
  useEffect(() => {
      const onUserStatusUpdated = (data: { userId: number; status: string }) => {
          setUsers((prevUsers) => 
              prevUsers.map((u) => 
                  u.id === data.userId ? { ...u, status: data.status } : u
              )
          );
      };

      const onChannelCreated = (newChannel: Channel) => {
          setChannels((prev) => {
              if (prev.find(c => c.id === newChannel.id)) return prev;
              return [...prev, newChannel];
          });
      };

      const onChannelUpdated = (updatedChannel: Channel) => {
          setChannels((prev) => prev.map(c => c.id === updatedChannel.id ? updatedChannel : c));
      };

      const onChannelDeleted = (deletedChannel: { id: number }) => {
          setChannels((prev) => prev.filter((c) => c.id !== deletedChannel.id));
      };

      socket.on(SOCKET_EVENTS.USER_STATUS_UPDATED, onUserStatusUpdated);
      socket.on(SOCKET_EVENTS.CHANNEL_CREATED, onChannelCreated);
      socket.on("channel_updated", onChannelUpdated);
      socket.on(SOCKET_EVENTS.CHANNEL_DELETED, onChannelDeleted);

      return () => {
          socket.off(SOCKET_EVENTS.USER_STATUS_UPDATED, onUserStatusUpdated);
          socket.off(SOCKET_EVENTS.CHANNEL_CREATED, onChannelCreated);
          socket.off("channel_updated", onChannelUpdated);
          socket.off(SOCKET_EVENTS.CHANNEL_DELETED, onChannelDeleted);
      };
  }, []);

  return { channels, users, isLoading };
}
