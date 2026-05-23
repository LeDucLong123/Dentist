"use client"

import { cn } from "@/lib/utils"
import { 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ArrowRightLeft, 
  BadgeCheck 
} from "lucide-react"

export type StatusType = 
  | "active" 
  | "locked" 
  | "applied" 
  | "not_applied" 
  | "confirmed" 
  | "cancelled" 
  | "scheduled" 
  | "rescheduled" 
  | "completed" 
  | "checked_in" 
  | "examining"

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
  variant?: "badge" | "dot" | "icon"
}

export function StatusBadge({ status, className, variant = "badge" }: StatusBadgeProps) {
  const getStatusConfig = (s: string) => {
    switch (s) {
      // System & generic statuses
      case "active":
        return { 
          label: "Đang hoạt động", 
          classes: "bg-secondary-fixed text-on-secondary-fixed-variant", 
          dot: "bg-primary", 
          icon: CheckCircle2 
        }
      case "locked":
        return { 
          label: "ĐÃ KHÓA", 
          classes: "bg-error-container text-on-error-container", 
          dot: "bg-error", 
          icon: AlertCircle 
        }
      case "applied":
        return { 
          label: "ĐANG ÁP DỤNG", 
          classes: "bg-secondary-fixed text-on-secondary-fixed-variant", 
          dot: "bg-primary", 
          icon: CheckCircle2 
        }
      case "not_applied":
        return { 
          label: "KHÔNG ÁP DỤNG", 
          classes: "bg-error-container text-on-error-container", 
          dot: "bg-error", 
          icon: AlertCircle 
        }
      
      // Appointment statuses
      case "confirmed":
        return { 
          label: "Đã xác nhận", 
          classes: "bg-emerald-50 text-emerald-700 border border-emerald-200/50", 
          dot: "bg-emerald-400", 
          icon: CheckCircle2 
        }
      case "scheduled":
        return { 
          label: "Chờ xác nhận", 
          classes: "bg-blue-50 text-blue-700 border border-blue-200/50", 
          dot: "bg-blue-400", 
          icon: AlertCircle 
        }
      case "checked_in":
        return { 
          label: "Đã tiếp đón", 
          classes: "bg-purple-50 text-purple-700 border border-purple-200/50", 
          dot: "bg-purple-400", 
          icon: CheckCircle2 
        }
      case "examining":
        return { 
          label: "Đang khám", 
          classes: "bg-pink-50 text-pink-700 border border-pink-200/50", 
          dot: "bg-pink-400", 
          icon: Activity 
        }
      case "rescheduled":
        return { 
          label: "Yêu cầu đổi", 
          classes: "bg-amber-50 text-amber-700 border border-amber-200/50", 
          dot: "bg-amber-400", 
          icon: ArrowRightLeft 
        }
      case "completed":
        return { 
          label: "Hoàn thành", 
          classes: "bg-slate-50 text-slate-600 border border-slate-200/50", 
          dot: "bg-slate-400", 
          icon: BadgeCheck 
        }
      case "cancelled":
        return { 
          label: "Đã hủy", 
          classes: "bg-red-50 text-red-600 border border-red-200/50", 
          dot: "bg-red-400", 
          icon: AlertCircle 
        }
      default:
        return { 
          label: s.toUpperCase(), 
          classes: "bg-slate-100 text-slate-700", 
          dot: "bg-slate-400", 
          icon: AlertCircle 
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  if (variant === "dot") {
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", config.classes, className)}>
        <span className={cn("size-1.5 rounded-full", config.dot)} />
        {config.label}
      </span>
    )
  }

  if (variant === "icon") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", config.classes, className)}>
        <Icon className="size-3" />
        {config.label}
      </span>
    )
  }

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
