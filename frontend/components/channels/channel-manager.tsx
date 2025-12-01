"use client";

import { useState, useEffect } from "react";
import { Channel } from "@/hooks/use-chat-data";
import { useAuth } from "@/context/auth-context";
import { socket } from "@/lib/socket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import { Plus, Trash2, Hash, Volume2, Loader2, Smile, Edit } from "lucide-react";
import { toast } from "sonner";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { API_ENDPOINTS } from "@/lib/config";

interface ChannelManagerProps {
  channels: Channel[];
  onChannelCreated?: () => void;
  onChannelDeleted?: () => void;
}

export function ChannelManager({ channels, onChannelCreated, onChannelDeleted }: ChannelManagerProps) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
  const [channelToEdit, setChannelToEdit] = useState<Channel | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💬");
  const [voiceChannel, setVoiceChannel] = useState(false);

  // Listen for edit channel event from sidebar
  useEffect(() => {
    const handleEditChannel = (e: CustomEvent<Channel>) => {
      const channel = e.detail;
      setChannelToEdit(channel);
      setName(channel.name);
      setDescription(channel.description || "");
      setIcon(channel.icon || "💬");
      setVoiceChannel(channel.voice_channel === 1);
      setEditOpen(true);
    };
    window.addEventListener("editChannel" as any, handleEditChannel);
    return () => {
      window.removeEventListener("editChannel" as any, handleEditChannel);
    };
  }, []);

  const handleCreateChannel = async () => {
    if (!name.trim()) {
      toast.error("Le nom du canal est requis");
      return;
    }

    if (!token) {
      toast.error("Non authentifié");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(API_ENDPOINTS.CHANNELS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon: icon,
          voice_channel: voiceChannel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du canal");
      }

      toast.success(`Canal "${data.name}" créé avec succès`);
      setCreateOpen(false);
      setName("");
      setDescription("");
      setIcon("💬");
      setVoiceChannel(false);
      onChannelCreated?.();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du canal");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete || !token) return;

    setIsDeleting(true);
    try {
      const response = await fetch(API_ENDPOINTS.CHANNEL(channelToDelete.id), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la suppression du canal");
      }

      toast.success(`Canal "${channelToDelete.name}" supprimé avec succès`);
      setDeleteOpen(false);
      setChannelToDelete(null);
      onChannelDeleted?.();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression du canal");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (channel: Channel) => {
    if (channel.id === 1) {
      toast.error("Impossible de supprimer le canal par défaut");
      return;
    }
    setChannelToDelete(channel);
    setDeleteOpen(true);
  };

  const openEditDialog = (channel: Channel) => {
    setChannelToEdit(channel);
    setName(channel.name);
    setDescription(channel.description || "");
    setIcon(channel.icon || "💬");
    setVoiceChannel(channel.voice_channel === 1);
    setEditOpen(true);
  };

  const handleEditChannel = async () => {
    if (!name.trim() || !channelToEdit) {
      toast.error("Le nom du canal est requis");
      return;
    }

    if (!token) {
      toast.error("Non authentifié");
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch(API_ENDPOINTS.CHANNEL(channelToEdit.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon: icon,
          voice_channel: voiceChannel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la modification du canal");
      }

      toast.success(`Canal "${data.name}" modifié avec succès`);
      setEditOpen(false);
      setChannelToEdit(null);
      setName("");
      setDescription("");
      setIcon("💬");
      setVoiceChannel(false);
      onChannelCreated?.();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification du canal");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <>
      {/* Create Channel Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            Créer un canal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau canal</DialogTitle>
            <DialogDescription>
              Créez un nouveau canal de discussion ou vocal pour votre serveur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Nom du canal *</Label>
              <Input
                id="channel-name"
                placeholder="ex: général"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-description">Description</Label>
              <Textarea
                id="channel-description"
                placeholder="Description du canal (optionnel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-icon">Icône</Label>
              <div className="flex items-center gap-2">
                <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-20 text-2xl"
                      onClick={(e) => {
                        e.preventDefault();
                        setEmojiPickerOpen(true);
                      }}
                    >
                      {icon || "💬"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-0" align="start">
                    <EmojiPicker
                      theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                      onEmojiClick={(emojiData) => {
                        setIcon(emojiData.emoji);
                        setEmojiPickerOpen(false);
                      }}
                      width={350}
                      height={400}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  id="channel-icon"
                  placeholder="💬"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={2}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cliquez sur le bouton pour choisir un emoji ou saisissez directement
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-type">Type de canal</Label>
              <Select
                value={voiceChannel ? "voice" : "text"}
                onValueChange={(value) => setVoiceChannel(value === "voice")}
              >
                <SelectTrigger id="channel-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Canal texte
                    </div>
                  </SelectItem>
                  <SelectItem value="voice">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Canal vocal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateChannel} disabled={isCreating || !name.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Channel Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le canal</DialogTitle>
            <DialogDescription>
              Modifiez les informations du canal "{channelToEdit?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-channel-name">Nom du canal *</Label>
              <Input
                id="edit-channel-name"
                placeholder="ex: général"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-channel-description">Description</Label>
              <Textarea
                id="edit-channel-description"
                placeholder="Description du canal (optionnel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-channel-icon">Icône</Label>
              <div className="flex items-center gap-2">
                <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-20 text-2xl"
                      onClick={(e) => {
                        e.preventDefault();
                        setEmojiPickerOpen(true);
                      }}
                    >
                      {icon || "💬"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-0" align="start">
                    <EmojiPicker
                      theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                      onEmojiClick={(emojiData) => {
                        setIcon(emojiData.emoji);
                        setEmojiPickerOpen(false);
                      }}
                      width={350}
                      height={400}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  id="edit-channel-icon"
                  placeholder="💬"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={2}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cliquez sur le bouton pour choisir un emoji ou saisissez directement
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-channel-type">Type de canal</Label>
              <Select
                value={voiceChannel ? "voice" : "text"}
                onValueChange={(value) => setVoiceChannel(value === "voice")}
              >
                <SelectTrigger id="edit-channel-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Canal texte
                    </div>
                  </SelectItem>
                  <SelectItem value="voice">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Canal vocal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditChannel} disabled={isEditing || !name.trim()}>
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Channel Alert Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le canal</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le canal{" "}
              <strong>"{channelToDelete?.name}"</strong> ? Cette action est irréversible et
              supprimera tous les messages associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChannel}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Export a hook to use edit functionality from sidebar
export function useChannelEdit() {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const editChannel = async (channelId: number, data: { name: string; description?: string; icon?: string; voice_channel?: boolean }) => {
    if (!token) {
      toast.error("Non authentifié");
      return false;
    }

    setIsEditing(true);
    try {
      const response = await fetch(API_ENDPOINTS.CHANNEL(channelId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const data_res = await response.json();

      if (!response.ok) {
        throw new Error(data_res.error || "Erreur lors de la modification du canal");
      }

      toast.success("Canal modifié avec succès");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification du canal");
      return false;
    } finally {
      setIsEditing(false);
    }
  };

  return { editChannel, isEditing };
}

// Export a hook to use delete functionality from sidebar
export function useChannelDelete() {
  const { token } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteChannel = async (channelId: number) => {
    if (!token) {
      toast.error("Non authentifié");
      return false;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(API_ENDPOINTS.CHANNEL(channelId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la suppression du canal");
      }

      toast.success("Canal supprimé avec succès");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression du canal");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteChannel, isDeleting };
}

