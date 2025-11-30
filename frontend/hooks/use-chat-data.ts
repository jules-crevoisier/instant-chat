import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { socket } from "@/lib/socket";

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
          fetch("http://localhost:3001/api/channels", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3001/api/users", {
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
          setChannels((prev) => [...prev, newChannel]);
      };

      const onChannelDeleted = (channelId: number) => {
          setChannels((prev) => prev.filter((c) => c.id !== channelId));
      };

      socket.on("user_status_updated", onUserStatusUpdated);
      socket.on("channel_created", onChannelCreated);
      socket.on("channel_deleted", onChannelDeleted);

      return () => {
          socket.off("user_status_updated", onUserStatusUpdated);
          socket.off("channel_created", onChannelCreated);
          socket.off("channel_deleted", onChannelDeleted);
      };
  }, []);

  return { channels, users, isLoading };
}
