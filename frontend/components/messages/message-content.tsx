"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  content: string;
  className?: string;
}

function MessageContentComponent({ content, className }: MessageContentProps) {
  if (!content) return null;
  
  // Memoize the processed content to avoid recalculating on every render
  const processed = useMemo(() => {
    // Escape HTML first
    const escapeHtml = (text: string) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };
    
    // Process markdown-like syntax and mentions
    let result = escapeHtml(content);
    
    // Bold: **text** or __text__
    result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");
    
    // Italic: *text* or _text_ (but not if it's part of bold or mention)
    // Process italic after bold to avoid conflicts
    result = result.replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
    result = result.replace(/(?<!_)_(?!_)([^_\n]+?)(?<!_)_(?!_)/g, "<em>$1</em>");
    
    // Code: `code`
    result = result.replace(/`(.+?)`/g, "<code class='bg-muted px-1 py-0.5 rounded text-sm font-mono'>$1</code>");
    
    // Links: [text](url)
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      try {
        const urlObj = new URL(url);
        if (["http:", "https:"].includes(urlObj.protocol)) {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${text}</a>`;
        }
      } catch {
        // Invalid URL
      }
      return text;
    });
    
    // Mentions: @username, @everyone, @here
    result = result.replace(
      /(@\w+|@everyone|@here)/g,
      '<span class="bg-primary/10 text-primary rounded px-1 font-medium cursor-pointer hover:bg-primary/20 transition-colors">$1</span>'
    );
    
    // Line breaks
    result = result.replace(/\n/g, "<br />");
    
    return result;
  }, [content]);
  
  return (
    <div
      className={cn("whitespace-pre-wrap break-words", className)}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}

export const MessageContent = memo(MessageContentComponent);

