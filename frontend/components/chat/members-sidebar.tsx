"use client";

import { User } from "@/hooks/use-chat-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

interface MembersSidebarProps {
  users: User[];
}

const STATUS_ORDER = {
  online: 0,
  idle: 1,
  dnd: 2,
  offline: 3,
  invisible: 3,
};

const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
  invisible: "Offline",
};

const STATUS_COLORS: Record<string, string> = {
  online: "bg-green-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-400",
  invisible: "bg-gray-400",
};

export function MembersSidebar({ users }: MembersSidebarProps) {
  // Group users by status
  const groupedUsers = users.reduce((acc, user) => {
    const status = (user.status || "offline") as keyof typeof STATUS_ORDER;
    // Treat invisible as offline
    const key = status === "invisible" ? "offline" : status;
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  // Sort groups
  const sortedGroups = Object.keys(groupedUsers).sort(
    (a, b) => STATUS_ORDER[a as keyof typeof STATUS_ORDER] - STATUS_ORDER[b as keyof typeof STATUS_ORDER]
  );

  return (
    <div className="w-full md:w-60 border-l bg-background flex flex-col h-full">
      <div className="p-3 h-14 border-b flex items-center">
          <h2 className="font-semibold text-sm">Members</h2>
      </div>
      <ScrollArea className="flex-1 p-3">
        {sortedGroups.map((status) => {
          const groupUsers = groupedUsers[status];
          if (!groupUsers?.length) return null;

          return (
            <div key={status} className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {STATUS_LABELS[status]} — {groupUsers.length}
              </h3>
              <div className="space-y-1">
                {groupUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors group"
                  >
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback style={{ backgroundColor: user.avatar_color }}>
                                  {user.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span 
                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${STATUS_COLORS[status === 'invisible' ? 'offline' : status]}`}
                              />
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80" side="left">
                            <div className="flex justify-between space-x-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback style={{ backgroundColor: user.avatar_color }}>
                                        {user.username[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold">@{user.username}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {user.bio || "No bio available"}
                                    </p>
                                    <div className="flex items-center pt-2">
                                        <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                                        <span className="text-xs text-muted-foreground">
                                            Joined {format(new Date(), "MMMM yyyy")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground/90 group-hover:text-foreground">
                        {user.username}
                      </p>
                      {user.bio && (
                          <p className="text-[10px] text-muted-foreground truncate">
                              {user.bio}
                          </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}

