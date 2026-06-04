"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell, Clock, ChevronDown, Smile,
  Settings, LogOut, User, Shield, X,
  CalendarCheck, AlertCircle, CheckCircle2, Info,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────

interface TopbarProps {
  title?: string
  variant?: "default" | "simple"
  searchPlaceholder?: string
}

// ─── Mock notifications ──────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: 1,
    type: "appointment",
    icon: CalendarCheck,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
    title: "Lịch khám mới được xác nhận",
    desc: "Bệnh nhân Nguyễn Văn A – 08:00 hôm nay",
    time: "2 phút trước",
    read: false,
  },
  {
    id: 2,
    type: "alert",
    icon: AlertCircle,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    title: "Yêu cầu đổi lịch",
    desc: "BS. Emily Thorne yêu cầu đổi ca 10:30 → 14:00",
    time: "15 phút trước",
    read: false,
  },
  {
    id: 3,
    type: "success",
    icon: CheckCircle2,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    title: "Hồ sơ bệnh nhân được cập nhật",
    desc: "Trần Thị B – chỉnh nha mắc cài hoàn tất",
    time: "1 giờ trước",
    read: false,
  },
  {
    id: 4,
    type: "info",
    icon: Info,
    iconColor: "text-slate-400",
    iconBg: "bg-slate-50",
    title: "Nhắc nhở: Hóa đơn chưa thanh toán",
    desc: "3 bệnh nhân còn công nợ tuần này",
    time: "3 giờ trước",
    read: true,
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_SRC = "https://lh3.googleusercontent.com/aida-public/AB6AXuD06D9LAfN9_kgCqwqmM2M_jrRopYohscu3QjLcT8aDD5osXOBEPVDA-17FeegNEQQvwV6iKzKIr2OzVmv9Jo01gOHN5NdFy3luiM5ZVD8QVa6Zi0lDVyziB5D4YW3ldcqbYPiqpLBHsZMDwk6bqZEUXJy6tO89aPrFJrM0mheM3spGN-8jH2H019hJ8ST87MyhP_wMexWO5v-69uqv0MW67PEV5DkbBJv__ZWbJEcwwIoMs1uqE6mnr74yQeITxNNAen20uiluWQ"

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Chào buổi sáng"
  if (h < 14) return "Chào buổi trưa"
  if (h < 18) return "Chào buổi chiều"
  return "Chào buổi tối"
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      setDate(now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2">
      <Clock className="size-3.5 text-primary/60 shrink-0" />
      <div className="text-left">
        <p className="text-[13px] font-bold font-mono text-on-surface tracking-wide leading-none">{time}</p>
        <p className="text-[10px] text-on-surface-variant/60 capitalize mt-0.5 leading-none">{date}</p>
      </div>
    </div>
  )
}

// ─── Notification Modal ───────────────────────────────────────────────────────

function NotificationModal({
  open,
  onClose,
  notifications,
  onMarkAllRead,
}: {
  open: boolean
  onClose: () => void
  notifications: typeof NOTIFICATIONS
  onMarkAllRead: () => void
}) {
  if (!open) return null
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200/60 z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-on-surface">Thông báo</h3>
            {unreadCount > 0 && (
              <p className="text-[11px] text-on-surface-variant/60 mt-0.5">{unreadCount} chưa đọc</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Đánh dấu đã đọc
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-on-surface-variant"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
          {notifications.map((n) => {
            const Icon = n.icon
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3.5 px-5 py-4 cursor-pointer hover:bg-slate-50/80 transition-colors",
                  !n.read && "bg-blue-50/30"
                )}
              >
                <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", n.iconBg)}>
                  <Icon className={cn("size-4", n.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-xs font-semibold text-on-surface leading-snug", !n.read && "font-bold")}>
                      {n.title}
                    </p>
                    {!n.read && <span className="size-2 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                  <p className="text-[11px] text-on-surface-variant/70 mt-0.5 leading-snug">{n.desc}</p>
                  <p className="text-[10px] text-on-surface-variant/40 mt-1.5 font-medium">{n.time}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <button className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors py-1">
            Xem tất cả thông báo
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Main Topbar ─────────────────────────────────────────────────────────────

export function Topbar({ title, variant = "default", searchPlaceholder }: TopbarProps) {
  const [greeting, setGreeting] = useState("")
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string } | null>(null)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser))
      }
    } catch {}
  }, [])

  const roleLabels: Record<string, string> = {
    admin: "Quản trị viên",
    patient: "Bệnh nhân",
    receptionist: "Lễ tân",
    doctor: "Bác sĩ"
  }

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
    router.refresh()
  }

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const NotifBell = (
    <div className="relative">
      <button
        onClick={() => setNotifOpen(v => !v)}
        className={cn(
          "relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors group",
          notifOpen && "bg-slate-100"
        )}
      >
        <Bell className="size-5 text-on-surface-variant group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <NotificationModal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={markAllRead}
      />
    </div>
  )

  const userName = currentUser?.name || "Người dùng"
  const userRoleText = roleLabels[currentUser?.role || ""] || "Thành viên"
  const userEmail = currentUser?.email || "user@clinicserenity.vn"
  const userInitials = userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()

  const UserMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200 outline-none">
          <Avatar size="default" className="ring-2 ring-white shadow-sm">
            <AvatarImage src={AVATAR_SRC} alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-xs font-bold text-on-surface leading-none">{userName}</p>
            <p className="text-[10px] text-on-surface-variant/60 leading-none mt-0.5">{userRoleText}</p>
          </div>
          <ChevronDown className="size-3.5 text-on-surface-variant/40 group-hover:text-on-surface-variant transition-colors" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-slate-200/60 p-2 mt-1">
        {/* User info header */}
        <div className="px-2 py-2 mb-1">
          <div className="flex items-center gap-3">
            <Avatar size="default" className="ring-2 ring-white shadow-sm shrink-0">
              <AvatarImage src={AVATAR_SRC} alt={userName} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-on-surface">{userName}</p>
              <p className="text-xs text-on-surface-variant/60 truncate max-w-[130px]">{userEmail}</p>
            </div>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-lg">
            <Shield className="size-3 text-primary" />
            <span className="text-[11px] font-bold text-primary">{userRoleText}</span>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 bg-slate-100" />

        <DropdownMenuItem asChild className="gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 text-sm font-medium text-on-surface">
          <Link href="/profile">
            <User className="size-4 text-on-surface-variant" />
            Hồ sơ cá nhân
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 text-sm font-medium text-on-surface">
          <Link href="/settings">
            <Settings className="size-4 text-on-surface-variant" />
            Cài đặt hệ thống
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-slate-100" />

        <DropdownMenuItem asChild className="gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 text-sm font-medium text-on-surface">
          <Link href="/login">
            <LogOut className="size-4 text-on-surface-variant rotate-180" />
            Đăng nhập
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 text-sm font-medium text-on-surface">
          <Link href="/signup">
            <User className="size-4 text-on-surface-variant" />
            Đăng ký tài khoản
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-slate-100" />

        <DropdownMenuItem onClick={handleLogout} className="gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-red-50 text-sm font-medium text-red-600 focus:text-red-600 focus:bg-red-50">
          <LogOut className="size-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (variant === "simple") {
    return (
      <header className="flex justify-between items-center px-8 py-4 w-full backdrop-blur-xl bg-surface/80 sticky top-0 z-30 border-b border-slate-100">
        <h2 className="font-headline font-bold text-xl tracking-tight text-blue-800">{title}</h2>
        <div className="flex items-center gap-2">
          <LiveClock />
          {NotifBell}
          {UserMenu}
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-8 py-3.5 flex justify-between items-center border-b border-slate-100 shadow-[0_1px_20px_rgba(25,28,29,0.04)]">
      {/* Left — greeting */}
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-gradient-to-br from-primary/20 to-blue-400/20 flex items-center justify-center">
          <Smile className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-on-surface-variant/60 leading-none mb-0.5">{greeting},</p>
          <p className="text-sm font-bold text-on-surface leading-none">{userName}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <LiveClock />
        <div className="w-px h-7 bg-slate-200 mx-1" />
        {NotifBell}
        <div className="w-px h-7 bg-slate-200 mx-1" />
        {UserMenu}
      </div>
    </header>
  )
}
