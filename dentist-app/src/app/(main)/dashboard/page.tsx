"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Topbar } from "@/components/topbar"
import { APPOINTMENTS } from "@/lib/appointments-data"
import { cn } from "@/lib/utils"
import {
  Users, Stethoscope, CalendarCheck, TrendingUp, TrendingDown,
  ArrowRight, Clock, CheckCircle2, AlertCircle, ArrowRightLeft,
  BadgeCheck, XCircle, Activity, DollarSign, Star, ChevronRight,
  BarChart2,
} from "lucide-react"

// ─── Mock data ───────────────────────────────────────────────────────────────

const REVENUE_MONTHS = [
  { month: "T1", value: 42 }, { month: "T2", value: 58 }, { month: "T3", value: 51 },
  { month: "T4", value: 75 }, { month: "T5", value: 89 }, { month: "T6", value: 66 },
  { month: "T7", value: 95 }, { month: "T8", value: 82 }, { month: "T9", value: 110 },
  { month: "T10", value: 98 }, { month: "T11", value: 120 }, { month: "T12", value: 135 },
]
const MAX_REV = Math.max(...REVENUE_MONTHS.map(m => m.value))

const TOP_DOCTORS = [
  { name: "BS. Julian Pierce",   specialty: "Cấy ghép Implant",   patients: 142, rating: 4.9, avatar: "JP" },
  { name: "BS. Emily Thorne",    specialty: "Chỉnh nha",           patients: 118, rating: 4.8, avatar: "ET" },
  { name: "BS. Phạm Quốc Dũng", specialty: "Phẫu thuật răng",     patients: 97,  rating: 4.7, avatar: "PD" },
  { name: "BS. Nguyễn Thị Lan", specialty: "Thẩm mỹ nha khoa",   patients: 85,  rating: 4.6, avatar: "NL" },
]

const TOP_SERVICES = [
  { name: "Cấy ghép Implant",    count: 48, pct: 32, color: "bg-primary" },
  { name: "Chỉnh nha mắc cài",  count: 35, pct: 23, color: "bg-violet-500" },
  { name: "Bọc răng sứ",        count: 28, pct: 19, color: "bg-emerald-500" },
  { name: "Tẩy trắng răng",     count: 22, pct: 15, color: "bg-amber-500" },
  { name: "Nhổ răng khôn",      count: 17, pct: 11, color: "bg-red-400" },
]

const RECENT_ACTIVITY = [
  { time: "08:12", desc: "Lịch khám LK001 được xác nhận", type: "success" },
  { time: "08:45", desc: "Bệnh nhân Trần Thị B yêu cầu đổi lịch", type: "warn" },
  { time: "09:30", desc: "Hóa đơn INV-0042 thanh toán đủ", type: "success" },
  { time: "10:15", desc: "Hồ sơ bác sĩ mới được thêm vào hệ thống", type: "info" },
  { time: "11:00", desc: "Lịch khám LK010 bị hủy bởi bệnh nhân", type: "error" },
  { time: "13:20", desc: "Bảng giá tháng 6/2026 được kích hoạt", type: "info" },
]

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  confirmed:   { label: "Đã xác nhận", color: "text-emerald-600 bg-emerald-50",  icon: CheckCircle2 },
  scheduled:   { label: "Chờ xác nhận", color: "text-blue-600 bg-blue-50",       icon: AlertCircle },
  rescheduled: { label: "Yêu cầu đổi", color: "text-amber-600 bg-amber-50",      icon: ArrowRightLeft },
  completed:   { label: "Hoàn thành",   color: "text-slate-600 bg-slate-100",     icon: BadgeCheck },
  cancelled:   { label: "Đã hủy",       color: "text-red-600 bg-red-50",          icon: XCircle },
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n)
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, trend, trendUp, gradient }: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  trend: string
  trendUp: boolean
  gradient: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("size-11 rounded-2xl flex items-center justify-center", gradient)}>
          <Icon className="size-5 text-white" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
        )}>
          {trendUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
      </div>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayApts = APPOINTMENTS.filter(a => a.date === todayStr)
  const confirmedToday = todayApts.filter(a => a.status === "confirmed").length
  const pendingToday = todayApts.filter(a => a.status === "scheduled").length

  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <Topbar />
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-7">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="size-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Tổng quan hệ thống</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <Link href="/appointments/new">
            <button className="flex items-center gap-2 h-10 px-5 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all">
              Đặt lịch mới <ArrowRight className="size-4" />
            </button>
          </Link>
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={CalendarCheck} label="Lịch khám hôm nay" value={`${todayApts.length}`}
            sub={`${confirmedToday} xác nhận · ${pendingToday} chờ`}
            trend="+12%" trendUp gradient="bg-gradient-to-br from-primary to-blue-400"
          />
          <KpiCard
            icon={Users} label="Bệnh nhân tháng này" value="324"
            sub="So với 298 tháng trước"
            trend="+8.7%" trendUp gradient="bg-gradient-to-br from-violet-500 to-purple-400"
          />
          <KpiCard
            icon={DollarSign} label="Doanh thu tháng" value="128.5M"
            sub="Mục tiêu: 150M"
            trend="+5.2%" trendUp gradient="bg-gradient-to-br from-emerald-500 to-teal-400"
          />
          <KpiCard
            icon={Activity} label="Tỉ lệ hoàn thành" value="94.2%"
            sub="Tỉ lệ hủy: 2.1%"
            trend="-0.3%" trendUp={false} gradient="bg-gradient-to-br from-amber-500 to-orange-400"
          />
        </div>

        {/* ── Main grid: Chart + Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Revenue bar chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-sm text-slate-900">Doanh thu theo tháng</h2>
                <p className="text-xs text-slate-500 mt-0.5">Đơn vị: triệu VND · Năm 2026</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <TrendingUp className="size-3" /> +18.3% YoY
              </div>
            </div>
            <div className="flex items-end gap-2 h-44">
              {REVENUE_MONTHS.map((m, i) => {
                const isThisMonth = i === new Date().getMonth()
                const pct = (m.value / MAX_REV) * 100
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.value}M
                    </span>
                    <div className="w-full flex items-end" style={{ height: "128px" }}>
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all duration-500",
                          isThisMonth
                            ? "bg-gradient-to-t from-primary to-blue-400"
                            : "bg-slate-100 group-hover:bg-primary/20"
                        )}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold",
                      isThisMonth ? "text-primary" : "text-slate-400"
                    )}>{m.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm text-slate-900">Hoạt động gần đây</h2>
              <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Xem tất cả</button>
            </div>
            <div className="flex-1 space-y-0 divide-y divide-slate-50">
              {RECENT_ACTIVITY.map((a, i) => {
                const colors: Record<string, string> = {
                  success: "bg-emerald-400",
                  warn: "bg-amber-400",
                  info: "bg-blue-400",
                  error: "bg-red-400",
                }
                return (
                  <div key={i} className="flex items-start gap-3 py-3">
                    <div className={cn("size-2 rounded-full shrink-0 mt-1.5", colors[a.type])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-snug">{a.desc}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{a.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom grid: Today apts + top doctors + services ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Today's appointments */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <h2 className="font-bold text-sm text-slate-900">Lịch khám hôm nay</h2>
              </div>
              <Link href="/appointments" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5">
                Xem lịch <ChevronRight className="size-3" />
              </Link>
            </div>
            {todayApts.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">Không có lịch khám hôm nay</p>
            ) : (
              <div className="space-y-2">
                {todayApts.slice(0, 5).map((a) => {
                  const s = STATUS_MAP[a.status] ?? STATUS_MAP.scheduled
                  const Icon = s.icon
                  return (
                    <Link key={a.id} href={`/appointments/${a.id}/detail`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="size-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{a.patient}</p>
                        <p className="text-[10px] text-slate-500 truncate">{a.start} · {a.service}</p>
                      </div>
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0", s.color)}>
                        <Icon className="size-2.5" />
                        <span className="hidden sm:inline">{s.label}</span>
                      </span>
                    </Link>
                  )
                })}
                {todayApts.length > 5 && (
                  <p className="text-center text-xs font-semibold text-primary pt-1">+{todayApts.length - 5} thêm</p>
                )}
              </div>
            )}
          </div>

          {/* Top doctors */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-4 text-violet-500" />
                <h2 className="font-bold text-sm text-slate-900">Bác sĩ nổi bật</h2>
              </div>
              <Link href="/doctors" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5">
                Tất cả <ChevronRight className="size-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {TOP_DOCTORS.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-300 w-4 shrink-0">#{i + 1}</span>
                  <div className="size-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white">{d.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{d.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{d.specialty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-800">{d.patients}</p>
                    <div className="flex items-center gap-0.5 justify-end">
                      <Star className="size-2.5 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] text-slate-500">{d.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top services */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-emerald-500" />
                <h2 className="font-bold text-sm text-slate-900">Dịch vụ phổ biến</h2>
              </div>
              <Link href="/services" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5">
                Tất cả <ChevronRight className="size-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {TOP_SERVICES.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-slate-700 truncate pr-2">{s.name}</p>
                    <span className="text-[11px] font-bold text-slate-500 shrink-0">{s.count} ca</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", s.color)}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 text-right">{s.pct}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
