"use client";

import { useState, useEffect } from "react";
import { useChatData, Channel, User } from "@/hooks/use-chat-data";
import { Sidebar } from "./sidebar";
import { ChatArea } from "./chat-area";
import { MembersSidebar } from "./members-sidebar";
import { VoiceArea } from "./voice-area";
import { socket } from "@/lib/socket";
import { useAuth } from "@/context/auth-context";

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
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [connectedVoiceChannelId, setConnectedVoiceChannelId] = useState<number | null>(null);
  const [showVoiceChat, setShowVoiceChat] = useState(false);

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


  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        channels={channels} 
        users={users} 
        activeChat={activeChat} 
        onSelectChat={setActiveChat} 
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
    </div>
  );
}
