"use client";

import { ActiveChat } from "./chat-layout";
import { User, Channel } from "@/hooks/use-chat-data";
import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Phone, Paperclip, Smile, MoreVertical, Reply, Trash2, Edit2, Pin, X, CalendarDays, ArrowRight, FileIcon, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/utils";

interface Message {
  id: number;
  username: string;
  message: string;
  date: string;
  sender_id: number;
  channel_id?: number;
  recipient_id?: number;
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
}

interface ChatAreaProps {
  activeChat: ActiveChat;
  users: User[];
  channels?: Channel[];
  connectedVoiceChannelId: number | null;
  setConnectedVoiceChannelId: (id: number | null) => void;
  showVoiceChat: boolean;
  setShowVoiceChat: (show: boolean) => void;
}

export function ChatArea({ activeChat, users, channels, connectedVoiceChannelId, setConnectedVoiceChannelId, showVoiceChat, setShowVoiceChat }: ChatAreaProps) {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inVoice = connectedVoiceChannelId !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [channelMembers, setChannelMembers] = useState<any[]>([]);

  // File Upload Preview State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Image Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<Message[]>([]);

  // Typing Indicator State
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current channel is a voice channel
  const currentChannel = channels?.find(c => c.id === activeChat.id);
  const isVoiceChannel = currentChannel?.voice_channel === 1;

  // Fetch channel members for mentions
  useEffect(() => {
      if (activeChat.type === "channel" && token) {
          fetch(`http://localhost:3001/api/channels/${activeChat.id}/members`, {
              headers: { Authorization: `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(data => setChannelMembers(data))
          .catch(err => console.error("Failed to fetch members", err));
      } else {
          setChannelMembers([]); // Clear for DMs or handle DM users differently
      }
  }, [activeChat, token]);

  // Update images list whenever messages change
  useEffect(() => {
      const imgs = messages.filter(m => 
          m.file_path && (
              m.file_type?.startsWith("image/") || 
              /\.(jpg|jpeg|png|gif|webp)$/i.test(m.file_name || "")
          )
      );
      setImages(imgs);
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setCursorPosition(e.target.selectionStart || 0);

      // Check for mention trigger
      const lastAtPos = newValue.lastIndexOf("@", e.target.selectionStart || 0);
      if (lastAtPos !== -1) {
          const query = newValue.substring(lastAtPos + 1, e.target.selectionStart || 0);
          if (!query.includes(" ")) {
              setShowMentions(true);
              setMentionQuery(query);
              return;
          }
      }
      setShowMentions(false);

      // Typing Indicator Logic
      if (user) {
          socket.emit("typing", {
              username: user.username,
              user_id: user.id,
              channel_id: activeChat.type === "channel" ? activeChat.id : null,
              recipient_id: activeChat.type === "dm" ? activeChat.id : null,
          });

          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          
          typingTimeoutRef.current = setTimeout(() => {
              socket.emit("stop_typing", {
                  username: user.username,
                  user_id: user.id,
                  channel_id: activeChat.type === "channel" ? activeChat.id : null,
                  recipient_id: activeChat.type === "dm" ? activeChat.id : null,
              });
          }, 2000);
      }
  };

  const handleMentionSelect = (username: string) => {
      const lastAtPos = inputValue.lastIndexOf("@", cursorPosition);
      const newValue = inputValue.substring(0, lastAtPos) + `@${username} ` + inputValue.substring(cursorPosition);
      setInputValue(newValue);
      setShowMentions(false);
      inputRef.current?.focus();
  };

  // Load initial messages & Listen for events
  useEffect(() => {
    setMessages([]);
    setPinnedMessages([]);
    setTypingUsers(new Set()); // Reset typing users on chat change
    
    const onMessageHistory = (msgs: Message[]) => {
      setMessages(msgs);
      setPinnedMessages(msgs.filter(m => m.pinned));
    };

    const onReceiveMessage = (msg: Message) => {
      if (
        (activeChat.type === "channel" && msg.channel_id === activeChat.id) ||
        (activeChat.type === "dm" && (msg.sender_id === activeChat.id || msg.recipient_id === activeChat.id || (msg.sender_id === user?.id && msg.recipient_id === activeChat.id)))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      // Clear typing indicator for the sender if they send a message
      setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(msg.username);
          return newSet;
      });
    };
    
    const onUserUpdated = (updatedUser: any) => {
        setMessages((prevMessages) => 
            prevMessages.map((msg) => {
                if (msg.sender_id === updatedUser.id) {
                    return {
                        ...msg,
                        avatar: updatedUser.avatar,
                        avatar_color: updatedUser.avatar_color,
                        bio: updatedUser.bio
                    };
                }
                return msg;
            })
        );
    };

    const onMessageEdited = (msg: Message) => {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
        setPinnedMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
    };

    const onMessageDeleted = (msg: { id: number; deleted: boolean }) => {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, deleted: true, message: "[Message supprimé]" } : m)));
        setPinnedMessages((prev) => prev.filter((m) => m.id !== msg.id));
    };
    
    const onReactionUpdate = (data: { message_id: number; emoji: string; user_id: number; username: string; action: "add" | "remove" }) => {
        const updateReactions = (prev: Message[]) => prev.map((m) => {
            if (m.id !== data.message_id) return m;
            
            const currentReactions = m.reactions || [];
            let newReactions;
            
            if (data.action === "add") {
                newReactions = [...currentReactions, { emoji: data.emoji, user_id: data.user_id, username: data.username }];
            } else {
                newReactions = currentReactions.filter(r => !(r.user_id === data.user_id && r.emoji === data.emoji));
            }
            
            return { ...m, reactions: newReactions };
        });
        
        setMessages(updateReactions);
        setPinnedMessages(updateReactions);
    };
    
    const onMessagePinned = (data: { messageId: number; pinned: boolean }) => {
         setMessages((prev) => prev.map((m) => (m.id === data.messageId ? { ...m, pinned: data.pinned } : m)));
         
         if (data.pinned) {
             socket.emit("get_pinned_messages", { 
                 channelId: activeChat.type === "channel" ? activeChat.id : null,
                 recipientId: activeChat.type === "dm" ? activeChat.id : null,
                 myId: user?.id
             });
         } else {
             setPinnedMessages((prev) => prev.filter(m => m.id !== data.messageId));
         }
    };
    
    const onPinnedMessages = (msgs: Message[]) => {
        setPinnedMessages(msgs);
    };

    const onUserTyping = (data: { username: string, user_id: number, channel_id?: number, recipient_id?: number }) => {
        console.log("Typing Debug:", {
            activeChatType: activeChat.type,
            activeChatId: activeChat.id,
            dataChannelId: data.channel_id,
            dataUserId: data.user_id,
            currentUserId: user?.id,
            isChannel: activeChat.type === "channel",
            idsMatch: data.channel_id == activeChat.id,
            usersDiffer: data.user_id != user?.id
        });

        // Verify event belongs to current chat
        // Use loose equality for IDs to handle string/number mismatches
        const isChannelMatch = activeChat.type === "channel" && data.channel_id == activeChat.id && data.user_id != user?.id;
        const isDMMatch = activeChat.type === "dm" && data.recipient_id == user?.id && data.user_id == activeChat.id;

        if (isChannelMatch || isDMMatch) {
             console.log("Typing match! Adding user:", data.username);
             setTypingUsers(prev => {
                 const newSet = new Set(prev);
                 newSet.add(data.username);
                 return newSet;
             });
        } else {
             console.log("Typing event ignored. Match failed:", { isChannelMatch, isDMMatch });
        }
    };

    const onUserStoppedTyping = (data: { username: string, user_id: number, channel_id?: number, recipient_id?: number }) => {
        setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.username);
            return newSet;
        });
    };

    socket.on("message_history", onMessageHistory);
    socket.on("receive_message", onReceiveMessage);
    socket.on("message_edited", onMessageEdited);
    socket.on("message_deleted", onMessageDeleted);
    socket.on("reaction_update", onReactionUpdate);
    socket.on("message_pinned", onMessagePinned);
    socket.on("pinned_messages", onPinnedMessages);
    socket.on("user_updated", onUserUpdated);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stopped_typing", onUserStoppedTyping);
    
    // Initial fetch of pinned messages
    socket.emit("get_pinned_messages", { 
         channelId: activeChat.type === "channel" ? activeChat.id : null,
         recipientId: activeChat.type === "dm" ? activeChat.id : null,
         myId: user?.id
    });

    return () => {
      socket.off("message_history", onMessageHistory);
      socket.off("receive_message", onReceiveMessage);
      socket.off("message_edited", onMessageEdited);
      socket.off("message_deleted", onMessageDeleted);
      socket.off("reaction_update", onReactionUpdate);
      socket.off("message_pinned", onMessagePinned);
      socket.off("pinned_messages", onPinnedMessages);
      socket.off("user_updated", onUserUpdated);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stopped_typing", onUserStoppedTyping);
    };
  }, [activeChat, user?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Play notification sound on new message
  useEffect(() => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender_id !== user?.id) {
          // Request permission if needed
          if (Notification.permission === "default") {
              Notification.requestPermission();
          }
          
          if (!document.hasFocus()) {
              // Browser Notification
              if (Notification.permission === "granted") {
                  new Notification(`New message from ${lastMessage.username}`, {
                      body: lastMessage.message,
                      icon: "/icon.png" // Assuming there is an icon, or default
                  });
              }
              // Toast Notification
              toast.info(`New message from ${lastMessage.username}`);
          }
      }
  }, [messages, user?.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedFile(file);
          
          // Create preview for images
          if (file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onloadend = () => {
                  setFilePreview(reader.result as string);
              };
              reader.readAsDataURL(file);
          } else {
              setFilePreview(null);
          }
      }
  };

  const clearFileSelection = () => {
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || !user) return;

    if (editingMessage) {
        socket.emit("edit_message", {
            message_id: editingMessage.id,
            new_message: inputValue,
            user_id: user.id,
            channel_id: activeChat.type === "channel" ? activeChat.id : null,
            recipient_id: activeChat.type === "dm" ? activeChat.id : null,
        });
        setEditingMessage(null);
        setInputValue("");
        return;
    }

    let filePath = null;
    let fileName = null;
    let fileType = null;
    let fileSize = null;

    // Handle file upload
    if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await fetch("http://localhost:3001/api/upload", {
                method: "POST",
                body: formData, 
            });
            
            if (!res.ok) throw new Error("Upload failed");
            
            const data = await res.json();
            filePath = data.path;
            fileName = data.originalName;
            fileType = data.mimetype;
            fileSize = data.size;
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload file");
            return;
        }
    }

    const messageData = {
      username: user.username,
      message: inputValue,
      sender_id: user.id,
      channel_id: activeChat.type === "channel" ? activeChat.id : null,
      recipient_id: activeChat.type === "dm" ? activeChat.id : null,
      reply_to_id: replyTo?.id,
      file_path: filePath,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    };

    socket.emit("send_message", messageData);
    setInputValue("");
    setReplyTo(null);
    clearFileSelection();
  };

  const handleEmojiClick = (emojiData: any) => {
      setInputValue((prev) => prev + emojiData.emoji);
  };

  const handleReaction = (messageId: number, emoji: string) => {
      if (!user) return;
      socket.emit("add_reaction", {
          message_id: messageId,
          emoji,
          user_id: user.id,
          channel_id: activeChat.type === "channel" ? activeChat.id : null,
          recipient_id: activeChat.type === "dm" ? activeChat.id : null,
      });
  };

  const handleDeleteMessage = (messageId: number) => {
      if (!user) return;
      socket.emit("delete_message", {
          message_id: messageId,
          user_id: user.id,
          channel_id: activeChat.type === "channel" ? activeChat.id : null,
          recipient_id: activeChat.type === "dm" ? activeChat.id : null,
      });
  };
  
  const handlePinMessage = (messageId: number, isPinned: boolean) => {
      if (!token) {
          console.error("No token available for pinning");
          return;
      }
      
      const endpoint = isPinned ? "/api/messages/unpin" : "/api/messages/pin";
      fetch(`http://localhost:3001${endpoint}`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ messageId })
      }).catch(err => console.error("Pin error", err));
  };
  
  const handleJumpToMessage = (messageId: number) => {
      setIsPinnedOpen(false);
      
      // Allow time for sheet to close
      setTimeout(() => {
          const element = document.getElementById(`message-${messageId}`);
          if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              
              // Add highlight effect
              element.classList.add("bg-yellow-500/20");
              setTimeout(() => {
                  element.classList.remove("bg-yellow-500/20");
              }, 2000);
          } else {
              toast.info("Message is too old and not currently loaded.");
          }
      }, 150);
  };

  const openLightbox = (msgId: number) => {
      const index = images.findIndex(img => img.id === msgId);
      if (index !== -1) {
          setCurrentImageIndex(index);
          setLightboxOpen(true);
      }
  };

  const navigateLightbox = (direction: 'next' | 'prev') => {
      if (direction === 'next') {
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else {
          setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
  };

  return (
    <div className="flex h-full flex-col relative">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{activeChat.name}</span>
          {activeChat.type === "channel" && (
             <span className="text-xs text-muted-foreground ml-2">
               {isVoiceChannel ? "Voice Channel" : "Text Channel"}
             </span>
          )}
        </div>
        <div className="flex items-center gap-2">
            {/* Pinned Messages */}
            <Sheet open={isPinnedOpen} onOpenChange={setIsPinnedOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Pin className="h-5 w-5" />
                  {pinnedMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                      {pinnedMessages.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                {/* ... Content ... */}
                <SheetHeader>
                  <SheetTitle>Pinned Messages</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
                   <div className="space-y-4">
                      {pinnedMessages.length === 0 ? (
                          <p className="text-center text-muted-foreground text-sm">No pinned messages</p>
                      ) : (
                          pinnedMessages.map((msg) => (
                              <div key={msg.id} className="group border rounded-lg p-4 text-sm bg-muted/30 hover:bg-muted/50 transition-colors relative">
                                   <div className="flex items-start gap-3">
                                       <Avatar className="h-8 w-8 mt-1">
                                            <AvatarImage src={msg.avatar} />
                                            <AvatarFallback style={{ backgroundColor: msg.avatar_color }}>{msg.username[0].toUpperCase()}</AvatarFallback>
                                       </Avatar>
                                       <div className="flex-1 min-w-0">
                                           <div className="flex items-center gap-2 mb-1">
                                               <span className="font-semibold text-sm">{msg.username}</span>
                                               <span className="text-xs text-muted-foreground">
                                                   {format(new Date(msg.date), "MMM d, yyyy")}
                                               </span>
                                           </div>
                                           <p className="text-sm text-foreground/90">{msg.message}</p>
                                           
                                           {msg.file_path && (
                                               <div className="mt-2 text-xs flex items-center gap-1 text-blue-500">
                                                   <Paperclip className="h-3 w-3" /> Attachment
                                               </div>
                                           )}
                                       </div>
                                   </div>
                                   
                                   <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                                       <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 text-xs text-muted-foreground hover:text-foreground"
                                          onClick={() => handleJumpToMessage(msg.id)}
                                       >
                                          Jump to message
                                       </Button>
                                       <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 text-xs text-destructive hover:bg-destructive/10"
                                          onClick={() => handlePinMessage(msg.id, true)}
                                       >
                                           <X className="h-3 w-3 mr-1" /> Unpin
                                       </Button>
                                   </div>
                              </div>
                          ))
                      )}
                   </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {isVoiceChannel && (
               <Button 
                 variant={inVoice && connectedVoiceChannelId === activeChat.id ? "destructive" : "default"} 
                 size="sm"
                 onClick={() => {
                   if (inVoice && connectedVoiceChannelId === activeChat.id) {
                     // Leave voice
                     setConnectedVoiceChannelId(null);
                     setShowVoiceChat(false);
                   } else if (!inVoice) {
                     // Join voice
                     setConnectedVoiceChannelId(activeChat.id);
                     setShowVoiceChat(false);
                   }
                 }}
               >
                 {inVoice && connectedVoiceChannelId === activeChat.id ? "Leave Voice" : "Join Voice"}
               </Button>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      {/* Standard Chat View */}
      <>
          <ScrollArea className="flex-1 p-4 min-h-0">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  id={`message-${msg.id}`}
                  className="group flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-zinc-900/50 p-2 -mx-2 rounded-lg transition-colors relative"
                >
                  <HoverCard>
                      <HoverCardTrigger asChild>
                          <Avatar className="h-10 w-10 mt-0.5 cursor-pointer hover:opacity-80 transition-opacity">
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
                                      <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                                      <span className="text-xs text-muted-foreground">
                                          Member since {msg.created_at ? format(new Date(msg.created_at), "MMMM yyyy") : "Unknown"}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </HoverCardContent>
                  </HoverCard>
                  
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm hover:underline cursor-pointer">{msg.username}</span>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.date), "MMM d, yyyy h:mm a")}
                        </span>
                        {msg.edited && <span className="text-[10px] text-muted-foreground">(edited)</span>}
                     </div>

                     {/* Reply Context */}
                     {msg.reply_to_id && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 opacity-70 border-l-2 pl-2 border-muted">
                            <Reply className="h-3 w-3" />
                            <span className="truncate">Replying to {msg.reply_username}</span>
                        </div>
                     )}
                     
                    <div className={`text-sm leading-relaxed text-foreground ${msg.deleted ? "italic text-muted-foreground" : ""}`}>
                      {!!msg.pinned && <Pin className="h-3 w-3 inline mr-1 text-yellow-500 fill-yellow-500" />}
                      
                      {/* File Attachment */}
                      {msg.file_path && (
                          <div className="my-2">
                              {(msg.file_type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.file_name || "")) ? (
                                  <div className="relative max-w-sm group/image overflow-hidden rounded-md border bg-muted">
                                    <img 
                                      src={`http://localhost:3001${msg.file_path}`} 
                                      alt={msg.file_name} 
                                      className="max-h-80 w-full object-cover cursor-zoom-in transition-transform hover:scale-[1.02]"
                                      onClick={() => openLightbox(msg.id)}
                                    />
                                  </div>
                              ) : msg.file_type?.startsWith("video/") ? (
                                  <video 
                                    controls 
                                    className="max-w-sm rounded-md max-h-80 bg-black"
                                    src={`http://localhost:3001${msg.file_path}`}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                              ) : (
                                  <div className="flex items-center gap-3 p-3 bg-secondary/50 border border-border/50 rounded-md max-w-sm group/file hover:bg-secondary/70 transition-colors">
                                      <div className="bg-primary/10 p-2.5 rounded-full">
                                        <FileIcon className="h-6 w-6 text-primary" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate text-sm text-foreground">
                                          {msg.file_name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {formatFileSize(msg.file_size || 0)}
                                        </div>
                                      </div>
                                      <a 
                                        href={`http://localhost:3001${msg.file_path}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                        title="Download"
                                      >
                                          <Download className="h-5 w-5" />
                                      </a>
                                  </div>
                              )}
                          </div>
                      )}

                      <p className="whitespace-pre-wrap break-words">
                          {msg.message.split(/(@\w+)/g).map((part, i) => {
                              if (part.startsWith("@")) {
                                  return <span key={i} className="bg-primary/10 text-primary rounded px-1 font-medium cursor-pointer hover:bg-primary/20 transition-colors">{part}</span>;
                              }
                              return part;
                          })}
                      </p>
                      
                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                              {Object.values(msg.reactions.reduce((acc: any, r) => {
                                  if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
                                  acc[r.emoji].count++;
                                  acc[r.emoji].users.push(r.username);
                                  return acc;
                              }, {})).map((r: any) => (
                                  <div 
                                    key={r.emoji} 
                                    className="bg-muted/50 border border-transparent hover:border-muted-foreground/20 rounded-[4px] px-1.5 py-0.5 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                    title={r.users.join(", ")}
                                    onClick={() => handleReaction(msg.id, r.emoji)}
                                  >
                                      <span>{r.emoji}</span>
                                      <span className="font-semibold ml-1">{r.count}</span>
                                  </div>
                              ))}
                          </div>
                      )}
                    </div>
                  </div>

                  {/* Message Actions - Floating top right */}
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
                                    onEmojiClick={(emoji) => handleReaction(msg.id, emoji.emoji)} 
                                  />
                              </PopoverContent>
                          </Popover>

                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-sm" onClick={() => setReplyTo(msg)}>
                              <Reply className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>

                          {msg.sender_id === user?.id && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-sm" onClick={() => {
                                  setEditingMessage(msg);
                                  setInputValue(msg.message);
                              }}>
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
                                  <DropdownMenuItem onClick={() => handlePinMessage(msg.id, !!msg.pinned)}>
                                      <Pin className="mr-2 h-4 w-4" /> {msg.pinned ? "Unpin Message" : "Pin Message"}
                                  </DropdownMenuItem>
                                  {msg.sender_id === user?.id && (
                                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteMessage(msg.id)}>
                                          <Trash2 className="mr-2 h-4 w-4" /> Delete Message
                                      </DropdownMenuItem>
                                  )}
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                  )}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Image Lightbox/Carousel */}
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="max-w-4xl w-full h-[85vh] p-0 bg-transparent border-none shadow-none flex flex-col items-center justify-center outline-none">
                 <DialogTitle className="sr-only">Image Preview</DialogTitle>
                 <DialogDescription className="sr-only">
                    Full screen preview of the selected image
                 </DialogDescription>
                 
                 <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                     {images.length > 1 && (
                         <>
                            <Button 
                                variant="secondary" 
                                size="icon" 
                                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-70 hover:opacity-100 z-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateLightbox('prev');
                                }}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="icon" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-70 hover:opacity-100 z-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateLightbox('next');
                                }}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                         </>
                     )}
                 
                     {images[currentImageIndex] ? (
                         <>
                             <img 
                                src={`http://localhost:3001${images[currentImageIndex].file_path}`}
                                alt={images[currentImageIndex].file_name || "Image"}
                                className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                             />
                             <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/60 py-2 px-4 rounded-full mx-auto w-fit pointer-events-none">
                                 <span className="font-medium">{images[currentImageIndex].file_name}</span>
                                 <span className="mx-2">•</span>
                                 <span className="text-gray-300">{formatFileSize(images[currentImageIndex].file_size || 0)}</span>
                             </div>
                         </>
                     ) : (
                         <div className="text-white">Image not found</div>
                     )}
                 </div>
            </DialogContent>
          </Dialog>

          {/* Input Area */}
          <div className="p-4 border-t bg-white dark:bg-zinc-950 relative z-20">
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
                <div className="absolute bottom-[100%] left-4 mb-2 text-xs font-bold animate-pulse text-primary bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none z-[60] border shadow-md flex items-center gap-2">
                    <div className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                    </div>
                    <span>
                        {Array.from(typingUsers).join(", ")} {typingUsers.size > 1 ? "are" : "is"} typing...
                    </span>
                </div>
            )}

            {/* Preview Area - Floating Above */}
            {selectedFile && (
                 <div className="absolute bottom-full left-4 mb-2 bg-muted/90 backdrop-blur-sm rounded-lg border border-border/50 w-full max-w-md shadow-lg animate-in fade-in slide-in-from-bottom-2 z-10">
                     <div className="flex items-start gap-3 p-3">
                         <div className="relative group shrink-0">
                             {filePreview ? (
                                 <img src={filePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md border" />
                             ) : (
                                 <div className="h-20 w-20 bg-secondary flex items-center justify-center rounded-md border">
                                     <FileIcon className="h-8 w-8 text-muted-foreground" />
                                 </div>
                             )}
                             <button 
                                onClick={clearFileSelection}
                                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 shadow-sm hover:bg-destructive/90 transition-colors"
                             >
                                 <X className="h-3 w-3" />
                             </button>
                         </div>
                         <div className="flex-1 min-w-0 pt-1">
                             <div className="font-medium text-sm truncate">{selectedFile.name}</div>
                             <div className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</div>
                         </div>
                     </div>
                 </div>
            )}

            {replyTo && (
                <div className="flex items-center justify-between bg-muted p-2 rounded-t-md text-xs border-b">
                    <div className="flex items-center gap-2">
                        <Reply className="h-3 w-3" />
                        <span>Replying to <b>{replyTo.username}</b></span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setReplyTo(null)}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}
            {editingMessage && (
                <div className="flex items-center justify-between bg-yellow-500/10 p-2 rounded-t-md text-xs border-b text-yellow-600 dark:text-yellow-400">
                    <div className="flex items-center gap-2">
                        <Edit2 className="h-3 w-3" />
                        <span>Editing message</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => {
                        setEditingMessage(null);
                        setInputValue("");
                    }}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={handleFileSelect}
               />
               <Button 
                 type="button" 
                 variant="outline" 
                 size="icon" 
                 onClick={() => fileInputRef.current?.click()}
               >
                   <Paperclip className="h-4 w-4" />
               </Button>

               <Popover>
                  <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                          <Smile className="h-4 w-4" />
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 border-none" side="top">
                      <EmojiPicker 
                        theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                        onEmojiClick={handleEmojiClick} 
                      />
                  </PopoverContent>
               </Popover>

              <Input
                ref={inputRef}
                placeholder={`Message ${activeChat.name}...`}
                value={inputValue}
                onChange={handleInputChange}
                className="flex-1"
              />
              
              {showMentions && (
                  <div className="absolute bottom-16 left-4 bg-popover border rounded-md shadow-md w-64 z-50 max-h-40 overflow-y-auto p-1">
                      {channelMembers
                          .filter(m => m.username.toLowerCase().includes(mentionQuery.toLowerCase()))
                          .map(member => (
                              <div 
                                  key={member.id} 
                                  className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer text-sm"
                                  onClick={() => handleMentionSelect(member.username)}
                              >
                                  <Avatar className="h-6 w-6">
                                      <AvatarImage src={member.avatar} />
                                      <AvatarFallback style={{ backgroundColor: member.avatar_color }}>{member.username[0].toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span>{member.username}</span>
                              </div>
                          ))
                      }
                  </div>
              )}

              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
    </div>
  );
}
