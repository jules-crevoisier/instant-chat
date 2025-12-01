"use client";

import { useState, useEffect } from "react";
import { useChatData, Channel, User } from "@/hooks/use-chat-data";
import { Sidebar } from "./sidebar";
import { ChatArea } from "./chat-area";
import { MembersSidebar } from "./members-sidebar";
import { VoiceArea } from "./voice-area";
import { SearchModal } from "@/components/search/search-modal";
import { ConnectionStatus } from "@/components/connection-status";
import { socket } from "@/lib/socket";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notification-context";

export type ChatType = "channel" | "dm";

export interface ActiveChat {
  type: ChatType;
  id: number; // channelId or userId
  name: string; // channel name or username
  icon?: string; // channel icon or avatar
  recipientId?: number; // for DMs
}

export function ChatLayout() {
  const { channels, users, isLoading } = useChatData();
  const { user } = useAuth();
  const { setActiveChat: setNotificationActiveChat } = useNotifications();
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [connectedVoiceChannelId, setConnectedVoiceChannelId] = useState<number | null>(null);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Update notification context when active chat changes
  useEffect(() => {
    if (activeChat) {
      setNotificationActiveChat({
        type: activeChat.type,
        id: activeChat.id,
      });
    } else {
      setNotificationActiveChat(null);
    }
  }, [activeChat, setNotificationActiveChat]);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Join socket rooms when active chat changes
  useEffect(() => {
    if (activeChat && user) {
      if (activeChat.type === "channel") {
        socket.emit("join_channel", activeChat.id);
      } else {
        socket.emit("join_dm", { myId: user.id, otherId: activeChat.id });
      }
    }
  }, [activeChat, user]);

  const handleJumpToMessage = (messageId: number, channelId?: number, userId?: number) => {
    // If message is in a different chat, switch to it first
    if (channelId && (!activeChat || activeChat.type !== "channel" || activeChat.id !== channelId)) {
      const channel = channels.find((c) => c.id === channelId);
      if (channel) {
        setActiveChat({
          type: "channel",
          id: channelId,
          name: channel.name,
          icon: channel.icon,
        });
        // Wait for chat to load, then scroll
        setTimeout(() => {
          const element = document.getElementById(`message-${messageId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("bg-yellow-500/20", "dark:bg-yellow-500/10");
            setTimeout(() => {
              element.classList.remove("bg-yellow-500/20", "dark:bg-yellow-500/10");
            }, 2000);
          }
        }, 500);
      }
      return;
    }

    if (userId && (!activeChat || activeChat.type !== "dm" || activeChat.id !== userId)) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setActiveChat({
          type: "dm",
          id: userId,
          name: user.username,
          icon: user.avatar,
          recipientId: userId,
        });
        // Wait for chat to load, then scroll
        setTimeout(() => {
          const element = document.getElementById(`message-${messageId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("bg-yellow-500/20", "dark:bg-yellow-500/10");
            setTimeout(() => {
              element.classList.remove("bg-yellow-500/20", "dark:bg-yellow-500/10");
            }, 2000);
          }
        }, 500);
      }
      return;
    }

    // Message is in current chat, scroll to it
    setTimeout(() => {
      const element = document.getElementById(`message-${messageId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("bg-yellow-500/20", "dark:bg-yellow-500/10");
        setTimeout(() => {
          element.classList.remove("bg-yellow-500/20", "dark:bg-yellow-500/10");
        }, 2000);
      }
    }, 100);
  };


  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        channels={channels} 
        users={users} 
        activeChat={activeChat} 
        onSelectChat={setActiveChat}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <main className="flex-1 flex overflow-hidden">
        {/* Persistent Voice Area - stays mounted to maintain connection */}
        {connectedVoiceChannelId && user && (
          <div className={activeChat?.type === "channel" && activeChat?.id === connectedVoiceChannelId ? "flex-1 flex flex-col min-w-0" : "hidden"}>
            <VoiceArea 
              channelId={connectedVoiceChannelId} 
              userId={user.id} 
              users={users}
              onLeave={() => {
                setConnectedVoiceChannelId(null);
                setShowVoiceChat(false);
              }}
              onToggleChat={() => setShowVoiceChat(!showVoiceChat)}
            />
          </div>
        )}
        
        {/* Show Chat Area if not viewing the connected voice channel */}
        {activeChat && (!connectedVoiceChannelId || activeChat.type !== "channel" || activeChat.id !== connectedVoiceChannelId) ? (
          <>
            <div className="flex-1 flex flex-col min-w-0">
               <ChatArea 
                 activeChat={activeChat} 
                 users={users} 
                 channels={channels}
                 connectedVoiceChannelId={connectedVoiceChannelId}
                 setConnectedVoiceChannelId={setConnectedVoiceChannelId}
                 showVoiceChat={showVoiceChat}
                 setShowVoiceChat={setShowVoiceChat}
                 onJumpToMessage={handleJumpToMessage}
               />
            </div>
            {activeChat.type === "channel" && <MembersSidebar users={users} />}
          </>
        ) : !activeChat ? (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Select a channel or user to start chatting
          </div>
        ) : null}
      </main>
      
      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        channels={channels}
        users={users}
        activeChat={activeChat}
        onSelectChat={setActiveChat}
        onJumpToMessage={handleJumpToMessage}
      />
      <ConnectionStatus />
    </div>
  );
}
