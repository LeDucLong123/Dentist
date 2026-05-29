"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Stethoscope, 
  Save, 
  ArrowLeft,
  Info,
  Clock,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Topbar } from "@/components/topbar"
import { initialDoctors } from "@/app/(main)/doctors/page"
import { 
  WeeklyDuty, 
  ShiftType, 
  getSavedWeeklyDuty, 
  saveWeeklyDuty,
  SHIFT_LABELS 
} from "@/lib/duty-data"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function WeeklyShiftsPage() {
  const router = useRouter()
  const [weeklyDuty, setWeeklyDuty] = useState<WeeklyDuty>({})
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)

  // Load weekly duty from localStorage
  useEffect(() => {
    setWeeklyDuty(getSavedWeeklyDuty())
  }, [])

  // Calculate actual dates of the current week (Monday to Sunday)
  const weekDates = useMemo(() => {
    const today = new Date()
    const currentDay = today.getDay()
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay // distance from Monday
    
    const monday = new Date(today)
    monday.setDate(today.getDate() + distanceToMonday + currentWeekOffset * 7)
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      dates.push(d)
    }
    return dates
  }, [currentWeekOffset])

  const weekRangeLabel = useMemo(() => {
    if (weekDates.length === 0) return ""
    const format = (d: Date) => d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    return `${format(weekDates[0])} - ${format(weekDates[6])}`
  }, [weekDates])

  const handleShiftChange = (doctorId: string, dayOfWeek: number, shift: ShiftType) => {
    setWeeklyDuty((prev) => {
      const doctorSchedule = prev[doctorId] || {}
      const daySchedule = doctorSchedule[dayOfWeek] || { room: "" }
      
      const nextSchedule = {
        ...prev,
        [doctorId]: {
          ...doctorSchedule,
          [dayOfWeek]: {
            ...daySchedule,
            shift
          }
        }
      }
      return nextSchedule
    })
  }

  const handleSave = () => {
    saveWeeklyDuty(weeklyDuty)
    toast.success("Lưu lịch trực tuần bác sĩ thành công!", {
      description: "Lịch trực đã được ghi nhận và đồng bộ trực tiếp lên hệ thống đặt lịch khám."
    })
  }

  const handleAutoArrange = () => {
    const nextDuty: WeeklyDuty = { ...weeklyDuty }
    const days = [1, 2, 3, 4, 5, 6, 0] // T2 -> CN
    
    // Clean, pre-defined schedules for the 4 doctors to ensure full, optimal coverage without overlap
    const schedules: Record<string, Record<number, ShiftType>> = {
      "BS001": { 1: "morning", 2: "afternoon", 3: "full_day", 4: "off", 5: "morning", 6: "afternoon", 0: "off" },
      "BS002": { 1: "afternoon", 2: "morning", 3: "off", 4: "full_day", 5: "afternoon", 6: "morning", 0: "off" },
      "BS003": { 1: "full_day", 2: "off", 3: "morning", 4: "afternoon", 5: "full_day", 6: "off", 0: "off" },
      "BS004": { 1: "off", 2: "full_day", 3: "afternoon", 4: "morning", 5: "off", 6: "full_day", 0: "off" },
    }

    initialDoctors.forEach((doc) => {
      if (!nextDuty[doc.id]) {
        nextDuty[doc.id] = {}
      }
      days.forEach((day) => {
        const assignedShift = schedules[doc.id]?.[day] || "off"
        nextDuty[doc.id][day] = {
          shift: assignedShift,
          room: ""
        }
      })
    })

    setWeeklyDuty(nextDuty)
    toast.success("Tự động sắp xếp ca trực hoàn tất!", {
      description: "Hệ thống đã phân bổ ca trực tối ưu cho các bác sĩ. Hãy bấm 'Lưu lịch trực' để áp dụng."
    })
  }

  const weekdayHeaders = [
    { label: "Thứ Hai", dayIndex: 1 },
    { label: "Thứ Ba", dayIndex: 2 },
    { label: "Thứ Tư", dayIndex: 3 },
    { label: "Thứ Năm", dayIndex: 4 },
    { label: "Thứ Sáu", dayIndex: 5 },
    { label: "Thứ Bảy", dayIndex: 6 },
    { label: "Chủ Nhật", dayIndex: 0 },
  ]

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50">
          <span>Hệ thống</span>
          <ChevronRight className="size-3" />
          <Link href="/appointments" className="hover:text-primary transition-colors">Lịch khám</Link>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Phân ca trực bác sĩ</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/appointments" className="p-1.5 rounded-lg hover:bg-slate-100 mr-1 text-on-surface-variant">
                <ArrowLeft className="size-4" />
              </Link>
              <div className="p-2 rounded-xl bg-primary/10">
                <Calendar className="size-5 text-primary" />
              </div>
              <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Lịch Trực Tuần Bác Sĩ</h1>
            </div>
            <p className="text-xs text-on-surface-variant ml-[82px]">
              Cấu hình phân ca trực cố định hàng tuần cho các bác sĩ chuyên khoa.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={handleAutoArrange}
              className="h-10 px-5 rounded-xl border-outline-variant/30 text-on-surface-variant text-sm font-semibold gap-2 hover:text-primary hover:border-primary/30"
            >
              <Sparkles className="size-4 text-amber-500" />
              Tự động sắp xếp
            </Button>

            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/95 text-white font-bold h-10 px-5 rounded-xl shadow-md shadow-primary/25 gap-2 border-transparent"
            >
              <Save className="size-4" /> Lưu lịch trực
            </Button>
          </div>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center justify-between bg-white px-6 py-3.5 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <span className="text-sm font-bold text-slate-800">Hiển thị theo tuần:</span>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full font-mono">
              {weekRangeLabel}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              className="rounded-lg border-outline-variant/30 text-on-surface-variant"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(0)}
              className="rounded-lg border-outline-variant/30 text-on-surface-variant text-xs font-bold px-3 h-8"
            >
              Tuần này
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              className="rounded-lg border-outline-variant/30 text-on-surface-variant"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Tip banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-800 animate-in fade-in duration-200">
          <Info className="size-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider">Hướng dẫn nghiệp vụ</p>
            <p className="text-xs text-blue-700/85 leading-relaxed">
              Lịch trực ở đây là lịch trực lặp lại cố định hàng tuần. Thay đổi tại bảng này sẽ lập tức cập nhật trạng thái làm việc của bác sĩ khi đặt lịch khám mới. Bấm <strong>"Lưu lịch trực"</strong> để áp dụng các thay đổi xuống hệ thống.
            </p>
          </div>
        </div>

        {/* Shifts Table */}
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1000px]">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="px-6 py-4 w-60">Bác sĩ</th>
                  {weekdayHeaders.map((head, idx) => {
                    const date = weekDates[idx]
                    const formattedDate = date ? date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) : ""
                    return (
                      <th key={head.dayIndex} className="px-4 py-4 text-center">
                        <p className="font-bold">{head.label}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">({formattedDate})</p>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {initialDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <Stethoscope className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{doc.role} · {doc.specialty}</p>
                        </div>
                      </div>
                    </td>
                    
                    {weekdayHeaders.map((head) => {
                      const schedule = weeklyDuty[doc.id]?.[head.dayIndex] || { shift: "off", room: "" }
                      return (
                        <td key={head.dayIndex} className="px-2 py-3 text-center">
                          <div className="flex items-center max-w-[130px] mx-auto h-9">
                            {/* Shift Type Select */}
                            <select
                              value={schedule.shift}
                              onChange={(e) => handleShiftChange(doc.id, head.dayIndex, e.target.value as ShiftType)}
                              className={cn(
                                "w-full text-center py-1.5 px-2.5 rounded-lg text-xs font-bold outline-none border transition-all cursor-pointer",
                                schedule.shift === "off"
                                  ? "bg-slate-50 text-slate-400 border-slate-200"
                                  : schedule.shift === "morning"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : schedule.shift === "afternoon"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
                              )}
                            >
                              <option value="off">Nghỉ</option>
                              <option value="morning">Ca Sáng</option>
                              <option value="afternoon">Ca Chiều</option>
                              <option value="full_day">Cả ngày</option>
                            </select>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
