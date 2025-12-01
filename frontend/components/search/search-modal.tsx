"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Channel, User } from "@/hooks/use-chat-data";
import { ActiveChat } from "@/components/chat/chat-layout";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  X,
  Hash,
  User as UserIcon,
  Calendar,
  FileText,
  Link as LinkIcon,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/config";

interface SearchResult {
  id: number;
  username: string;
  message: string;
  date: string;
  sender_id: number;
  channel_id?: number;
  recipient_id?: number;
  channel_name?: string;
  avatar?: string;
  avatar_color?: string;
  file_path?: string;
  file_name?: string;
  file_type?: string;
  edited?: boolean;
  pinned?: boolean;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: Channel[];
  users: User[];
  activeChat: ActiveChat | null;
  onSelectChat: (chat: ActiveChat) => void;
  onJumpToMessage: (messageId: number, channelId?: number, userId?: number) => void;
}

export function SearchModal({
  open,
  onOpenChange,
  channels,
  users,
  activeChat,
  onSelectChat,
  onJumpToMessage,
}: SearchModalProps) {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Filters
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [hasFiles, setHasFiles] = useState(false);
  const [hasLinks, setHasLinks] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("all");

  const performSearch = useCallback(
    async (resetOffset = true) => {
      if (!searchQuery.trim() || !token) return;

      setIsLoading(true);
      const currentOffset = resetOffset ? 0 : offset;

      try {
        const params = new URLSearchParams({
          query: searchQuery,
          limit: "50",
          offset: currentOffset.toString(),
        });

        if (selectedChannel && selectedChannel !== "all") params.append("channelId", selectedChannel);
        if (selectedUser && selectedUser !== "all") params.append("userId", selectedUser);
        if (hasFiles) params.append("hasFiles", "true");
        if (hasLinks) params.append("hasLinks", "true");
        if (dateFilter && dateFilter !== "all") {
          const date = new Date();
          if (dateFilter === "today") {
            date.setHours(0, 0, 0, 0);
            params.append("afterDate", date.toISOString());
          } else if (dateFilter === "week") {
            date.setDate(date.getDate() - 7);
            params.append("afterDate", date.toISOString());
          } else if (dateFilter === "month") {
            date.setMonth(date.getMonth() - 1);
            params.append("afterDate", date.toISOString());
          }
        }

        const response = await fetch(`${API_ENDPOINTS.SEARCH}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        
        if (resetOffset) {
          setResults(data.messages);
        } else {
          setResults((prev) => [...prev, ...data.messages]);
        }
        
        setTotal(data.total);
        setHasMore(data.hasMore);
        setOffset(currentOffset + data.messages.length);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, selectedChannel, selectedUser, hasFiles, hasLinks, dateFilter, token, offset]
  );

  useEffect(() => {
    if (open && searchQuery.trim()) {
      performSearch(true);
    } else if (!open) {
      setResults([]);
      setSearchQuery("");
      setOffset(0);
    }
  }, [open]);

  const handleSearch = () => {
    setOffset(0);
    performSearch(true);
  };

  const handleLoadMore = () => {
    performSearch(false);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.channel_id) {
      const channel = channels.find((c) => c.id === result.channel_id);
      if (channel) {
        onSelectChat({
          type: "channel",
          id: result.channel_id,
          name: result.channel_name || channel.name,
          icon: channel.icon,
        });
        setTimeout(() => {
          onJumpToMessage(result.id, result.channel_id);
        }, 100);
      }
    } else if (result.recipient_id || result.sender_id) {
      const userId = result.recipient_id || result.sender_id;
      const user = users.find((u) => u.id === userId);
      if (user) {
        onSelectChat({
          type: "dm",
          id: userId,
          name: user.username,
          icon: user.avatar,
          recipientId: userId,
        });
        setTimeout(() => {
          onJumpToMessage(result.id, undefined, userId);
        }, 100);
      }
    }
    onOpenChange(false);
  };

  const clearFilters = () => {
    setSelectedChannel("all");
    setSelectedUser("all");
    setHasFiles(false);
    setHasLinks(false);
    setDateFilter("all");
  };

  const hasActiveFilters =
    (selectedChannel && selectedChannel !== "all") || 
    (selectedUser && selectedUser !== "all") || 
    hasFiles || 
    hasLinks || 
    (dateFilter && dateFilter !== "all");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[600px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-xl">Rechercher dans les messages</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Search Input */}
          <div className="p-4 border-b space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9 pr-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Canal</Label>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Tous les canaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les canaux</SelectItem>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3" />
                          {channel.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Utilisateur</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Tous les utilisateurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les utilisateurs</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-3 w-3" />
                          {user.username}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Date</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Toutes les dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les dates</SelectItem>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">7 derniers jours</SelectItem>
                    <SelectItem value="month">30 derniers jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={hasFiles ? "default" : "outline"}
                    size="sm"
                    className="h-8 flex-1"
                    onClick={() => setHasFiles(!hasFiles)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Fichiers
                  </Button>
                  <Button
                    variant={hasLinks ? "default" : "outline"}
                    size="sm"
                    className="h-8 flex-1"
                    onClick={() => setHasLinks(!hasLinks)}
                  >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    Liens
                  </Button>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={clearFilters}
              >
                <X className="h-3 w-3 mr-2" />
                Effacer les filtres
              </Button>
            )}

            <Button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recherche...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {results.length > 0 && (
                <div className="text-sm text-muted-foreground mb-4">
                  {total} résultat{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
                </div>
              )}

              {results.map((result) => (
                <div
                  key={result.id}
                  className="group border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={result.avatar} />
                      <AvatarFallback
                        style={{ backgroundColor: result.avatar_color }}
                      >
                        {result.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {result.username}
                        </span>
                        {result.channel_name && (
                          <Badge variant="secondary" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {result.channel_name}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(result.date), "MMM d, yyyy HH:mm")}
                        </span>
                        {result.edited && (
                          <Badge variant="outline" className="text-xs">
                            Modifié
                          </Badge>
                        )}
                        {result.pinned && (
                          <Badge variant="outline" className="text-xs">
                            Épinglé
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90 line-clamp-3">
                        {result.message}
                      </p>
                      {result.file_path && (
                        <div className="mt-2 text-xs flex items-center gap-1 text-blue-500">
                          <FileText className="h-3 w-3" />
                          {result.file_name || "Fichier joint"}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}

              {hasMore && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    "Charger plus"
                  )}
                </Button>
              )}

              {!isLoading && results.length === 0 && searchQuery && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Aucun résultat trouvé
                  </p>
                </div>
              )}

              {!searchQuery && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Entrez une recherche pour commencer
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

