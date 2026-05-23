"use client"

import { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { APPOINTMENTS } from "@/lib/appointments-data"
import { 
  toDateKey, 
  getWeeksInMonth, 
  WEEKDAYS, 
  MONTHS_VN 
} from "@/lib/date-utils"

interface MonthViewProps {
  calMonth: { year: number; month: number }
  setCalMonth: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  setViewMode: (mode: "day" | "month") => void
  appointments: typeof APPOINTMENTS
}

// Compact status styling for month view cells
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  confirmed:   { bg: "bg-emerald-50", text: "text-emerald-700" },
  scheduled:   { bg: "bg-blue-50",    text: "text-blue-700" },
  checked_in:  { bg: "bg-purple-50",  text: "text-purple-700" },
  examining:   { bg: "bg-pink-50",    text: "text-pink-700" },
  rescheduled: { bg: "bg-amber-50",   text: "text-amber-700" },
  completed:   { bg: "bg-slate-50",   text: "text-slate-600" },
  cancelled:   { bg: "bg-red-50",     text: "text-red-600" },
}

export function MonthView({
  calMonth,
  setCalMonth,
  selectedDate,
  setSelectedDate,
  setViewMode,
  appointments
}: MonthViewProps) {
  const today = new Date()

  const weeks = useMemo(() => 
    getWeeksInMonth(calMonth.year, calMonth.month), 
    [calMonth]
  )

  const monthAptMap = useMemo(() => {
    const map: Record<string, typeof APPOINTMENTS> = {}
    appointments.forEach((a) => {
      if (!map[a.date]) map[a.date] = []
      map[a.date].push(a)
    })
    return map
  }, [appointments])

  const prevMonth = () => 
    setCalMonth(({ year, month }) => 
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )

  const nextMonth = () => 
    setCalMonth(({ year, month }) => 
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30">
        <button 
          onClick={prevMonth} 
          className="size-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-bold text-on-surface">
          {MONTHS_VN[calMonth.month]} {calMonth.year}
        </p>
        <button 
          onClick={nextMonth} 
          className="size-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors"
        >
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
        <div 
          key={wi} 
          className={cn(
            "grid grid-cols-7 border-b border-outline-variant/10 last:border-0 divide-x divide-outline-variant/10", 
            wi % 2 === 1 ? "bg-surface-container-low/20" : ""
          )}
        >
          {week.map((day, di) => {
            const key = toDateKey(day)
            const apts = monthAptMap[key] ?? []
            const isToday = key === toDateKey(today)
            const isCurrentMonth = day.getMonth() === calMonth.month
            const isSelected = key === toDateKey(selectedDate)
            
            return (
              <div
                key={di}
                onClick={() => { 
                  setSelectedDate(day)
                  setViewMode("day") 
                }}
                className={cn(
                  "min-h-[90px] p-2 cursor-pointer transition-all hover:bg-primary/5 relative",
                  !isCurrentMonth && "opacity-35",
                  isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20"
                )}
              >
                <div 
                  className={cn(
                    "size-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors",
                    isToday 
                      ? "bg-primary text-on-primary" 
                      : "text-on-surface hover:bg-surface-container-low"
                  )}
                >
                  {day.getDate()}
                </div>
                
                <div className="space-y-0.5">
                  {apts.slice(0, 2).map((apt) => {
                    const colors = STATUS_COLORS[apt.status] ?? STATUS_COLORS.scheduled
                    return (
                      <div 
                        key={apt.id} 
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate", 
                          colors.bg, 
                          colors.text
                        )}
                      >
                        {apt.start} {apt.patient.split(" ").slice(-1)[0]}
                      </div>
                    )
                  })}
                  {apts.length > 2 && (
                    <div className="text-[10px] text-primary font-bold pl-1">
                      +{apts.length - 2} thêm
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
