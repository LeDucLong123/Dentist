"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  Clock, 
  User, 
  CreditCard,
  CheckCircle2,
  Stethoscope
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"
import { getAppointmentDetail, APPOINTMENTS } from "@/lib/appointments-data"
import { 
  fmtCurrency, 
  toDateKey, 
  parseMin, 
  layoutDayApts, 
  getWeeksInMonth,
  WEEKDAYS, 
  MONTHS_VN, 
  HOUR_LABELS, 
  START_HOUR, 
  PX_PER_MIN 
} from "@/lib/date-utils"
import { getDutyShiftsForDate } from "@/lib/duty-data"

interface DayViewProps {
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  appointments: typeof APPOINTMENTS
  dayAppointments: typeof APPOINTMENTS
  handleCheckIn?: (id: string, status: string) => void
  weeklyDuty?: any
  doctors?: any[]
}

export function DayView({
  selectedDate,
  setSelectedDate,
  appointments,
  dayAppointments,
  handleCheckIn,
  weeklyDuty,
  doctors
}: DayViewProps) {
  const today = new Date()
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [pickerMonth, setPickerMonth] = useState({ 
    year: selectedDate.getFullYear(), 
    month: selectedDate.getMonth() 
  })
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const parsed = JSON.parse(userStr)
        setUserRole(parsed.role)
      }
    } catch {}
  }, [])

  const dayDutyShifts = useMemo(() => {
    return getDutyShiftsForDate(selectedDate, weeklyDuty, doctors)
  }, [selectedDate, weeklyDuty, doctors])

  // Grouped for calendar dot indicators
  const monthAptMap = useMemo(() => {
    const map: Record<string, typeof APPOINTMENTS> = {}
    appointments.forEach((a) => {
      if (!map[a.date]) map[a.date] = []
      map[a.date].push(a)
    })
    return map
  }, [appointments])

  const pickerWeeks = useMemo(() => 
    getWeeksInMonth(pickerMonth.year, pickerMonth.month), 
    [pickerMonth]
  )

  const formatDay = (d: Date) => 
    d.toLocaleDateString("vi-VN", { 
      weekday: "long", 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    })

  const prevDay = () => { 
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d) 
  }
  
  const nextDay = () => { 
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d) 
  }

  const prevPickerMonth = () => 
    setPickerMonth(({ year, month }) => 
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )
    
  const nextPickerMonth = () => 
    setPickerMonth(({ year, month }) => 
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )

  return (
    <div className="space-y-6">
      {/* On-duty Doctors Header Card */}
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6 space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-outline-variant/10 pb-3">
          <Stethoscope className="size-4 text-emerald-500 animate-pulse" />
          <span>Bác sĩ trực hôm nay:</span>
        </div>
        
        {dayDutyShifts.length === 0 ? (
          <p className="text-xs text-on-surface-variant/45 italic">Không có bác sĩ nào trực hôm nay</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ca Sáng */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-emerald-100/70 shadow-sm space-y-2">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100/30 pb-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ca Sáng (08:00 - 12:00)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dayDutyShifts.filter(s => s.shift === "morning").length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">Trống</span>
                ) : (
                  dayDutyShifts.filter(s => s.shift === "morning").map(s => (
                    <span key={s.doctorId} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-slate-700 text-xs font-bold shadow-sm">
                      {s.doctorName}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Ca Chiều */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-blue-100/70 shadow-sm space-y-2">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-blue-100/30 pb-1.5">
                <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                Ca Chiều (13:30 - 17:30)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dayDutyShifts.filter(s => s.shift === "afternoon").length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">Trống</span>
                ) : (
                  dayDutyShifts.filter(s => s.shift === "afternoon").map(s => (
                    <span key={s.doctorId} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-slate-700 text-xs font-bold shadow-sm">
                      {s.doctorName}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Ca Tối */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-amber-100/70 shadow-sm space-y-2">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-100/30 pb-1.5">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Ca Tối (18:00 - 22:00)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dayDutyShifts.filter(s => s.shift === "evening").length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">Trống</span>
                ) : (
                  dayDutyShifts.filter(s => s.shift === "evening").map(s => (
                    <span key={s.doctorId} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-slate-700 text-xs font-bold shadow-sm">
                      {s.doctorName}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {/* Day header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30">
        <button 
          onClick={prevDay} 
          className="size-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Date picker trigger */}
        <Popover 
          open={datePickerOpen} 
          onOpenChange={(o) => {
            setDatePickerOpen(o)
            if (o) setPickerMonth({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() })
          }}
        >
          <PopoverTrigger
            render={
              <button className="text-center group cursor-pointer px-3 py-1 rounded-xl hover:bg-surface-container-low transition-colors" />
            }
          >
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-sm font-bold text-on-surface capitalize group-hover:text-primary transition-colors">
                {formatDay(selectedDate)}
              </span>
              <CalendarDays className="size-3.5 text-on-surface-variant/40 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">{dayAppointments.length} lịch khám</p>
          </PopoverTrigger>

          <PopoverContent 
            className="w-72 p-3 rounded-2xl shadow-xl border border-outline-variant/15 bg-white" 
            align="center" 
            sideOffset={8}
          >
            {/* Picker header */}
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={prevPickerMonth} 
                className="size-7 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <span className="text-xs font-bold text-on-surface">
                {MONTHS_VN[pickerMonth.month]} {pickerMonth.year}
              </span>
              <button 
                onClick={nextPickerMonth} 
                className="size-7 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="text-center text-[9px] font-bold text-on-surface-variant/40 uppercase py-1">
                  {wd}
                </div>
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

        <button 
          onClick={nextDay} 
          className="size-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>



      {/* Absolute-positioned timeline */}
      <div className="flex overflow-x-auto">
        {/* Hour labels column */}
        <div className="w-16 shrink-0 border-r border-outline-variant/10 bg-white sticky left-0 z-20">
          {HOUR_LABELS.map((h) => (
            <div key={h} style={{ height: `${PX_PER_MIN * 60}px` }} className="relative">
              <span className="absolute -top-2 left-3 text-[10px] font-mono text-on-surface-variant/40 select-none">
                {h}
              </span>
            </div>
          ))}
        </div>
        
        {/* Events area */}
        {(() => {
          const layoutedApts = layoutDayApts(dayAppointments)
          const maxCols = Math.max(1, ...layoutedApts.map(a => a.totalCols))
          const CARD_W = 200   // px, fixed card width
          const CARD_GAP = 8   // px, gap between overlapping cards
          const AREA_PAD = 16  // px, left padding
          
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
              
              {/* Appointments cards */}
              {layoutedApts.map((apt) => {
                const aAny = apt as any
                const price = aAny.price ?? 0
                const discount = aAny.discount ?? 0
                const paid = aAny.paid ?? 0
                const total = price - discount
                const isUnpaid = paid < total && price > 0
                const remaining = total - paid

                const startMin = parseMin(apt.start)
                const endMin = parseMin(apt.end)
                const durMin = endMin - startMin

                const top = (startMin - START_HOUR * 60) * PX_PER_MIN
                const height = durMin * PX_PER_MIN
                const left = AREA_PAD + apt.col * (CARD_W + CARD_GAP)

                return (
                  <Link
                    key={apt.id}
                    href={`/appointments/${apt.id}/detail`}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: `${left}px`,
                      width: `${CARD_W}px`,
                    }}
                    className={cn(
                      "absolute rounded-xl border p-3 flex flex-col justify-between transition-all select-none hover:shadow-md hover:-translate-y-0.5",
                      apt.status === "cancelled"
                        ? "bg-slate-50 border-slate-200/60 opacity-60"
                        : isUnpaid
                        ? "bg-rose-50/35 border-rose-200/50 hover:border-rose-300"
                        : "bg-white border-outline-variant/10 hover:border-primary/30"
                    )}
                  >
                    <div className="space-y-1 overflow-hidden w-full">
                      {/* Header line: Time and status */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-bold font-mono text-on-surface-variant/50 flex items-center gap-0.5">
                          <Clock className="size-2.5" />
                          {apt.start} - {apt.end}
                        </span>
                        
                        <StatusBadge 
                          status={apt.status} 
                          variant="dot" 
                          className="px-1 py-0.2"
                        />
                      </div>

                      {/* Patient and unpaid indicator */}
                      <div className="flex items-start gap-1 justify-between mt-1">
                        <p className="text-xs font-bold text-on-surface truncate flex-1">
                          {apt.patient}
                        </p>
                        {isUnpaid && (
                          <span className="shrink-0 bg-red-100 text-red-700 px-1 py-0.2 rounded text-[8px] font-bold uppercase border border-red-200/20">
                            Nợ
                          </span>
                        )}
                      </div>

                      {/* Service and doctor (only show if card is large enough, e.g. durMin >= 60) */}
                      {durMin >= 60 && (
                        <div className="space-y-1 pt-1 border-t border-outline-variant/5">
                          <p className="text-[10px] font-semibold text-primary truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            {apt.service}
                          </p>
                          <p className="text-[10px] text-on-surface-variant/60 truncate flex items-center gap-1">
                            <User className="size-2.5 text-on-surface-variant/40 shrink-0" />
                            {apt.doctor}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer line with outstanding debt if durMin >= 60 */}
                    {isUnpaid && durMin >= 60 ? (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50/70 px-1.5 py-0.5 rounded mt-auto border border-rose-100/30">
                        <CreditCard className="size-3 text-rose-500 shrink-0" />
                        <span>Còn nợ: {fmtCurrency(remaining)}</span>
                      </div>
                    ) : apt.status === "scheduled" && toDateKey(selectedDate) === toDateKey(today) && durMin >= 60 && userRole === "admin" ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCheckIn?.(apt.id, "confirmed")
                        }}
                        className="w-full flex items-center justify-center gap-1 py-1 rounded bg-blue-600 text-white text-[9px] font-bold shadow-sm shadow-blue-500/20 hover:brightness-105 transition-all mt-auto"
                      >
                        <CheckCircle2 className="size-2.5" />
                        Xác nhận nhanh
                      </button>
                    ) : apt.status === "confirmed" && toDateKey(selectedDate) === toDateKey(today) && durMin >= 60 && userRole === "receptionist" ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCheckIn?.(apt.id, "checked_in")
                        }}
                        className="w-full flex items-center justify-center gap-1 py-1 rounded bg-purple-600 text-white text-[9px] font-bold shadow-sm shadow-purple-500/20 hover:brightness-105 transition-all mt-auto"
                      >
                        <CheckCircle2 className="size-2.5" />
                        Tiếp đón nhanh
                      </button>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          )
        })()}
      </div>
    </div>
    </div>
  )
}
