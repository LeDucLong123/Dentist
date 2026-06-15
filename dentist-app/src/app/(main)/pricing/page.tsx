"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  Edit2,
  EyeOff,
  Eye,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Calendar,
  Tag,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Topbar } from "@/components/topbar"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type PricingStatus = "applied" | "not_applied"

interface PricingItem {
  id: string
  serviceName: string
  priceType: string
  standardPrice: number
  validFrom: string
  validTo: string
  status: PricingStatus
}

const initialPricing: PricingItem[] = [
  {
    id: "BG001",
    serviceName: "Cấy ghép Implant Osstem",
    priceType: "VIP",
    standardPrice: 18000000,
    validFrom: "2026-05-01",
    validTo: "2026-12-31",
    status: "applied",
  },
  {
    id: "BG002",
    serviceName: "Cấy ghép Implant Osstem",
    priceType: "Thường",
    standardPrice: 15000000,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    status: "applied",
  },
  {
    id: "BG003",
    serviceName: "Chỉnh nha mắc cài sứ",
    priceType: "Khuyến mãi",
    standardPrice: 40000000,
    validFrom: "2026-05-15",
    validTo: "2026-06-15",
    status: "applied",
  },
  {
    id: "BG004",
    serviceName: "Tẩy trắng răng Laser",
    priceType: "Thường",
    standardPrice: 2500000,
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    status: "not_applied",
  },
  {
    id: "BG005",
    serviceName: "Nhổ răng khôn",
    priceType: "Thường",
    standardPrice: 1500000,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    status: "applied",
  },
]

const PRICE_TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "VIP":        { bg: "bg-amber-50 border border-amber-200",   text: "text-amber-700",   dot: "bg-amber-400" },
  "Thường":     { bg: "bg-slate-50 border border-slate-200",   text: "text-slate-600",    dot: "bg-slate-400" },
  "Khuyến mãi": { bg: "bg-rose-50 border border-rose-200",    text: "text-rose-700",     dot: "bg-rose-400" },
}

const ICON_GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-600",
  "from-violet-500 to-indigo-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
]

const FILTER_OPTIONS = ["Tất cả", "Đang áp dụng", "Ngừng áp dụng"]
const SORT_OPTIONS = ["Mới nhất", "Tên dịch vụ", "Giá (cao → thấp)", "Giá (thấp → cao)"]

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(price)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Mãi mãi"
  return new Date(dateStr).toLocaleDateString("vi-VN")
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("Tất cả")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState("Mới nhất")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPageInput, setItemsPerPageInput] = useState("3")
  const [lockTarget, setLockTarget] = useState<PricingItem | null>(null)

  const fetchPricing = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/pricing")
      if (!res.ok) throw new Error("Không thể tải danh sách bảng giá.")
      const data = await res.json()
      setPricing(data)
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải dữ liệu bảng giá.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const parsed = JSON.parse(userStr)
        if (parsed.role === "doctor" || parsed.role === "receptionist") {
          window.location.replace("/appointments")
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchPricing()
  }, [])

  const stats = useMemo(() => ({
    total: pricing.length,
    applied: pricing.filter((p) => p.status === "applied").length,
    notApplied: pricing.filter((p) => p.status === "not_applied").length,
  }), [pricing])

  const filteredSorted = useMemo(() => {
    let result = [...pricing]
    if (activeFilter === "Đang áp dụng") result = result.filter((p) => p.status === "applied")
    if (activeFilter === "Ngừng áp dụng") result = result.filter((p) => p.status === "not_applied")
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => p.serviceName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      if (sortKey === "Mới nhất") return b.id.localeCompare(a.id)
      if (sortKey === "Tên dịch vụ") return a.serviceName.localeCompare(b.serviceName, "vi")
      if (sortKey === "Giá (cao → thấp)") return b.standardPrice - a.standardPrice
      if (sortKey === "Giá (thấp → cao)") return a.standardPrice - b.standardPrice
      return 0
    })
    return result
  }, [pricing, activeFilter, searchQuery, sortKey])

  const itemsPerPage = Math.max(1, parseInt(itemsPerPageInput) || 3)
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / itemsPerPage))
  const paginated = filteredSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleToggle = async () => {
    if (!lockTarget) return
    const newStatus = lockTarget.status === "applied" ? "not_applied" : "applied"
    const actionText = lockTarget.status === "applied" ? "ngừng áp dụng" : "kích hoạt"

    try {
      const res = await fetch(`/api/pricing/${lockTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `Không thể ${actionText} bảng giá.`)

      setPricing((prev) =>
        prev.map((p) => p.id === lockTarget.id ? { ...p, status: newStatus } : p)
      )
      toast.success(`Đã ${actionText} bảng giá "${lockTarget.priceType}" – ${lockTarget.serviceName} thành công.`)
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.")
    } finally {
      setLockTarget(null)
    }
  }

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm bảng giá..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50 mb-6">
          <span>Cấu hình</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Bảng giá</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-primary/10">
                <Banknote className="size-5 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Quản lý Bảng giá</h1>
            </div>
            <p className="text-sm text-on-surface-variant ml-[44px]">
              Thiết lập và quản lý mức giá cho các dịch vụ nha khoa.
            </p>
          </div>
          <Link href="/pricing/new">
            <Button className="bg-primary text-on-primary h-10 px-5 shadow-md shadow-primary/25 hover:shadow-primary/40 hover:brightness-105 transition-all font-semibold gap-2 shrink-0">
              <Plus className="size-4" />
              Thêm bảng giá
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Tổng bảng giá",   value: stats.total,      color: "text-blue-700",    bg: "bg-blue-50" },
            { label: "Đang áp dụng",    value: stats.applied,    color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Ngừng áp dụng",   value: stats.notApplied, color: "text-red-600",     bg: "bg-red-50" },
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
              <Banknote className="size-4 text-primary/60" />
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
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => { setActiveFilter(f); setCurrentPage(1) }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    activeFilter === f
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-white border border-outline-variant/30 text-on-surface-variant hover:border-primary/30 hover:text-primary"
                  )}
                >
                  {f}
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
              <SelectTrigger className="h-7 w-[160px] text-xs bg-white border-outline-variant/30 font-semibold text-primary">
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
          {loading ? (
            <div className="bg-white rounded-2xl border border-outline-variant/10 px-6 py-16 text-center">
              <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="font-medium text-on-surface-variant">Đang tải danh sách bảng giá...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="bg-white rounded-2xl border border-outline-variant/10 px-6 py-16 text-center">
              <Banknote className="size-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-on-surface-variant">Không tìm thấy bảng giá nào</p>
              <p className="text-sm opacity-60 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : paginated.map((item) => {
            const typeStyle = PRICE_TYPE_STYLES[item.priceType] ?? PRICE_TYPE_STYLES["Thường"]
            const gradient = ICON_GRADIENTS[parseInt(item.id.replace("BG", "")) % ICON_GRADIENTS.length]
            return (
              <div
                key={item.id}
                className={cn(
                  "group relative bg-white rounded-2xl border transition-all duration-200",
                  item.status === "not_applied"
                    ? "border-red-100 bg-red-50/30 opacity-80"
                    : "border-outline-variant/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                )}
              >
                <div className="flex items-center gap-5 p-4 pr-5">
                  {/* Icon */}
                  <div className={`relative size-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
                    <Banknote className="size-6 text-white" />
                    {item.status === "not_applied" && (
                      <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                        <EyeOff className="size-2.5 text-white" />
                      </div>
                    )}
                    {item.status === "applied" && (
                      <div className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-4 gap-y-2 gap-x-6">
                    {/* Name & type */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", typeStyle.bg, typeStyle.text)}>
                          <span className={cn("size-1.5 rounded-full", typeStyle.dot)} />
                          {item.priceType}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-on-surface truncate">{item.serviceName}</h3>
                      <span className="text-[11px] text-on-surface-variant/60 font-mono">{item.id}</span>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col justify-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50 hidden lg:block">Giá niêm yết</p>
                      <p className="text-base font-extrabold text-blue-900">{formatPrice(item.standardPrice)}</p>
                    </div>

                    {/* Date range */}
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50 hidden lg:block">Thời gian</p>
                      <div className="text-xs text-on-surface-variant">
                        <span className="font-medium">Từ: </span>{formatDate(item.validFrom)}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        <span className="font-medium">Đến: </span>{formatDate(item.validTo)}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center lg:justify-end">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                        item.status === "applied"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      )}>
                        <span className={cn("size-1.5 rounded-full", item.status === "applied" ? "bg-emerald-400" : "bg-red-400")} />
                        {item.status === "applied" ? "Đang áp dụng" : "Ngừng áp dụng"}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/pricing/${item.id}/edit`}>
                      <Button variant="ghost" size="icon-sm" className="text-primary/60 hover:text-primary hover:bg-primary/10 rounded-xl">
                        <Edit2 className="size-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setLockTarget(item)}
                      className={cn(
                        "rounded-xl",
                        item.status === "applied"
                          ? "text-red-400/70 hover:text-red-600 hover:bg-red-50"
                          : "text-emerald-500/70 hover:text-emerald-600 hover:bg-emerald-50"
                      )}
                    >
                      {item.status === "applied" ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
            Hiển thị <span className="font-semibold text-on-surface">{filteredSorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSorted.length)}</span> trong số <span className="font-semibold text-on-surface">{filteredSorted.length}</span> bảng giá
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
        onConfirm={handleToggle}
        title={lockTarget?.status === "applied" ? "Ngừng áp dụng bảng giá?" : "Kích hoạt bảng giá?"}
        description={
          lockTarget
            ? `Bạn có chắc chắn muốn ${lockTarget.status === "applied" ? "ngừng áp dụng" : "kích hoạt"} bảng giá "${lockTarget.priceType}" cho dịch vụ "${lockTarget.serviceName}"?`
            : ""
        }
        confirmText={lockTarget?.status === "applied" ? "Ngừng áp dụng" : "Kích hoạt"}
        destructive={lockTarget?.status === "applied"}
      />
    </>
  )
}
