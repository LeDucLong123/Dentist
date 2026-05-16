"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Plus,
  Stethoscope,
  Edit2,
  Lock,
  LockOpen,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckCircle,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Topbar } from "@/components/topbar"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type ServiceStatus = "active" | "locked"

interface Service {
  id: string
  name: string
  category: string
  status: ServiceStatus
  description: string
}

const initialServices: Service[] = [
  {
    id: "DV001",
    name: "Cấy ghép Implant",
    category: "Răng sứ & Implant",
    status: "active",
    description: "Giải pháp phục hồi răng đã mất hiệu quả nhất hiện nay.",
  },
  {
    id: "DV002",
    name: "Chỉnh nha mắc cài kim loại",
    category: "Chỉnh nha",
    status: "active",
    description: "Cải thiện khớp cắn và thẩm mỹ nụ cười.",
  },
  {
    id: "DV003",
    name: "Tẩy trắng răng Laser",
    category: "Thẩm mỹ",
    status: "locked",
    description: "Công nghệ làm trắng răng nhanh chóng, không ê buốt.",
  },
  {
    id: "DV004",
    name: "Nhổ răng khôn",
    category: "Tổng quát",
    status: "active",
    description: "Nhổ răng khôn mọc lệch, mọc ngầm bằng công nghệ siêu âm Piezotome.",
  },
  {
    id: "DV005",
    name: "Bọc răng sứ Zirconia",
    category: "Răng sứ & Implant",
    status: "active",
    description: "Phục hình thẩm mỹ với vật liệu sứ Zirconia cao cấp.",
  },
]

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "Răng sứ & Implant": { bg: "bg-blue-50 border border-blue-200", text: "text-blue-700", dot: "bg-blue-400" },
  "Chỉnh nha":         { bg: "bg-violet-50 border border-violet-200", text: "text-violet-700", dot: "bg-violet-400" },
  "Thẩm mỹ":           { bg: "bg-rose-50 border border-rose-200", text: "text-rose-700", dot: "bg-rose-400" },
  "Tổng quát":          { bg: "bg-slate-50 border border-slate-200", text: "text-slate-600", dot: "bg-slate-400" },
}

const ICON_COLORS = [
  "from-blue-500 to-cyan-600",
  "from-violet-500 to-indigo-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
]

const CATEGORIES = ["Tất cả", "Răng sứ & Implant", "Chỉnh nha", "Thẩm mỹ", "Tổng quát"]
const SORT_OPTIONS = ["Tên (A-Z)", "Chuyên khoa", "Mã dịch vụ"]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [activeCategory, setActiveCategory] = useState("Tất cả")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState("Tên (A-Z)")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPageInput, setItemsPerPageInput] = useState("3")
  const [lockTarget, setLockTarget] = useState<Service | null>(null)

  const stats = useMemo(() => ({
    total: services.length,
    active: services.filter((s) => s.status === "active").length,
    locked: services.filter((s) => s.status === "locked").length,
  }), [services])

  const filteredSorted = useMemo(() => {
    let result = [...services]
    if (activeCategory !== "Tất cả") result = result.filter((s) => s.category === activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      if (sortKey === "Tên (A-Z)") return a.name.localeCompare(b.name, "vi")
      if (sortKey === "Chuyên khoa") return a.category.localeCompare(b.category, "vi")
      if (sortKey === "Mã dịch vụ") return a.id.localeCompare(b.id)
      return 0
    })
    return result
  }, [services, activeCategory, searchQuery, sortKey])

  const itemsPerPage = Math.max(1, parseInt(itemsPerPageInput) || 3)
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / itemsPerPage))
  const paginated = filteredSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleToggleLock = () => {
    if (!lockTarget) return
    setServices((prev) =>
      prev.map((s) => s.id === lockTarget.id ? { ...s, status: s.status === "active" ? "locked" : "active" } : s)
    )
    toast.success(`Đã ${lockTarget.status === "active" ? "khóa" : "mở khóa"} dịch vụ "${lockTarget.name}".`)
    setLockTarget(null)
  }

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm dịch vụ..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50 mb-6">
          <span>Hệ thống</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Dịch vụ</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-primary/10">
                <Stethoscope className="size-5 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Danh mục Dịch vụ</h1>
            </div>
            <p className="text-sm text-on-surface-variant ml-[44px]">
              Quản lý các dịch vụ nha khoa và chuyên khoa trong hệ thống.
            </p>
          </div>
          <Link href="/services/new">
            <Button className="bg-primary text-on-primary h-10 px-5 shadow-md shadow-primary/25 hover:shadow-primary/40 hover:brightness-105 transition-all font-semibold gap-2 shrink-0">
              <Plus className="size-4" />
              Thêm dịch vụ
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Tổng dịch vụ",    value: stats.total,  color: "text-blue-700",    bg: "bg-blue-50" },
            { label: "Đang hoạt động",   value: stats.active, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Đã khóa",          value: stats.locked, color: "text-red-600",     bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.bg} border border-transparent`}>
              <p className="text-xs font-medium text-on-surface-variant/70 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-low/60 backdrop-blur rounded-2xl px-4 py-3 mb-4 border border-outline-variant/10">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Layers className="size-4 text-primary/60" />
              <span className="font-medium">Hiển thị</span>
              <Input
                type="number"
                min={1}
                value={itemsPerPageInput}
                onChange={(e) => { setItemsPerPageInput(e.target.value); setCurrentPage(1) }}
                className="h-7 w-14 text-center bg-white border-outline-variant/30 text-sm font-semibold"
              />
              <span className="font-medium">dòng/trang</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setActiveCategory(c); setCurrentPage(1) }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    activeCategory === c
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-white border border-outline-variant/30 text-on-surface-variant hover:border-primary/30 hover:text-primary"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-outline" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                placeholder="Tìm kiếm..."
                className="pl-8 pr-7 py-1.5 h-7 rounded-lg bg-white border border-outline-variant/30 text-xs outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 w-44"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface">
                  <X className="size-3" />
                </button>
              )}
            </div>
            <Select value={sortKey} onValueChange={(v) => { if (v) { setSortKey(v); setCurrentPage(1) } }}>
              <SelectTrigger className="h-7 w-[140px] text-xs bg-white border-outline-variant/30 font-semibold text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {paginated.length === 0 ? (
            <div className="bg-white rounded-2xl border border-outline-variant/10 px-6 py-16 text-center">
              <Stethoscope className="size-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-on-surface-variant">Không tìm thấy dịch vụ nào</p>
              <p className="text-sm opacity-60 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : paginated.map((service) => {
            const catStyle = CATEGORY_STYLES[service.category] ?? CATEGORY_STYLES["Tổng quát"]
            const gradient = ICON_COLORS[parseInt(service.id.replace("DV", "")) % ICON_COLORS.length]
            return (
              <div
                key={service.id}
                className={cn(
                  "group relative bg-white rounded-2xl border transition-all duration-200",
                  service.status === "locked"
                    ? "border-red-100 bg-red-50/30 opacity-80"
                    : "border-outline-variant/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                )}
              >
                <div className="flex items-center gap-5 p-4 pr-5">
                  {/* Icon */}
                  <div className={`relative size-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
                    <Stethoscope className="size-6 text-white" />
                    {service.status === "locked" && (
                      <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                        <Lock className="size-2.5 text-white" />
                      </div>
                    )}
                    {service.status === "active" && (
                      <div className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-y-2 gap-x-6">
                    {/* Name & category */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", catStyle.bg, catStyle.text)}>
                          <span className={cn("size-1.5 rounded-full", catStyle.dot)} />
                          {service.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-on-surface truncate">{service.name}</h3>
                      <span className="text-[11px] text-on-surface-variant/60 font-mono">{service.id}</span>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50 hidden lg:block">Mô tả</p>
                      <p className="text-xs text-on-surface-variant line-clamp-2">{service.description}</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center lg:justify-end">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                        service.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      )}>
                        <span className={cn("size-1.5 rounded-full", service.status === "active" ? "bg-emerald-400" : "bg-red-400")} />
                        {service.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/services/${service.id}/edit`}>
                      <Button variant="ghost" size="icon-sm" className="text-primary/60 hover:text-primary hover:bg-primary/10 rounded-xl">
                        <Edit2 className="size-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setLockTarget(service)}
                      className={cn(
                        "rounded-xl",
                        service.status === "active"
                          ? "text-red-400/70 hover:text-red-600 hover:bg-red-50"
                          : "text-emerald-500/70 hover:text-emerald-600 hover:bg-emerald-50"
                      )}
                    >
                      {service.status === "active" ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-outline-variant/10">
          <p className="text-sm text-on-surface-variant">
            Hiển thị <span className="font-semibold text-on-surface">{filteredSorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSorted.length)}</span> trong số <span className="font-semibold text-on-surface">{filteredSorted.length}</span> dịch vụ
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border-outline-variant/30 disabled:opacity-40">
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1
              return (
                <Button key={page} size="icon-sm" variant={currentPage === page ? "default" : "ghost"} className={cn("rounded-lg text-xs font-semibold min-w-[30px]", currentPage === page ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low")} onClick={() => setCurrentPage(page)}>
                  {page}
                </Button>
              )
            })}
            <Button variant="outline" size="icon-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border-outline-variant/30 disabled:opacity-40">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!lockTarget}
        onClose={() => setLockTarget(null)}
        onConfirm={handleToggleLock}
        title={lockTarget?.status === "active" ? "Khóa dịch vụ?" : "Mở khóa dịch vụ?"}
        description={
          lockTarget
            ? `Bạn có chắc chắn muốn ${lockTarget.status === "active" ? "khóa" : "mở khóa"} dịch vụ "${lockTarget.name}"? ${lockTarget.status === "active" ? "Dịch vụ sẽ không thể chọn trong lịch khám mới." : "Dịch vụ sẽ được kích hoạt trở lại."}`
            : ""
        }
        confirmText={lockTarget?.status === "active" ? "Khóa dịch vụ" : "Mở khóa"}
        destructive={lockTarget?.status === "active"}
      />
    </>
  )
}
