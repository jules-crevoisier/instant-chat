"use client";

import { memo, useMemo } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { 
  Reply, Trash2, Edit2, Pin, FileIcon, Download, CalendarDays 
} from "lucide-react";
import { MessageContent } from "./message-content";
import { getFileUrl } from "@/lib/config";
import { formatFileSize } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";

interface MessageItemProps {
  msg: {
    id: number;
    username: string;
    message: string;
    date: string;
    sender_id: number;
    reply_to_id?: number;
    reply_username?: string;
    reply_message?: string;
    file_path?: string;
    file_name?: string;
    file_type?: string;
    file_size?: number;
    reactions?: { emoji: string; user_id: number; username: string }[];
    pinned?: boolean;
    edited?: boolean;
    deleted?: boolean;
    avatar?: string;
    avatar_color?: string;
    bio?: string;
    created_at?: string;
  };
  currentUserId?: number;
  onEdit?: (messageId: number) => void;
  onDelete?: (messageId: number) => void;
  onReply?: (message: any) => void;
  onPin?: (messageId: number, isPinned: boolean) => void;
  onOpenLightbox?: (messageId: number) => void;
  onReaction?: (messageId: number, emoji: string) => void;
}

export const MessageItem = memo(function MessageItem({
  msg,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  onPin,
  onOpenLightbox,
  onReaction,
}: MessageItemProps) {
  const { theme } = useTheme();
  
  // Memoize reactions aggregation
  const aggregatedReactions = useMemo(() => {
    if (!msg.reactions || msg.reactions.length === 0) return [];
    return Object.values(
      msg.reactions.reduce((acc: any, r) => {
        if (!acc[r.emoji]) {
          acc[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
        }
        acc[r.emoji].count++;
        acc[r.emoji].users.push(r.username);
        return acc;
      }, {})
    );
  }, [msg.reactions]);
  // Memoize formatted date
  const formattedDate = useMemo(() => {
    try {
      return format(new Date(msg.date), "MMM d, yyyy h:mm a");
    } catch {
      return msg.date;
    }
  }, [msg.date]);

  const formattedMemberSince = useMemo(() => {
    if (!msg.created_at) return "Unknown";
    try {
      return format(new Date(msg.created_at), "MMMM yyyy");
    } catch {
      return "Unknown";
    }
  }, [msg.created_at]);

  const isOwner = currentUserId === msg.sender_id;

  return (
    <div
      id={`message-${msg.id}`}
      className="group flex items-start gap-2 sm:gap-3 hover:bg-gray-50 dark:hover:bg-zinc-900/50 p-2 sm:p-2 -mx-2 rounded-lg transition-colors relative"
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mt-0.5 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
            <AvatarImage src={msg.avatar} />
            <AvatarFallback style={{ backgroundColor: msg.avatar_color }}>
              {msg.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={msg.avatar} />
              <AvatarFallback style={{ backgroundColor: msg.avatar_color }}>
                {msg.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@{msg.username}</h4>
              <p className="text-xs text-muted-foreground">
                {msg.bio || "No bio available"}
              </p>
              <div className="flex items-center pt-2">
                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">
                  Member since {formattedMemberSince}
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm hover:underline cursor-pointer">
            {msg.username}
          </span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
          {msg.edited && (
            <span className="text-[10px] text-muted-foreground">(edited)</span>
          )}
        </div>

        {msg.reply_to_id && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 opacity-70 border-l-2 pl-2 border-muted">
            <Reply className="h-3 w-3" />
            <span className="truncate">Replying to {msg.reply_username}</span>
          </div>
        )}

        <div
          className={`text-sm leading-relaxed text-foreground ${
            msg.deleted ? "italic text-muted-foreground" : ""
          }`}
        >
          {!!msg.pinned && (
            <Pin className="h-3 w-3 inline mr-1 text-yellow-500 fill-yellow-500" />
          )}

          {msg.file_path && (
            <div className="my-2">
              {(msg.file_type?.startsWith("image/") ||
                /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.file_name || "")) ? (
                <div className="relative max-w-sm group/image overflow-hidden rounded-md border bg-muted">
                  <img
                    src={getFileUrl(msg.file_path)}
                    alt={msg.file_name}
                    className="max-h-80 w-full object-cover cursor-zoom-in transition-transform hover:scale-[1.02]"
                    onClick={() => onOpenLightbox?.(msg.id)}
                    loading="lazy"
                  />
                </div>
              ) : msg.file_type?.startsWith("video/") ? (
                <video
                  controls
                  className="max-w-sm rounded-md max-h-80 bg-black"
                  src={getFileUrl(msg.file_path)}
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-secondary/50 border border-border/50 rounded-md max-w-sm group/file hover:bg-secondary/70 transition-colors">
                  <div className="bg-primary/10 p-2.5 rounded-full">
                    <FileIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {msg.file_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {msg.file_size ? formatFileSize(msg.file_size) : "Unknown size"}
                    </div>
                  </div>
                  <a
                    href={getFileUrl(msg.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          )}

          {!msg.deleted && <MessageContent content={msg.message} className="text-sm text-foreground/90" />}
          {msg.deleted && (
            <span className="italic text-muted-foreground">[Message supprimé]</span>
          )}

          {aggregatedReactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {aggregatedReactions.map((reaction: any) => (
                <div
                  key={reaction.emoji}
                  className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-xs hover:bg-muted/80 transition-colors cursor-pointer"
                  title={reaction.users.join(", ")}
                  onClick={() => onReaction?.(msg.id, reaction.emoji)}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-muted-foreground">{reaction.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!msg.deleted && (
        <div className="absolute right-4 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border shadow-sm rounded-md flex items-center p-0.5 z-10">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-sm">
                <Smile className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-none">
              <EmojiPicker
                theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                onEmojiClick={(emoji) => onReaction?.(msg.id, emoji.emoji)}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted rounded-sm"
            onClick={() => onReply?.(msg)}
          >
            <Reply className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>

          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted rounded-sm"
              onClick={() => onEdit?.(msg.id)}
            >
              <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-sm">
                <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPin?.(msg.id, !msg.pinned)}>
                <Pin className="mr-2 h-4 w-4" /> {msg.pinned ? "Unpin Message" : "Pin Message"}
              </DropdownMenuItem>
              {isOwner && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete?.(msg.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Message
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.msg.id === nextProps.msg.id &&
    prevProps.msg.message === nextProps.msg.message &&
    prevProps.msg.edited === nextProps.msg.edited &&
    prevProps.msg.deleted === nextProps.msg.deleted &&
    prevProps.msg.pinned === nextProps.msg.pinned &&
    prevProps.msg.reactions?.length === nextProps.msg.reactions?.length &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});

