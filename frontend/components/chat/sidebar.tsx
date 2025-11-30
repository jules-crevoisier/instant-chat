"use client";

import { Channel, User } from "@/hooks/use-chat-data";
import { ActiveChat } from "./chat-layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hash, Volume2, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  channels: Channel[];
  users: User[];
  activeChat: ActiveChat | null;
  onSelectChat: (chat: ActiveChat) => void;
}

import { ProfileSettings } from "../profile-settings";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export function Sidebar({ channels, users, activeChat, onSelectChat }: SidebarProps) {
  const { user: currentUser, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter out current user from DM list and apply search
  const dmUsers = users
    .filter((u) => u.id !== currentUser?.id)
    .filter((u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredChannels = channels.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-64 flex-col border-r bg-gray-50/50 dark:bg-zinc-900/50">
      <div className="p-4 font-bold text-xl flex items-center gap-2 text-primary">
        <span>Instant Chat</span>
      </div>
      
      <div className="px-4 pb-2">
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-2 h-[calc(100vh-8.5rem)]">
        <div className="space-y-4 py-4">
          <div>
            <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Channels
            </h2>
            <div className="space-y-1">
              {filteredChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={activeChat?.type === "channel" && activeChat.id === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onSelectChat({ 
                    type: "channel", 
                    id: channel.id, 
                    name: channel.name,
                    icon: channel.icon 
                  })}
                >
                  {channel.voice_channel === 1 ? (
                    <Volume2 className="mr-2 h-4 w-4" />
                  ) : (
                    <Hash className="mr-2 h-4 w-4" />
                  )}
                  {channel.name}
                </Button>
              ))}
            </div>
          </div>
          
          <Separator />

          <div>
            <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Direct Messages
            </h2>
            <div className="space-y-1">
              {dmUsers.map((u) => (
                <Button
                  key={u.id}
                  variant={activeChat?.type === "dm" && activeChat.id === u.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onSelectChat({ 
                    type: "dm", 
                    id: u.id, 
                    name: u.username,
                    icon: u.avatar,
                    recipientId: u.id
                  })}
                >
                  <div className="relative mr-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-background ${
                      u.status === 'online' ? 'bg-green-500' : 
                      u.status === 'idle' ? 'bg-yellow-500' : 
                      u.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  {u.username}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback style={{ backgroundColor: currentUser?.avatar_color }}>
                  {currentUser?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium">
              <p>{currentUser?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser?.status}</p>
            </div>
          </div>
          <div className="flex items-center">
            <ProfileSettings />
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

