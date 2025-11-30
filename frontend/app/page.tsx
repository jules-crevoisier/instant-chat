"use client";

import { useAuth } from "@/context/auth-context";
import { AuthScreen } from "@/components/auth/auth-screen";
import { ChatLayout } from "@/components/chat/chat-layout";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <ChatLayout />;
}
