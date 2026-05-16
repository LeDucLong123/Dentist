"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "active" | "locked"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case "active":
      case "applied":
      case "confirmed":
        return { 
          label: s === "applied" ? "ĐANG ÁP DỤNG" : s === "confirmed" ? "ĐÃ XÁC NHẬN" : "Đang hoạt động", 
          classes: "bg-secondary-fixed text-on-secondary-fixed-variant" 
        }
      case "locked":
      case "not_applied":
      case "cancelled":
        return { 
          label: s === "not_applied" ? "KHÔNG ÁP DỤNG" : s === "cancelled" ? "ĐÃ HỦY" : "ĐÃ KHÓA", 
          classes: "bg-error-container text-on-error-container" 
        }
      case "scheduled":
        return { label: "SẮP TỚI", classes: "bg-primary-container text-on-primary-container" }
      case "rescheduled":
        return { label: "ĐỔI LỊCH", classes: "bg-tertiary-container text-on-tertiary-container" }
      case "completed":
        return { label: "HOÀN THÀNH", classes: "bg-surface-container-highest text-on-surface-variant" }
      default:
        return { label: s.toUpperCase(), classes: "bg-slate-100 text-slate-700" }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export function FilterChip({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
        active
          ? "bg-surface-container-lowest text-primary border border-primary/10"
          : "bg-surface text-on-surface-variant hover:bg-surface-container-highest"
      )}
    >
      {label}
    </span>
  )
}
