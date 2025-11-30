"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { socket } from "@/lib/socket";

export function ProfileSettings() {
  const { user, token } = useAuth();
  const { setTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [status, setStatus] = useState(user?.status || "online");
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || "#000000");

  const handleSave = async () => {
    if (!user || !token) return;
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio,
          avatar,
          avatar_color: avatarColor,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      
      // Update socket status
      socket.emit("user_status_update", { userId: user.id, status });

      toast.success("Profile updated successfully");
      setIsOpen(false);
      
      // Reload page to refresh context (simpler than updating context manually for now)
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="profile-description">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription id="profile-description">
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4 justify-center">
             <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={avatar} />
                <AvatarFallback style={{ backgroundColor: avatarColor }}>
                  {user?.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
             </Avatar>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="avatar" className="text-right">
              Avatar URL
            </Label>
            <Input
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="col-span-3"
              placeholder="https://example.com/avatar.png"
            />
          </div>
          
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Color
            </Label>
            <div className="col-span-3 flex gap-2">
                 <Input
                  id="color"
                  type="color"
                  value={avatarColor}
                  onChange={(e) => setAvatarColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                 <Input
                  value={avatarColor}
                  onChange={(e) => setAvatarColor(e.target.value)}
                  className="flex-1"
                />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="dnd">Do Not Disturb</SelectItem>
                <SelectItem value="invisible">Invisible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Theme</Label>
            <div className="col-span-3 flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4 mr-2" /> Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4 mr-2" /> Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
              >
                <Laptop className="h-4 w-4 mr-2" /> System
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

