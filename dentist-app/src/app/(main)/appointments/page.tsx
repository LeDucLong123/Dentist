"use client"

import { useState, useMemo, useRef } from "react"
import Link from "next/link"
import {
  CalendarDays,
  CalendarRange,
  Plus,
  ArrowRightLeft,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  Filter,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Topbar } from "@/components/topbar"
import { cn } from "@/lib/utils"
import { APPOINTMENTS } from "@/lib/appointments-data"

// ─── Doctors filter list ─────────────────────────────────────────────────────

const DOCTORS = [
  "Tất cả bác sĩ",
  "BS. Julian Pierce",
  "BS. Emily Thorne",
  "BS. Phạm Quốc Dũng",
  "BS. Nguyễn Thị Lan",
]

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  confirmed:   { label: "Đã xác nhận",     bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  scheduled:   { label: "Chờ xác nhận",    bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400" },
  rescheduled: { label: "Yêu cầu đổi",     bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400" },
  completed:   { label: "Hoàn thành",       bg: "bg-slate-50",   text: "text-slate-600",   dot: "bg-slate-400" },
  cancelled:   { label: "Đã hủy",           bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400" },
}

function StatusChip({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.scheduled
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", s.bg, s.text)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  )
}

// ─── Helper: week grid ────────────────────────────────────────────────────────

function getWeeksInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const weeks: Date[][] = []
  let current = new Date(firstDay)
  // start from Monday
  const dow = (current.getDay() + 6) % 7
  current.setDate(current.getDate() - dow)
  while (current <= lastDay || weeks.length < 5) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
    if (current > lastDay && weeks.length >= 4) break
  }
  return weeks
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
const MONTHS_VN = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"]
const HOUR_LABELS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
const START_HOUR = 7
const PX_PER_MIN = 1.5   // 1 hour = 90px

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}

function parseMin(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

type AptLayout = (typeof APPOINTMENTS)[0] & { col: number; totalCols: number }

function layoutDayApts(apts: typeof APPOINTMENTS): AptLayout[] {
  if (!apts.length) return []
  const sorted = [...apts].sort((a, b) => parseMin(a.start) - parseMin(b.start))
  const result: AptLayout[] = sorted.map(a => ({ ...a, col: 0, totalCols: 1 }))
  // Assign columns
  for (let i = 0; i < result.length; i++) {
    const usedCols = result
      .slice(0, i)
      .filter(r => parseMin(r.start) < parseMin(result[i].end) && parseMin(result[i].start) < parseMin(r.end))
      .map(r => r.col)
    let col = 0
    while (usedCols.includes(col)) col++
    result[i].col = col
  }
  // Determine totalCols for each overlap group
  for (let i = 0; i < result.length; i++) {
    const overlaps = result.filter(r =>
      parseMin(r.start) < parseMin(result[i].end) && parseMin(result[i].start) < parseMin(r.end)
    )
    const maxCol = Math.max(...overlaps.map(r => r.col)) + 1
    overlaps.forEach(r => { r.totalCols = Math.max(r.totalCols, maxCol) })
  }
  return result
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const today = new Date()
  const [viewMode, setViewMode] = useState<"day" | "month">("day")
  const [selectedDate, setSelectedDate] = useState(today)
  const [calMonth, setCalMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [doctorFilter, setDoctorFilter] = useState("Tất cả bác sĩ")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  // searchInput: text đang gõ (chỉ dùng để filter dropdown)
  // doctorFilter: bác sĩ đã được chọn (mới thực sự filter appointments)
  const [searchInput, setSearchInput] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [pickerMonth, setPickerMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })

  // Appointments for selected day (day view)
  const dayAppointments = useMemo(() => {
    const key = toDateKey(selectedDate)
    return APPOINTMENTS.filter((a) => {
      if (a.date !== key) return false
      if (doctorFilter !== "Tất cả bác sĩ" && a.doctor !== doctorFilter) return false
      if (statusFilter !== "Tất cả" && STATUS_MAP[a.status]?.label !== statusFilter) return false
      return true
    })
  }, [selectedDate, doctorFilter, statusFilter])

  // Dropdown suggestions: filter DOCTORS by searchInput
  const doctorSuggestions = useMemo(() =>
    DOCTORS.filter(d => d !== "Tất cả bác sĩ" && d.toLowerCase().includes(searchInput.toLowerCase())),
    [searchInput]
  )

  // Appointments grouped by date for month view
  const monthAptMap = useMemo(() => {
    const map: Record<string, typeof APPOINTMENTS> = {}
    APPOINTMENTS.forEach((a) => {
      if (!map[a.date]) map[a.date] = []
      map[a.date].push(a)
    })
    return map
  }, [])

  const weeks = useMemo(() => getWeeksInMonth(calMonth.year, calMonth.month), [calMonth])

  const formatDay = (d: Date) => d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d) }
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d) }
  const prevMonth = () => setCalMonth(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })
  const nextMonth = () => setCalMonth(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })
  const pickerWeeks = useMemo(() => getWeeksInMonth(pickerMonth.year, pickerMonth.month), [pickerMonth])
  const prevPickerMonth = () => setPickerMonth(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })
  const nextPickerMonth = () => setPickerMonth(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm lịch khám..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50 mb-6">
          <span>Hệ thống</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Lịch khám</span>
        </nav>

        {/* ── Top bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          {/* Left: view toggle */}
          <div className="flex items-center gap-1 bg-surface-container-low/60 border border-outline-variant/10 rounded-2xl p-1">
            <button
              onClick={() => setViewMode("day")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                viewMode === "day"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <CalendarDays className="size-4" />
              Theo ngày
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                viewMode === "month"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <CalendarRange className="size-4" />
              Theo tháng
            </button>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" className="h-9 px-4 rounded-xl border-outline-variant/30 text-on-surface-variant text-sm font-semibold gap-2 hover:text-primary hover:border-primary/30">
              <Sparkles className="size-4 text-amber-500" />
              Tự động sắp xếp
            </Button>
            <Link href="/appointments/requests">
              <Button variant="outline" className="h-9 px-4 rounded-xl border-outline-variant/30 text-on-surface-variant text-sm font-semibold gap-2 hover:text-primary hover:border-primary/30">
                <ArrowRightLeft className="size-4 text-violet-500" />
                Yêu cầu đổi lịch
              </Button>
            </Link>
            <Link href="/appointments/new">
              <Button className="h-9 px-4 rounded-xl bg-primary text-on-primary font-semibold shadow-md shadow-primary/25 hover:brightness-105 gap-2">
                <Plus className="size-4" />
                Đặt lịch mới
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-surface-container-low/60 border border-outline-variant/10 rounded-2xl px-4 py-3 mb-5">
          {/* Combined Search / Combobox */}
          <Popover open={searchOpen} onOpenChange={(open) => {
            setSearchOpen(open)
            // Khi đóng dropdown mà chưa chọn → xóa text tạm
            if (!open && doctorFilter === "Tất cả bác sĩ") setSearchInput("")
          }}>
            <PopoverTrigger
              nativeButton={false}
              render={
                <div className="relative w-64 h-8 bg-white border border-outline-variant/30 rounded-lg focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 overflow-hidden shadow-sm" />
              }
            >
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-outline-variant pointer-events-none" />
              <input
                ref={inputRef}
                value={searchInput}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  // Nếu người dùng xóa chữ sau khi đã chọn bác sĩ → reset filter
                  if (doctorFilter !== "Tất cả bác sĩ") {
                    setDoctorFilter("Tất cả bác sĩ")
                  }
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Tìm theo bác sĩ..."
                className="w-full pl-8 pr-7 py-1.5 h-full bg-transparent text-xs font-medium outline-none"
              />
              {searchInput && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearchInput("")
                    setDoctorFilter("Tất cả bác sĩ")
                    setSearchOpen(false)
                    inputRef.current?.focus()
                  }} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface"
                >
                  <X className="size-3" />
                </button>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-2 rounded-xl shadow-lg border-outline-variant/20 bg-white" align="start" sideOffset={8}>
              <div className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider px-2 py-1.5">
                Bác sĩ
              </div>
              {doctorSuggestions.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-on-surface-variant/60 italic">Không tìm thấy bác sĩ</div>
              )}
              {doctorSuggestions.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSearchInput(d)      // hiện tên bác sĩ trong ô input
                    setDoctorFilter(d)     // bắt đầu filter
                    setSearchOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-left rounded-md transition-colors",
                    doctorFilter === d
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-surface-container-low text-on-surface"
                  )}
                >
                  <Stethoscope className="size-3.5 text-primary/60 shrink-0" />
                  {d}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <div className="w-px h-4 bg-outline-variant/30 hidden sm:block ml-auto" />

          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant/60 shrink-0">
            <Filter className="size-3.5" />
            Trạng thái:
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5 flex-wrap">
            {["Tất cả", "Đã xác nhận", "Chờ xác nhận", "Yêu cầu đổi", "Hoàn thành", "Đã hủy"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  statusFilter === s
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-white border border-outline-variant/30 text-on-surface-variant hover:border-primary/30 hover:text-primary shadow-sm"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ══ DAY VIEW ══════════════════════════════════════════════════════════ */}
        {viewMode === "day" && (
          <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
            {/* Day header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30">
              <button onClick={prevDay} className="size-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors">
                <ChevronLeft className="size-4" />
              </button>

              {/* Date picker trigger */}
              <Popover open={datePickerOpen} onOpenChange={(o) => {
                setDatePickerOpen(o)
                if (o) setPickerMonth({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() })
              }}>
                <PopoverTrigger
                  render={
                    <button className="text-center group cursor-pointer px-3 py-1 rounded-xl hover:bg-surface-container-low transition-colors" />
                  }
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    <span className="text-sm font-bold text-on-surface capitalize group-hover:text-primary transition-colors">{formatDay(selectedDate)}</span>
                    <CalendarDays className="size-3.5 text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{dayAppointments.length} lịch khám</p>
                </PopoverTrigger>

                <PopoverContent className="w-72 p-3 rounded-2xl shadow-xl border border-outline-variant/15 bg-white" align="center" sideOffset={8}>
                  {/* Picker header */}
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={prevPickerMonth} className="size-7 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors">
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <span className="text-xs font-bold text-on-surface">{MONTHS_VN[pickerMonth.month]} {pickerMonth.year}</span>
                    <button onClick={nextPickerMonth} className="size-7 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors">
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>

                  {/* Weekday labels */}
                  <div className="grid grid-cols-7 mb-1">
                    {WEEKDAYS.map((wd) => (
                      <div key={wd} className="text-center text-[9px] font-bold text-on-surface-variant/40 uppercase py-1">{wd}</div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="space-y-0.5">
                    {pickerWeeks.map((week, wi) => (
                      <div key={wi} className="grid grid-cols-7">
                        {week.map((day, di) => {
                          const key = toDateKey(day)
                          const isToday = key === toDateKey(today)
                          const isSelected = key === toDateKey(selectedDate)
                          const isCurrentMonth = day.getMonth() === pickerMonth.month
                          const hasApt = !!monthAptMap[key]?.length
                          return (
                            <button
                              key={di}
                              onClick={() => {
                                setSelectedDate(new Date(day))
                                setDatePickerOpen(false)
                              }}
                              className={cn(
                                "relative flex flex-col items-center justify-center h-8 w-full rounded-lg text-xs font-semibold transition-all",
                                !isCurrentMonth && "opacity-30",
                                isSelected && "bg-primary text-on-primary shadow-sm",
                                !isSelected && isToday && "border border-primary text-primary",
                                !isSelected && !isToday && "hover:bg-surface-container-low text-on-surface",
                              )}
                            >
                              {day.getDate()}
                              {hasApt && !isSelected && (
                                <span className={cn(
                                  "absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full",
                                  isToday ? "bg-primary" : "bg-primary/40"
                                )} />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Today shortcut */}
                  <div className="mt-3 pt-3 border-t border-outline-variant/10">
                    <button
                      onClick={() => { setSelectedDate(new Date(today)); setDatePickerOpen(false) }}
                      className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors py-1"
                    >
                      Hôm nay
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              <button onClick={nextDay} className="size-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors">
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Absolute-positioned timeline */}
            <div className="flex overflow-x-auto">
              {/* Hour labels column */}
              <div className="w-16 shrink-0 border-r border-outline-variant/10 bg-white sticky left-0 z-20">
                {HOUR_LABELS.map((h) => (
                  <div key={h} style={{ height: `${PX_PER_MIN * 60}px` }} className="relative">
                    <span className="absolute -top-2 left-3 text-[10px] font-mono text-on-surface-variant/40 select-none">{h}</span>
                  </div>
                ))}
              </div>
              {/* Events area */}
              {(() => {
                const layoutedApts = layoutDayApts(dayAppointments)
                const maxCols = Math.max(1, ...layoutedApts.map(a => a.totalCols))
                const CARD_W = 200   // px, chiều rộng mỗi thẻ
                const CARD_GAP = 16  // px, khoảng cách giữa các cột (p-4)
                const AREA_PAD = 16  // px, padding trái của vùng events
                return (
                  <div
                    className="relative flex-1"
                    style={{ 
                      height: `${PX_PER_MIN * 60 * HOUR_LABELS.length}px`,
                      minWidth: `max(100%, ${AREA_PAD + maxCols * (CARD_W + CARD_GAP)}px)`
                    }}
                  >
                    {/* Hour grid lines */}
                    {HOUR_LABELS.map((h, i) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-outline-variant/10"
                        style={{ top: `${i * PX_PER_MIN * 60}px` }}
                      />
                    ))}
                    {/* Half-hour dashed lines */}
                    {HOUR_LABELS.map((h, i) => (
                      <div
                        key={`half-${h}`}
                        className="absolute left-0 right-0 border-t border-dashed border-outline-variant/5"
                        style={{ top: `${i * PX_PER_MIN * 60 + PX_PER_MIN * 30}px` }}
                      />
                    ))}
                    {/* Appointments */}
                    {layoutedApts.map((apt) => {
                      const s = STATUS_MAP[apt.status] ?? STATUS_MAP.scheduled
                      const topMin = parseMin(apt.start) - START_HOUR * 60
                      const durMin = Math.max(parseMin(apt.end) - parseMin(apt.start), 15)
                      return (
                        <Link
                          key={apt.id}
                          href={`/appointments/${apt.id}/detail`}
                          className={cn(
                            "absolute rounded-xl border px-3 py-2 overflow-hidden cursor-pointer transition-all hover:shadow-md hover:z-10 block",
                            s.bg
                          )}
                          style={{
                            top: `${topMin * PX_PER_MIN + 2}px`,
                            height: `${durMin * PX_PER_MIN - 4}px`,
                            left: `${AREA_PAD + apt.col * (CARD_W + CARD_GAP)}px`,
                            width: `${CARD_W}px`,
                          }}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <Clock className="size-3 text-on-surface-variant/50 shrink-0" />
                            <span className="text-[10px] font-bold text-on-surface">{apt.start}–{apt.end}</span>
                            <StatusChip status={apt.status} />
                          </div>
                          <p className="text-xs font-bold text-on-surface truncate">{apt.patient}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Stethoscope className="size-3 text-primary/40 shrink-0" />
                            <span className="text-[10px] text-on-surface-variant truncate">{apt.doctor}</span>
                          </div>
                          {durMin >= 45 && (
                            <span className="text-[10px] text-on-surface-variant/60 truncate block mt-0.5">{apt.service}</span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* ══ MONTH VIEW ════════════════════════════════════════════════════════ */}
        {viewMode === "month" && (
          <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
            {/* Month header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30">
              <button onClick={prevMonth} className="size-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors">
                <ChevronLeft className="size-4" />
              </button>
              <p className="text-sm font-bold text-on-surface">
                {MONTHS_VN[calMonth.month]} {calMonth.year}
              </p>
              <button onClick={nextMonth} className="size-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors">
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-outline-variant/10">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="text-center py-2.5 text-xs font-bold text-on-surface-variant/60 uppercase tracking-wide">
                  {wd}
                </div>
              ))}
            </div>

            {/* Week rows */}
            {weeks.map((week, wi) => (
              <div key={wi} className={cn("grid grid-cols-7 border-b border-outline-variant/10 last:border-0 divide-x divide-outline-variant/10", wi % 2 === 1 ? "bg-surface-container-low/20" : "")}>
                {week.map((day, di) => {
                  const key = toDateKey(day)
                  const apts = monthAptMap[key] ?? []
                  const isToday = key === toDateKey(today)
                  const isCurrentMonth = day.getMonth() === calMonth.month
                  const isSelected = key === toDateKey(selectedDate)
                  return (
                    <div
                      key={di}
                      onClick={() => { setSelectedDate(day); setViewMode("day") }}
                      className={cn(
                        "min-h-[90px] p-2 cursor-pointer transition-all hover:bg-primary/5 relative",
                        !isCurrentMonth && "opacity-35",
                        isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20"
                      )}
                    >
                      <div className={cn(
                        "size-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors",
                        isToday ? "bg-primary text-on-primary" : "text-on-surface hover:bg-surface-container-low"
                      )}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {apts.slice(0, 2).map((apt) => {
                          const s = STATUS_MAP[apt.status] ?? STATUS_MAP.scheduled
                          return (
                            <div key={apt.id} className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate", s.bg, s.text)}>
                              {apt.start} {apt.patient.split(" ").slice(-1)[0]}
                            </div>
                          )
                        })}
                        {apts.length > 2 && (
                          <div className="text-[10px] text-primary font-bold pl-1">+{apts.length - 2} thêm</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
