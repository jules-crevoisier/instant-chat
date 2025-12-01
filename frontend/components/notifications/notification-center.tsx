"use client";

import { useState } from "react";
import { useNotifications } from "@/context/notification-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell, X, Settings, Volume2, VolumeX, Check } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
    enableSound,
    setEnableSound,
    enableDesktopNotifications,
    setEnableDesktopNotifications,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    // TODO: Navigate to the channel/DM
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setEnableSound(!enableSound)}
                    className="flex items-center gap-2"
                  >
                    {enableSound ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                    {enableSound ? "Disable" : "Enable"} Sound
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setEnableDesktopNotifications(!enableDesktopNotifications)}
                    className="flex items-center gap-2"
                  >
                    {enableDesktopNotifications ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    {enableDesktopNotifications ? "Disable" : "Enable"} Desktop Notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-2 px-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <>
                {unreadNotifications.length > 0 && (
                  <>
                    <div className="px-2 py-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                        Unread ({unreadNotifications.length})
                      </h3>
                    </div>
                    {unreadNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="group border rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer relative"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback
                              style={{ backgroundColor: notification.avatarColor }}
                            >
                              {notification.username?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {notification.title}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                {notification.type === "channel" ? "#" : "DM"}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground/90 line-clamp-2">
                              {notification.body}
                            </p>
                            <span className="text-xs text-muted-foreground mt-1 block">
                              {format(notification.timestamp, "MMM d, HH:mm")}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
                      </div>
                    ))}
                    {readNotifications.length > 0 && <Separator className="my-4" />}
                  </>
                )}
                {readNotifications.length > 0 && (
                  <>
                    {unreadNotifications.length > 0 && (
                      <div className="px-2 py-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                          Read ({readNotifications.length})
                        </h3>
                      </div>
                    )}
                    {readNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="group border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback
                              style={{ backgroundColor: notification.avatarColor }}
                            >
                              {notification.username?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {notification.title}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                {notification.type === "channel" ? "#" : "DM"}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground/90 line-clamp-2">
                              {notification.body}
                            </p>
                            <span className="text-xs text-muted-foreground mt-1 block">
                              {format(notification.timestamp, "MMM d, HH:mm")}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

