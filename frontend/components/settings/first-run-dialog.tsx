"use client";

import { useState, useEffect } from "react";
import { getServerUrl, setServerUrl } from "@/lib/config";
import { ServerConfigDialog } from "./server-config-dialog";

const FIRST_RUN_KEY = "instant_chat_first_run_completed";

export function FirstRunDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if first run is completed
    if (typeof window !== "undefined") {
      const firstRunCompleted = localStorage.getItem(FIRST_RUN_KEY);
      
      // Show dialog only if first run not completed
      if (!firstRunCompleted) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleSave = () => {
    // Mark first run as completed
    localStorage.setItem(FIRST_RUN_KEY, "true");
    setIsOpen(false);
    
    // Small delay before reload to ensure localStorage is saved
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <ServerConfigDialog
      open={isOpen}
      onOpenChange={() => {}}
      onSave={handleSave}
      isFirstRun={true}
    />
  );
}

