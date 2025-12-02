"use client";

import { Channel, User } from "@/hooks/use-chat-data";
import { ActiveChat } from "./chat-layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hash, Volume2, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notification-context";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "@/components/notifications/notification-center";

interface SidebarProps {
  channels: Channel[];
  users: User[];
  activeChat: ActiveChat | null;
  onSelectChat: (chat: ActiveChat) => void;
  onOpenSearch?: () => void;
}

import { ProfileSettings } from "../profile-settings";
import { ChannelManager, useChannelDelete, useChannelEdit } from "../channels/channel-manager";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function Sidebar({ channels, users, activeChat, onSelectChat, onOpenSearch }: SidebarProps) {
  const { user: currentUser, logout } = useAuth();
  const { unreadByChannel, unreadByUser, markChannelAsRead, markUserAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
  const { deleteChannel, isDeleting } = useChannelDelete();
  const { editChannel, isEditing } = useChannelEdit();

  // Filter out current user from DM list and apply search
  const dmUsers = users
    .filter((u) => u.id !== currentUser?.id)
    .filter((u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredChannels = channels.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-full md:w-64 flex-col border-r bg-gray-50/50 dark:bg-zinc-900/50 h-full">
      <div className="p-4 font-bold text-xl flex items-center gap-2 text-primary">
        <span>Instant Chat</span>
      </div>
      
      <div className="px-4 pb-2">
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher (Ctrl+K)..." 
              className="pl-8 cursor-pointer" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => onOpenSearch?.()}
              readOnly
            />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-2 h-[calc(100vh-8.5rem)]">
        <div className="space-y-4 py-4">
          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Channels
              </h2>
            </div>
            <div className="space-y-1">
              {filteredChannels.map((channel) => {
                const unreadCount = unreadByChannel.get(channel.id) || 0;
                return (
                  <div key={channel.id} className="group relative flex items-center">
                    <Button
                      variant={activeChat?.type === "channel" && activeChat.id === channel.id ? "secondary" : "ghost"}
                      className="w-full justify-start relative flex-1"
                      onClick={() => {
                        onSelectChat({ 
                          type: "channel", 
                          id: channel.id, 
                          name: channel.name,
                          icon: channel.icon 
                        });
                        if (unreadCount > 0) {
                          markChannelAsRead(channel.id);
                        }
                      }}
                    >
                      {channel.voice_channel === 1 ? (
                        <Volume2 className="mr-2 h-4 w-4" />
                      ) : (
                        <Hash className="mr-2 h-4 w-4" />
                      )}
                      <span className="flex-1 text-left truncate">{channel.name}</span>
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-5 min-w-5 flex items-center justify-center px-1.5 text-xs"
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </Button>
                    {channel.id !== 1 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open edit dialog via ChannelManager
                              const event = new CustomEvent("editChannel", { detail: channel });
                              window.dispatchEvent(event);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setChannelToDelete(channel);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
              <ChannelManager channels={channels} />
            </div>
          </div>
          
          <Separator />

          <div>
            <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Direct Messages
            </h2>
            <div className="space-y-1">
              {dmUsers.map((u) => {
                const unreadCount = unreadByUser.get(u.id) || 0;
                return (
                  <Button
                    key={u.id}
                    variant={activeChat?.type === "dm" && activeChat.id === u.id ? "secondary" : "ghost"}
                    className="w-full justify-start relative"
                    onClick={() => {
                      onSelectChat({ 
                        type: "dm", 
                        id: u.id, 
                        name: u.username,
                        icon: u.avatar,
                        recipientId: u.id
                      });
                      if (unreadCount > 0) {
                        markUserAsRead(u.id);
                      }
                    }}
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
                    <span className="flex-1 text-left truncate">{u.username}</span>
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-auto h-5 min-w-5 flex items-center justify-center px-1.5 text-xs"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                );
              })}
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
          <div className="flex items-center gap-1">
            <NotificationCenter />
            <ProfileSettings />
            <Button variant="ghost" size="icon" className="touch-manipulation" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Channel Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le canal</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le canal{" "}
              <strong>"{channelToDelete?.name}"</strong> ? Cette action est irréversible et
              supprimera tous les messages associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (channelToDelete) {
                  const success = await deleteChannel(channelToDelete.id);
                  if (success) {
                    setDeleteDialogOpen(false);
                    setChannelToDelete(null);
                  }
                }
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

