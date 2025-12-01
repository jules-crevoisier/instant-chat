/**
 * Utilities for sanitizing user input to prevent XSS attacks
 */

import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    // Server-side: return as-is (DOMPurify needs DOM)
    return html;
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b", "strong", "i", "em", "u", "s", "strike", "del",
      "code", "pre", "blockquote", "p", "br",
      "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6"
    ],
    ALLOWED_ATTR: ["href", "title", "class"],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitize plain text (escape HTML)
 */
export function sanitizeText(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize message content (allows basic markdown-like formatting)
 */
export function sanitizeMessage(message: string): string {
  // First escape HTML
  let sanitized = sanitizeText(message);
  
  // Then allow safe markdown-like formatting
  // Bold: **text** or __text__
  sanitized = sanitized.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  sanitized = sanitized.replace(/__(.+?)__/g, "<strong>$1</strong>");
  
  // Italic: *text* or _text_
  sanitized = sanitized.replace(/\*(.+?)\*/g, "<em>$1</em>");
  sanitized = sanitized.replace(/_(.+?)_/g, "<em>$1</em>");
  
  // Code: `code`
  sanitized = sanitized.replace(/`(.+?)`/g, "<code>$1</code>");
  
  // Links: [text](url)
  sanitized = sanitized.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // Validate URL
    try {
      const urlObj = new URL(url);
      if (["http:", "https:"].includes(urlObj.protocol)) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
    } catch {
      // Invalid URL, return as plain text
    }
    return text;
  });
  
  // Line breaks
  sanitized = sanitized.replace(/\n/g, "<br />");
  
  // Final sanitization
  return sanitizeHtml(sanitized);
}

