"use client"

import { use, useState, useMemo } from "react"
import Link from "next/link"
import { Topbar } from "@/components/topbar"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { APPOINTMENTS, getAppointmentDetail } from "@/lib/appointments-data"
import { initialUsers } from "@/app/(main)/users/page"
import { fmtCurrency } from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import {
  ChevronRight,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  ClipboardList,
  Search,
  ExternalLink,
} from "lucide-react"

export default function UserHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  // Find user details
  const user = useMemo(() => {
    return initialUsers.find((u) => u.id === id)
  }, [id])

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Map demo user name to mock appointments if they don't have matching records
  const searchName = useMemo(() => {
    if (!user) return ""
    if (user.name === "Sarah Jenkins") return "Trần Thị B"
    if (user.name === "Trần Thị Lan") return "Vũ Thị F"
    return user.name
  }, [user])

  // Get appointments for this patient
  const patientAppointments = useMemo(() => {
    if (!user) return []
    return APPOINTMENTS.filter((a) => {
      const isNameMatch = a.patient.toLowerCase().includes(searchName.toLowerCase()) || 
                          searchName.toLowerCase().includes(a.patient.toLowerCase())
      
      const detail = getAppointmentDetail(a.id)
      const isIdMatch = detail.patientId === user.id
      
      return isNameMatch || isIdMatch
    }).map(a => getAppointmentDetail(a.id))
  }, [user, searchName])

  // Filtered history list
  const filteredAppointments = useMemo(() => {
    return patientAppointments.filter((apt) => {
      const matchesSearch = 
        apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" ? true : apt.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [patientAppointments, searchQuery, statusFilter])

  if (!user) {
    return (
      <>
        <Topbar />
        <div className="p-8 text-center text-on-surface-variant">
          Không tìm thấy người dùng #{id}
        </div>
      </>
    )
  }

  const AVATAR_GRADIENTS = [
    "from-violet-500 to-indigo-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
  ]
  const gradient = AVATAR_GRADIENTS[parseInt(user.id) % AVATAR_GRADIENTS.length]
  const initials = user.name.split(" ").slice(-2).map((p) => p[0]).join("").toUpperCase()

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm lịch sử..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50">
          <Link href="/users" className="hover:text-primary transition-colors">Người dùng</Link>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Lịch sử khám</span>
        </nav>

        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link href="/users" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="size-4" /> Quay lại danh sách
          </Link>
        </div>

        {/* User Summary Profile Card */}
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
          <div className={`relative size-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="size-20 rounded-2xl object-cover" />
            ) : (
              <span className="text-white font-bold text-2xl tracking-wide">{initials}</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-2xl font-extrabold text-blue-900 leading-tight">{user.name}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit mx-auto md:mx-0">
                {user.role}
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-x-6 gap-y-1.5 text-sm text-on-surface-variant/80">
              <span className="flex items-center gap-1 justify-center md:justify-start">
                <Mail className="size-4 text-primary/60 shrink-0" /> {user.email}
              </span>
              <span className="flex items-center gap-1 justify-center md:justify-start">
                <Phone className="size-4 text-primary/60 shrink-0" /> {user.role === "Bác sĩ" ? "0901 111 222" : "0912 345 678"}
              </span>
              <span className="flex items-center gap-1 justify-center md:justify-start">
                <Calendar className="size-4 text-primary/60 shrink-0" /> Tham gia: {user.joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          {/* Header & Filters */}
          <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                <h2 className="font-bold text-base text-on-surface">Lịch sử điều trị & được khám</h2>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant/60">
                Tìm thấy {filteredAppointments.length} ca khám
              </span>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              {/* Search bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo dịch vụ, bác sĩ, mã lịch..."
                  className="pl-9 pr-4 py-2 w-full rounded-xl bg-white border border-outline-variant/30 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>

              {/* Status tabs */}
              <div className="flex gap-1.5 flex-wrap w-full sm:w-auto">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "completed", label: "Hoàn thành" },
                  { id: "confirmed", label: "Đã xác nhận" },
                  { id: "scheduled", label: "Chờ xác nhận" },
                  { id: "cancelled", label: "Đã hủy" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                      statusFilter === tab.id
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-slate-50 border border-outline-variant/20 text-on-surface-variant hover:bg-slate-100"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10 text-[10px] font-bold text-on-surface-variant/50 uppercase bg-slate-50/50">
                  <th className="px-6 py-4">Mã</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Bác sĩ phụ trách</th>
                  <th className="px-6 py-4">Dịch vụ</th>
                  <th className="px-6 py-4">Phòng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Chi phí</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-on-surface-variant/40 italic">
                      Chưa có ghi nhận lịch sử khám bệnh.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const total = apt.price - apt.discount
                    const remaining = total - apt.paid
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-on-surface-variant">{apt.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-on-surface">
                            {new Date(apt.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </p>
                          <p className="text-[10px] text-on-surface-variant/60 font-mono mt-0.5">{apt.start} - {apt.end}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-on-surface">{apt.doctor}</p>
                          <p className="text-[10px] text-on-surface-variant/50">{apt.doctorSpecialty}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-primary">{apt.service}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs text-on-surface font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                            <MapPin className="size-3 text-primary" /> {apt.room}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={apt.status} variant="icon" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-xs font-bold text-on-surface">{fmtCurrency(total)}</p>
                          <p className={cn(
                            "text-[9px] font-bold mt-0.5 px-1 rounded inline-block",
                            remaining > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {remaining > 0 ? `Nợ: ${fmtCurrency(remaining)}` : "Đã thanh toán"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/appointments/${apt.id}/detail`}>
                            <Button size="sm" variant="outline" className="h-8 rounded-lg border-outline-variant/30 text-xs font-semibold hover:text-primary hover:border-primary/20 gap-1">
                              Chi tiết <ExternalLink className="size-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
