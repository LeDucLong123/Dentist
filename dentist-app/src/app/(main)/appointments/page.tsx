"use client"

import { useState, useMemo, useRef } from "react"
import Link from "next/link"
import {
  CalendarDays,
  CalendarRange,
  Plus,
  ArrowRightLeft,
  Sparkles,
  ChevronRight,
  Search,
  X,
  Filter,
  Stethoscope,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Topbar } from "@/components/topbar"
import { cn } from "@/lib/utils"

import { 
  APPOINTMENTS, 
  DOCTORS, 
  getAppointmentDetail 
} from "@/lib/appointments-data"
import { toDateKey } from "@/lib/date-utils"

import { DayView } from "./_components/day-view"
import { MonthView } from "./_components/month-view"

export default function AppointmentsPage() {
  const today = new Date()
  const [appointments, setAppointments] = useState(() => APPOINTMENTS)
  const [viewMode, setViewMode] = useState<"day" | "month">("day")
  const [selectedDate, setSelectedDate] = useState(today)
  const [calMonth, setCalMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })
  
  // Filters
  const [doctorFilter, setDoctorFilter] = useState("Tất cả bác sĩ")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [searchInput, setSearchInput] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCheckIn = (id: string) => {
    // 1. Mutate global reference
    const globalApt = APPOINTMENTS.find(a => a.id === id)
    if (globalApt) {
      globalApt.status = "checked_in"
    }
    // 2. Trigger react re-render
    setAppointments([...APPOINTMENTS])
  }

  // Doctor list derived from central DOCTORS array
  const doctorNames = useMemo(() => {
    return ["Tất cả bác sĩ", ...DOCTORS.map(d => d.name)]
  }, [])

  // Doctor suggestions for the filter combobox
  const doctorSuggestions = useMemo(() =>
    doctorNames.filter(
      (d) => d !== "Tất cả bác sĩ" && d.toLowerCase().includes(searchInput.toLowerCase())
    ),
    [searchInput, doctorNames]
  )

  // Status text mapping for filtering logic
  const statusLabels: Record<string, string> = {
    confirmed: "Đã xác nhận",
    scheduled: "Chờ xác nhận",
    checked_in: "Đã tiếp đón",
    examining: "Đang khám",
    rescheduled: "Yêu cầu đổi",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  }

  // Appointments for selected day (day view)
  const dayAppointments = useMemo(() => {
    const key = toDateKey(selectedDate)
    return appointments.filter((a) => {
      if (a.date !== key) return false
      if (doctorFilter !== "Tất cả bác sĩ" && a.doctor !== doctorFilter) return false
      
      const aptLabel = statusLabels[a.status] || "Chờ xác nhận"
      if (statusFilter !== "Tất cả" && aptLabel !== statusFilter) return false
      
      return true
    })
  }, [appointments, selectedDate, doctorFilter, statusFilter])

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

            <Link href="/appointments/shifts">
              <Button 
                variant="outline" 
                className="h-9 px-4 rounded-xl border-outline-variant/30 text-on-surface-variant text-sm font-semibold gap-2 hover:text-primary hover:border-primary/30"
              >
                <CalendarRange className="size-4 text-emerald-500" />
                Lịch trực bác sĩ
              </Button>
            </Link>
            
            <Link href="/appointments/requests">
              <Button 
                variant="outline" 
                className="h-9 px-4 rounded-xl border-outline-variant/30 text-on-surface-variant text-sm font-semibold gap-2 hover:text-primary hover:border-primary/30"
              >
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
          <Popover 
            open={searchOpen} 
            onOpenChange={(open) => {
              setSearchOpen(open)
              // Reset search state on close if no doctor filter was chosen
              if (!open && doctorFilter === "Tất cả bác sĩ") setSearchInput("")
            }}
          >
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
            
            <PopoverContent 
              className="w-[300px] p-2 rounded-xl shadow-lg border-outline-variant/20 bg-white" 
              align="start" 
              sideOffset={8}
            >
              <div className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider px-2 py-1.5">
                Bác sĩ
              </div>
              {doctorSuggestions.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-on-surface-variant/60 italic">
                  Không tìm thấy bác sĩ
                </div>
              )}
              {doctorSuggestions.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSearchInput(d)
                    setDoctorFilter(d)
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

          {/* Status filters */}
          <div className="flex gap-1.5 flex-wrap">
            {["Tất cả", "Chờ xác nhận", "Đã tiếp đón", "Đang khám", "Đã xác nhận", "Yêu cầu đổi", "Hoàn thành", "Đã hủy"].map((s) => (
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

        {/* ── Main View Panel ── */}
        {viewMode === "day" ? (
          <DayView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            appointments={appointments}
            dayAppointments={dayAppointments}
            handleCheckIn={handleCheckIn}
          />
        ) : (
          <MonthView
            calMonth={calMonth}
            setCalMonth={setCalMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setViewMode={setViewMode}
            appointments={appointments}
          />
        )}
      </div>
    </>
  )
}
