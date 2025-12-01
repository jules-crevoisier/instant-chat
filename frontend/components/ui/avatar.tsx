"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { API_URL, API_ENDPOINTS } from "@/lib/config";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  src,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  const [imageSrc, setImageSrc] = React.useState<string | undefined>(undefined);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (!src) {
      setImageSrc(undefined);
      setHasError(false);
      return;
    }

    // Validate URL to prevent 404s on invalid inputs (like emojis)
    const isValidSrc = src && (src.startsWith("http") || src.startsWith("/") || src.startsWith("data:"));
    
    if (!isValidSrc) {
      setImageSrc(undefined);
      setHasError(false);
      return;
    }

    // If it's an external URL (http/https), use proxy
    if (src.startsWith("http://") || src.startsWith("https://")) {
      // Check if it's already a local/proxied URL
      if (src.includes(API_URL) || src.includes("localhost:3001") || src.includes("127.0.0.1:3001")) {
        setImageSrc(src);
      } else {
        // Use proxy for external images to avoid CORS and rate limiting issues
        const proxyUrl = API_ENDPOINTS.AVATAR_PROXY(src);
        setImageSrc(proxyUrl);
      }
    } else {
      // Local path or data URL
      setImageSrc(src);
    }
    setHasError(false);
  }, [src]);

  const handleError = React.useCallback(() => {
    setHasError(true);
    setImageSrc(undefined);
  }, []);

  if (!imageSrc || hasError) return null;

  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      src={imageSrc}
      className={cn("aspect-square size-full", className)}
      onError={handleError}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
