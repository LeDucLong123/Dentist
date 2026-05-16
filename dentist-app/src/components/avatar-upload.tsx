"use client"

import { Camera } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AvatarUploadProps {
  src?: string
  alt?: string
  initials?: string
  size?: "default" | "lg"
  className?: string
  fallbackIcon?: React.ReactNode
  onUpload?: () => void
}

export function AvatarUpload({
  src,
  alt = "Avatar",
  initials,
  size = "lg",
  className,
  fallbackIcon,
  onUpload,
}: AvatarUploadProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar
        size={size}
        className={cn(
          "mx-auto",
          size === "lg" ? "w-32 h-32 rounded-2xl" : "w-24 h-24 rounded-full"
        )}
      >
        {src ? (
          <AvatarImage
            src={src}
            alt={alt}
            className={cn(
              "object-cover",
              size === "lg" ? "rounded-2xl" : "rounded-full"
            )}
          />
        ) : null}
        <AvatarFallback
          className={cn(
            "text-4xl bg-surface-container-high",
            size === "lg" ? "rounded-2xl" : "rounded-full",
            !fallbackIcon && "text-outline-variant"
          )}
        >
          {fallbackIcon || initials || <Camera className={size === "lg" ? "size-10" : "size-6"} />}
        </AvatarFallback>
      </Avatar>
      <button
        type="button"
        onClick={onUpload}
        className={cn(
          "absolute p-2 bg-primary text-on-primary shadow-md hover:scale-110 transition-transform",
          size === "lg"
            ? "-bottom-2 -right-2 rounded-lg"
            : "bottom-0 right-0 rounded-full"
        )}
      >
        <Camera className="size-4" />
      </button>
    </div>
  )
}
