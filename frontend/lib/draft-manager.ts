/**
 * Draft message manager - saves drafts to localStorage
 */

const DRAFT_STORAGE_PREFIX = "chat_draft_";

export function getDraftKey(chatType: "channel" | "dm", chatId: number): string {
  return `${DRAFT_STORAGE_PREFIX}${chatType}_${chatId}`;
}

export function saveDraft(chatType: "channel" | "dm", chatId: number, draft: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const key = getDraftKey(chatType, chatId);
    localStorage.setItem(key, draft);
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
}

export function getDraft(chatType: "channel" | "dm", chatId: number): string {
  if (typeof window === "undefined") return "";
  
  try {
    const key = getDraftKey(chatType, chatId);
    return localStorage.getItem(key) || "";
  } catch (error) {
    console.error("Failed to get draft:", error);
    return "";
  }
}

export function clearDraft(chatType: "channel" | "dm", chatId: number): void {
  if (typeof window === "undefined") return;
  
  try {
    const key = getDraftKey(chatType, chatId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear draft:", error);
  }
}

export function clearAllDrafts(): void {
  if (typeof window === "undefined") return;
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(DRAFT_STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Failed to clear all drafts:", error);
  }
}

