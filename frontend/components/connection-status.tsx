"use client";

import { useEffect, useState } from "react";
import { socket, getConnectionStatus, getReconnectAttempts } from "@/lib/socket";
import { SOCKET_EVENTS } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "connecting" | "error">("disconnected");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getConnectionStatus());
      setAttempts(getReconnectAttempts());
    };

    updateStatus();

    socket.on(SOCKET_EVENTS.CONNECT, updateStatus);
    socket.on(SOCKET_EVENTS.DISCONNECT, updateStatus);
    socket.on(SOCKET_EVENTS.CONNECT_ERROR, updateStatus);
    socket.on(SOCKET_EVENTS.RECONNECT, updateStatus);
    socket.on(SOCKET_EVENTS.RECONNECT_ATTEMPT, updateStatus);
    socket.on(SOCKET_EVENTS.RECONNECT_ERROR, updateStatus);
    socket.on(SOCKET_EVENTS.RECONNECT_FAILED, updateStatus);

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, updateStatus);
      socket.off(SOCKET_EVENTS.DISCONNECT, updateStatus);
      socket.off(SOCKET_EVENTS.CONNECT_ERROR, updateStatus);
      socket.off(SOCKET_EVENTS.RECONNECT, updateStatus);
      socket.off(SOCKET_EVENTS.RECONNECT_ATTEMPT, updateStatus);
      socket.off(SOCKET_EVENTS.RECONNECT_ERROR, updateStatus);
      socket.off(SOCKET_EVENTS.RECONNECT_FAILED, updateStatus);
    };
  }, []);

  if (status === "connected") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant={status === "error" ? "destructive" : "secondary"}
        className="flex items-center gap-2 px-3 py-1.5"
      >
        {status === "connecting" ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            Reconnexion... {attempts > 0 && `(${attempts})`}
          </>
        ) : status === "error" ? (
          <>
            <WifiOff className="h-3 w-3" />
            Connexion perdue
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Déconnecté
          </>
        )}
      </Badge>
    </div>
  );
}

