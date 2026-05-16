"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Wrench,
  CreditCard,
  Settings,
  LifeBuoy,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Thống kê", icon: LayoutDashboard },
  { href: "/users", label: "Người dùng", icon: Users },
  { href: "/doctors", label: "Bác sĩ", icon: Stethoscope },
  { href: "/appointments", label: "Lịch khám", icon: CalendarIcon },
  { href: "/services", label: "Dịch vụ", icon: Wrench },
  { href: "/pricing", label: "Bảng giá", icon: CreditCard },
  { href: "/settings", label: "Cài đặt", icon: Settings },
]

const bottomItems = [
  { href: "/help", label: "Trung tâm hỗ trợ", icon: LifeBuoy },
]

// Context để chia sẻ trạng thái collapsed với các component khác (layout)
export const SidebarContext = React.createContext<{
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}>({
  collapsed: false,
  setCollapsed: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed")
      if (saved !== null) setCollapsed(JSON.parse(saved))
    } catch {}
  }, [])

  const handleSet = (v: boolean) => {
    setCollapsed(v)
    try { localStorage.setItem("sidebar-collapsed", JSON.stringify(v)) } catch {}
  }

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed: handleSet }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const { collapsed, setCollapsed } = useSidebar()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (href: string) => {
    if (!mounted) return false
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-slate-50 flex flex-col py-6 z-50 overflow-y-auto overflow-x-hidden transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[68px] px-2" : "w-72 px-4"
      )}
    >
      {/* Logo + toggle button */}
      <div className={cn("mb-10 flex items-center", collapsed ? "justify-center px-0" : "px-4 justify-between")}>
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold font-headline text-primary tracking-tight">
              Clinical Serenity
            </h1>
            <p className="text-xs text-on-surface-variant font-medium">Quản lý nha khoa</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          className={cn(
            "size-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors shrink-0",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 py-3 text-sm rounded-lg transition-colors",
                collapsed ? "justify-center px-0" : "px-4",
                active
                  ? "text-blue-700 font-bold bg-blue-50 border-r-4 border-blue-600"
                  : "text-on-surface-variant font-medium hover:bg-slate-200/50"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom items */}
      <div className="mt-auto pt-6 border-t border-slate-200/50 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 py-3 text-on-surface-variant font-medium text-sm rounded-lg hover:bg-slate-200/50 transition-colors",
                collapsed ? "justify-center px-0" : "px-4"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
