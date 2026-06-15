"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import Link from "next/link"
import {
  Plus,
  School,
  Phone,
  Mail,
  Edit2,
  Lock,
  LockOpen,
  ChevronRight,
  Stethoscope,
  Users,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Topbar } from "@/components/topbar"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DoctorBreadcrumb } from "./_components/doctor-breadcrumb"

export interface Doctor {
  id: string
  name: string
  role: string
  degree: string
  specialty: string
  phone: string
  email: string
  status: "active" | "locked"
  badge: string
}

export const initialDoctors: Doctor[] = [
  {
    id: "1",
    name: "BS. Phạm Thành Nam",
    role: "Trưởng khoa",
    degree: "Tiến sĩ",
    specialty: "Cấy ghép Implant",
    phone: "0901 234 567",
    email: "nam.pham@serenity.vn",
    status: "active" as const,
    badge: "head",
  },
  {
    id: "2",
    name: "ThS.BS. Nguyễn Minh Thư",
    role: "BS Chính",
    degree: "Thạc sĩ",
    specialty: "Chỉnh nha (Niềng răng)",
    phone: "0932 888 999",
    email: "thu.nguyen@serenity.vn",
    status: "active" as const,
    badge: "senior",
  },
  {
    id: "3",
    name: "BS. Lê Hoàng Vũ",
    role: "BS Phụ",
    degree: "BSCK I",
    specialty: "Nha khoa Tổng quát",
    phone: "0977 111 222",
    email: "vu.le@serenity.vn",
    status: "locked" as const,
    badge: "junior",
  },
  {
    id: "4",
    name: "BS. Trần Mai Anh",
    role: "BS Chính",
    degree: "BSCK II",
    specialty: "Nha khoa Thẩm mỹ",
    phone: "0988 333 444",
    email: "maianh.tran@serenity.vn",
    status: "active" as const,
    badge: "senior",
  },
  {
    id: "5",
    name: "BS. Đỗ Quang Khải",
    role: "BS Phụ",
    degree: "Thạc sĩ",
    specialty: "Nha khoa Trẻ em",
    phone: "0912 555 666",
    email: "khai.do@serenity.vn",
    status: "active" as const,
    badge: "junior",
  },
]



const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
]

function getInitials(name: string) {
  const parts = name.replace(/^(BS\.|ThS\.BS\.|ThS\.|TS\.|GS\.TS\.)?\s*/i, "").trim().split(" ")
  return parts.slice(-2).map((p) => p[0]).join("").toUpperCase()
}

export default function DoctorListPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPageInput, setItemsPerPageInput] = useState("3")
  const [sortKey, setSortKey] = useState("Mới nhất")
  const [lockTarget, setLockTarget] = useState<{ id: string; name: string; status: string } | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/doctors")
      if (!res.ok) throw new Error("Không thể tải danh sách bác sĩ.")
      const data = await res.json()
      setDoctors(data)
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải dữ liệu.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const parsed = JSON.parse(userStr)
        setUserRole(parsed.role)
      }
    } catch {}
    fetchDoctors()
  }, [])

  const itemsPerPage = Math.max(1, parseInt(itemsPerPageInput) || 3)
  const totalPages = Math.max(1, Math.ceil(doctors.length / itemsPerPage))

  const sortedDoctors = [...doctors].sort((a, b) => {
    if (sortKey === "Mới nhất") return b.id.localeCompare(a.id)
    if (sortKey === "Chuyên môn") return a.specialty.localeCompare(b.specialty, "vi")
    if (sortKey === "Tên bác sĩ (A-Z)") return a.name.localeCompare(b.name, "vi")
    if (sortKey === "Bằng cấp") return a.degree.localeCompare(b.degree, "vi")
    return 0
  })

  const paginatedDoctors = sortedDoctors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleLock = async () => {
    if (!lockTarget) return
    const newStatus = lockTarget.status === "active" ? "locked" : "active"
    const actionText = lockTarget.status === "active" ? "khóa" : "mở khóa"

    try {
      const res = await fetch(`/api/users/${lockTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || `Không thể ${actionText} tài khoản bác sĩ.`)
      }

      setDoctors((prev) =>
        prev.map((d) => (d.id === lockTarget.id ? { ...d, status: newStatus } : d))
      )
      toast.success(`Đã ${actionText} tài khoản bác sĩ thành công.`)
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.")
    } finally {
      setLockTarget(null)
    }
  }

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm bác sĩ..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <DoctorBreadcrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-primary/10">
                <Stethoscope className="size-5 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Quản lý Bác sĩ</h1>
            </div>
            <p className="text-sm text-on-surface-variant ml-[44px]">
              Quản lý đội ngũ y bác sĩ chuyên khoa và trình độ chuyên môn.
            </p>
          </div>
          {/* No doctor creation button as requested */}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Tổng bác sĩ", value: doctors.length, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Đang hoạt động", value: doctors.filter(d => d.status === "active").length, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Đã khóa", value: doctors.filter(d => d.status === "locked").length, color: "text-red-600", bg: "bg-red-50" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-4 ${stat.bg} border border-transparent`}>
              <p className="text-xs font-medium text-on-surface-variant/70 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-low/60 backdrop-blur rounded-2xl px-4 py-3 mb-4 border border-outline-variant/10">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Users className="size-4 text-primary/60" />
            <span className="font-medium">Hiển thị</span>
            <Input
              type="number"
              min={1}
              value={itemsPerPageInput}
              onChange={(e) => {
                setItemsPerPageInput(e.target.value)
                setCurrentPage(1)
              }}
              className="h-7 w-14 text-center bg-white border-outline-variant/30 text-sm font-semibold"
            />
            <span className="font-medium">dòng/trang</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="font-medium">Sắp xếp theo:</span>
            <Select value={sortKey} onValueChange={(val) => { if (val) { setSortKey(val); setCurrentPage(1) } }}>
              <SelectTrigger className="h-7 w-[170px] text-xs bg-white border-outline-variant/30 font-semibold text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mới nhất">Mới nhất</SelectItem>
                <SelectItem value="Chuyên môn">Chuyên môn</SelectItem>
                <SelectItem value="Tên bác sĩ (A-Z)">Tên bác sĩ (A-Z)</SelectItem>
                <SelectItem value="Bằng cấp">Bằng cấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl border border-outline-variant/10 px-6 py-16 text-center">
              <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="font-medium text-on-surface-variant">Đang tải danh sách bác sĩ...</p>
            </div>
          ) : paginatedDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-outline-variant/10 px-6 py-16 text-center">
              <Users className="size-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-on-surface-variant">Không tìm thấy bác sĩ nào</p>
            </div>
          ) : paginatedDoctors.map((doctor, index) => {
            const numericId = parseInt(doctor.id.slice(-6), 16)
            const gradientIndex = isNaN(numericId) ? index % AVATAR_GRADIENTS.length : numericId % AVATAR_GRADIENTS.length
            const gradient = AVATAR_GRADIENTS[gradientIndex]
            const initials = getInitials(doctor.name)
            return (
              <div
                key={doctor.id}
                className={cn(
                  "group relative bg-white rounded-2xl border transition-all duration-200",
                  doctor.status === "locked"
                    ? "border-red-100 bg-red-50/30 opacity-80"
                    : "border-outline-variant/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                )}
              >
                <div className="flex items-center gap-5 p-4 pr-5">
                  {/* Avatar */}
                  <div className={`relative size-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
                    <span className="text-white font-bold text-lg tracking-wide">{initials}</span>
                    {doctor.status === "locked" && (
                      <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                        <Lock className="size-2.5 text-white" />
                      </div>
                    )}
                    {doctor.status === "active" && (
                      <div className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-y-2 gap-x-6">
                    {/* Name & role */}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-on-surface truncate">{doctor.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                          <School className="size-3 text-secondary shrink-0" />
                          {doctor.degree}
                        </span>
                        <span className="text-[11px] font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full">
                          {doctor.specialty}
                        </span>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50 hidden lg:block">Liên hệ</p>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Phone className="size-3 shrink-0 text-primary/50" />
                        <span>{doctor.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Mail className="size-3 shrink-0 text-primary/50" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center lg:justify-end">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                        doctor.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      )}>
                        <span className={cn("size-1.5 rounded-full", doctor.status === "active" ? "bg-emerald-400" : "bg-red-400")} />
                        {doctor.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link 
                      href={`/doctors/${doctor.id}/history`}
                      title="Xem lịch sử đi khám"
                    >
                      <Button variant="ghost" size="icon-sm" className="text-violet-600 hover:text-violet-850 hover:bg-violet-50 rounded-xl">
                        <History className="size-4" />
                      </Button>
                    </Link>
                    {userRole !== "doctor" && userRole !== "receptionist" && (
                      <>
                        <Link href={`/doctors/${doctor.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-primary/60 hover:text-primary hover:bg-primary/10 rounded-xl"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setLockTarget({ id: doctor.id, name: doctor.name, status: doctor.status })}
                          className={cn(
                            "rounded-xl",
                            doctor.status === "active"
                              ? "text-red-400/70 hover:text-red-600 hover:bg-red-50"
                              : "text-emerald-500/70 hover:text-emerald-600 hover:bg-emerald-50"
                          )}
                        >
                          {doctor.status === "active" ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-outline-variant/10">
          <p className="text-sm text-on-surface-variant">
            Hiển thị <span className="font-semibold text-on-surface">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, doctors.length)}</span> trong số <span className="font-semibold text-on-surface">{doctors.length}</span> bác sĩ
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border-outline-variant/30 disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1
              return (
                <Button
                  key={page}
                  size="icon-sm"
                  variant={currentPage === page ? "default" : "ghost"}
                  className={cn(
                    "rounded-lg text-xs font-semibold min-w-[30px]",
                    currentPage === page ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low"
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border-outline-variant/30 disabled:opacity-40"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!lockTarget}
        onClose={() => setLockTarget(null)}
        onConfirm={toggleLock}
        title={lockTarget?.status === "active" ? "Xác nhận khóa" : "Xác nhận mở khóa"}
        description={
          lockTarget
            ? `Bạn có chắc chắn muốn ${lockTarget.status === "active" ? "khóa" : "mở khóa"} bác sĩ ${lockTarget.name} không? Hành động này sẽ ${lockTarget.status === "active" ? "tạm ngưng quyền truy cập" : "khôi phục quyền truy cập"} của bác sĩ vào hệ thống.`
            : ""
        }
        confirmText={lockTarget?.status === "active" ? "Khóa" : "Mở khóa"}
        destructive={lockTarget?.status === "active"}
      />
    </>
  )
}
