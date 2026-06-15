"use client"

import { use, useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Topbar } from "@/components/topbar"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { fmtCurrency } from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import {
  ChevronRight,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  Search,
  ExternalLink,
  Award,
  AlertCircle,
} from "lucide-react"

export default function DoctorHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [doctor, setDoctor] = useState<any | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")
        
        // 1. Fetch doctor profile
        const docRes = await fetch(`/api/doctors/${id}`)
        if (!docRes.ok) throw new Error("Không thể tải thông tin bác sĩ từ cơ sở dữ liệu.")
        const docData = await docRes.json()
        setDoctor(docData)
        
        // 2. Fetch appointments
        const aptRes = await fetch("/api/appointments")
        if (!aptRes.ok) throw new Error("Không thể tải danh sách lịch khám từ cơ sở dữ liệu.")
        const aptData = await aptRes.json()
        setAppointments(aptData)
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu lịch sử.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Get appointments conducted by this doctor
  const doctorAppointments = useMemo(() => {
    if (!doctor) return []
    return appointments.filter((a) => a.doctorId === doctor.id)
  }, [doctor, appointments])

  // Filtered history list
  const filteredAppointments = useMemo(() => {
    return doctorAppointments.filter((apt) => {
      const matchesSearch = 
        apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" ? true : apt.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [doctorAppointments, searchQuery, statusFilter])

  if (loading) {
    return (
      <>
        <Topbar searchPlaceholder="Tìm kiếm ca khám..." />
        <div className="p-8 text-center text-on-surface-variant flex flex-col items-center justify-center min-h-[300px]">
          <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
          <p className="font-medium text-on-surface-variant">Đang tải lịch sử khám...</p>
        </div>
      </>
    )
  }

  if (error || !doctor) {
    return (
      <>
        <Topbar />
        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-[350px] space-y-4">
          <AlertCircle className="size-12 text-red-500" />
          <p className="text-sm font-bold text-slate-800">{error || `Không tìm thấy bác sĩ #${id}`}</p>
          <Link href="/doctors">
            <Button variant="outline" className="rounded-xl border-outline-variant/30 text-xs font-semibold">
              Quay lại danh sách
            </Button>
          </Link>
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
  const numericId = parseInt(doctor.id.slice(-6), 16)
  const gradientIndex = isNaN(numericId) ? 0 : numericId % AVATAR_GRADIENTS.length
  const gradient = AVATAR_GRADIENTS[gradientIndex]
  const initials = (doctor.name as string).replace(/^(BS\.|ThS\.|TS\.|GS\.)?\s*/i, "").trim().split(" ").slice(-2).map((p: string) => p[0]).join("").toUpperCase()

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm ca khám..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50">
          <Link href="/doctors" className="hover:text-primary transition-colors">Bác sĩ</Link>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Lịch sử ca khám</span>
        </nav>

        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link href="/doctors" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="size-4" /> Quay lại danh sách
          </Link>
        </div>

        {/* Doctor Summary Profile Card */}
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
          <div className={`relative size-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
            <span className="text-white font-bold text-2xl tracking-wide">{initials}</span>
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-2xl font-extrabold text-blue-900 leading-tight">{doctor.name}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/5 text-primary w-fit mx-auto md:mx-0">
                <Award className="size-3" /> {doctor.specialty}
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-x-6 gap-y-1.5 text-sm text-on-surface-variant/80">
              <span className="flex items-center gap-1 justify-center md:justify-start">
                <Mail className="size-4 text-primary/60 shrink-0" /> {doctor.email}
              </span>
              <span className="flex items-center gap-1 justify-center md:justify-start">
                <Phone className="size-4 text-primary/60 shrink-0" /> {doctor.phone}
              </span>
              <span className="flex items-center gap-1 justify-center md:justify-start">
                <Award className="size-4 text-primary/60 shrink-0" /> Trình độ: {doctor.degree}
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
                <h2 className="font-bold text-base text-on-surface">Lịch sử khám & điều trị cho bệnh nhân</h2>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant/60">
                Tổng cộng {filteredAppointments.length} ca khám
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
                  placeholder="Tìm theo bệnh nhân, dịch vụ, mã lịch..."
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
                  <th className="px-6 py-4">Mã ca</th>
                  <th className="px-6 py-4">Thời gian khám</th>
                  <th className="px-6 py-4">Bệnh nhân</th>
                  <th className="px-6 py-4">Dịch vụ điều trị</th>
                  <th className="px-6 py-4">Phòng khám</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thành tiền</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-on-surface-variant/40 italic">
                      Chưa ghi nhận ca khám bệnh nhân nào.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const total = apt.price - apt.discount
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-on-surface-variant">{apt.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-on-surface">
                            {new Date(apt.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </p>
                          <p className="text-[10px] text-on-surface-variant/60 font-mono mt-0.5">{apt.start} - {apt.end}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-on-surface">{apt.patient}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-primary">{apt.service}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs text-on-surface font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                            <MapPin className="size-3 text-primary" /> {apt.room}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={apt.status} variant="icon" />
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-bold text-on-surface">
                          {fmtCurrency(total)}
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
