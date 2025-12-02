"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getServerUrl, setServerUrl, validateServerUrl } from "@/lib/config";
import { socket } from "@/lib/socket";

interface ServerConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
  isFirstRun?: boolean;
}

export function ServerConfigDialog({ open, onOpenChange, onSave, isFirstRun = false }: ServerConfigDialogProps) {
  const [serverUrl, setServerUrlState] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (open) {
      const currentUrl = getServerUrl();
      setServerUrlState(currentUrl);
      setIsValid(null);
    }
  }, [open]);

  const handleValidate = async () => {
    if (!serverUrl.trim()) {
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    try {
      const isValidUrl = await validateServerUrl(serverUrl.trim());
      setIsValid(isValidUrl);
      
      if (isValidUrl) {
        toast.success("Server URL is valid");
      } else {
        toast.error("Cannot connect to server. Please check the URL.");
      }
    } catch (error) {
      setIsValid(false);
      toast.error("Error validating server URL");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    if (!serverUrl.trim()) {
      toast.error("Server URL cannot be empty");
      return;
    }

    const trimmedUrl = serverUrl.trim();
    setServerUrl(trimmedUrl);
    
    // Disconnect socket with old URL
    socket.disconnect();
    
    toast.success("Server URL updated successfully!");
    onOpenChange(false);
    
    // Call onSave callback if provided
    if (onSave) {
      onSave();
    } else {
      // Default: reload page to apply new URL
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isValid === true) {
        handleSave();
      } else {
        handleValidate();
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={isFirstRun ? () => {} : onOpenChange}
    >
      <DialogContent 
        className="sm:max-w-[500px]"
        onEscapeKeyDown={isFirstRun ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <DialogTitle>
            {isFirstRun ? "Welcome to Instant Chat" : "Server Configuration"}
          </DialogTitle>
          <DialogDescription>
            {isFirstRun 
              ? "Please configure the server URL to get started. This will be saved locally in your browser."
              : "Configure the server URL for the chat application. This will be saved locally in your browser."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="server-url">Server URL</Label>
            <div className="flex gap-2">
              <Input
                id="server-url"
                type="url"
                placeholder="http://localhost:3001"
                value={serverUrl}
                onChange={(e) => {
                  setServerUrlState(e.target.value);
                  setIsValid(null);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1"
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleValidate}
                disabled={isValidating || !serverUrl.trim()}
              >
                {isValidating ? "Validating..." : "Validate"}
              </Button>
            </div>
            {isValid === true && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Server URL is valid and accessible</span>
              </div>
            )}
            {isValid === false && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>Cannot connect to server. Please check the URL.</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Enter the full URL including protocol (http:// or https://) and port if needed.
              Example: http://localhost:3001 or https://api.example.com
            </p>
          </div>
        </div>
        <DialogFooter>
          {!isFirstRun && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!serverUrl.trim()}
          >
            {isFirstRun ? "Continue" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

