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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getServerUrl, setServerUrl, validateServerUrl } from "@/lib/config";
import { socket } from "@/lib/socket";

export function ServerConfig() {
  const [isOpen, setIsOpen] = useState(false);
  const [serverUrl, setServerUrlState] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentUrl = getServerUrl();
      setServerUrlState(currentUrl);
      setIsValid(null);
    }
  }, [isOpen]);

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

    if (isValid === false) {
      toast.error("Please validate the server URL before saving");
      return;
    }

    const trimmedUrl = serverUrl.trim();
    setServerUrl(trimmedUrl);
    
    // Disconnect and reconnect socket with new URL
    socket.disconnect();
    
    // Small delay to ensure disconnect completes
    setTimeout(() => {
      // The socket will reconnect automatically when needed
      toast.success("Server URL updated. The connection will be re-established.");
      setIsOpen(false);
      
      // Reload page to ensure all components use the new URL
      window.location.reload();
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleValidate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Server Configuration">
          <Settings2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Server Configuration</DialogTitle>
          <DialogDescription>
            Configure the server URL for the chat application. This will be saved locally in your browser.
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!serverUrl.trim() || isValid === false}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



