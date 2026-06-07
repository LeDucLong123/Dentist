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
  Sparkles,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Topbar } from "@/components/topbar"
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
  const [doctors, setDoctors] = useState<any[]>([])
  const [weeklyDuty, setWeeklyDuty] = useState<WeeklyDuty>({})
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load weekly duty and doctors from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const docRes = await fetch("/api/doctors")
        if (!docRes.ok) throw new Error("Không thể tải danh sách bác sĩ.")
        const docsData = await docRes.json()
        setDoctors(docsData)

        const dutyRes = await fetch("/api/duty")
        if (dutyRes.ok) {
          const dutyData = await dutyRes.json()
          setWeeklyDuty(dutyData)
        } else {
          setWeeklyDuty({})
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi tải dữ liệu ca trực.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
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

  // Helper check if date is past
  const isPastDay = (dayIndex: number) => {
    const idx = dayIndex === 0 ? 6 : dayIndex - 1
    const date = weekDates[idx]
    if (!date) return false
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    
    return compareDate < today
  }

  const handleShiftChange = (doctorId: string, dayOfWeek: number, shift: ShiftType) => {
    if (isPastDay(dayOfWeek)) {
      toast.error("Không thể thay đổi ca trực của ngày đã qua!")
      return
    }
    setWeeklyDuty((prev) => {
      const doctorSchedule = prev[doctorId] || {}
      const daySchedule = doctorSchedule[dayOfWeek] || { room: "" }
      
      const nextSchedule = {
        ...prev,
        [doctorId]: {
          ...doctorSchedule,
          [dayOfWeek]: {
            ...daySchedule,
            shift,
            room: shift === "off" ? "" : daySchedule.room
          }
        }
      }
      return nextSchedule
    })
  }

  const handleRoomChange = (doctorId: string, dayOfWeek: number, room: string) => {
    if (isPastDay(dayOfWeek)) {
      toast.error("Không thể thay đổi phòng trực của ngày đã qua!")
      return
    }
    setWeeklyDuty((prev) => {
      const doctorSchedule = prev[doctorId] || {}
      const daySchedule = doctorSchedule[dayOfWeek] || { shift: "off" }
      
      return {
        ...prev,
        [doctorId]: {
          ...doctorSchedule,
          [dayOfWeek]: {
            ...daySchedule,
            room
          }
        }
      }
    })
  }

  const handleSave = async () => {
    try {
      const res = await fetch("/api/duty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyDuty })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Không thể lưu lịch trực.")

      saveWeeklyDuty(weeklyDuty)
      toast.success("Lưu lịch trực tuần bác sĩ thành công!", {
        description: "Lịch trực đã được ghi nhận và đồng bộ trực tiếp lên hệ thống đặt lịch khám."
      })
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu lịch trực bác sĩ.")
    }
  }

  const handleAutoArrange = () => {
    const nextDuty: WeeklyDuty = { ...weeklyDuty }
    const days = [1, 2, 3, 4, 5, 6, 0] // T2 -> CN
    
    // Shift rotation list: morning, afternoon, evening, off
    const shiftRotation: ShiftType[][] = [
      ["morning", "afternoon", "evening", "off", "morning", "afternoon", "off"], // Doctor 0
      ["afternoon", "evening", "off", "morning", "afternoon", "evening", "off"], // Doctor 1
      ["evening", "off", "morning", "afternoon", "evening", "off", "off"],       // Doctor 2
      ["morning", "afternoon", "evening", "off", "morning", "afternoon", "off"], // Doctor 3
    ]

    let modifiedCount = 0
    doctors.forEach((doc, docIdx) => {
      if (!nextDuty[doc.id]) {
        nextDuty[doc.id] = {}
      }
      
      const rot = shiftRotation[docIdx % shiftRotation.length]
      
      days.forEach((day, dayIdx) => {
        if (!isPastDay(day)) {
          const assignedShift = rot[dayIdx] || "off"
          nextDuty[doc.id][day] = {
            shift: assignedShift,
            room: ""
          }
          modifiedCount++
        }
      })
    })

    if (modifiedCount === 0) {
      toast.warning("Không có ngày nào trong tuần này có thể sắp xếp (tất cả đã qua)!")
      return
    }

    setWeeklyDuty(nextDuty)
    toast.success("Tự động sắp xếp ca trực hoàn tất!", {
      description: "Hệ thống đã phân bổ ca trực cho các ngày chưa qua. Hãy bấm 'Lưu lịch trực' để áp dụng."
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
              Lịch trực ở đây là lịch trực lặp lại cố định hàng tuần. Thay đổi tại bảng này sẽ lập tức cập nhật trạng thái làm việc của bác sĩ khi đặt lịch khám mới. <strong>Các ca trực của những ngày đã qua trong quá khứ sẽ bị khóa và không thể chỉnh sửa.</strong> Bấm <strong>"Lưu lịch trực"</strong> để áp dụng các thay đổi xuống hệ thống.
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
                    const isPast = date ? (() => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const compareDate = new Date(date)
                      compareDate.setHours(0, 0, 0, 0)
                      return compareDate < today
                    })() : false
                    return (
                      <th key={head.dayIndex} className={cn("px-4 py-4 text-center transition-all", isPast && "bg-slate-50/50 opacity-70")}>
                        <div className="flex items-center justify-center gap-1">
                          <p className="font-bold text-slate-700">{head.label}</p>
                          {isPast && (
                            <span title="Ngày đã qua (Không thể chỉnh sửa)">
                              <Lock className="size-3 text-slate-400" />
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">({formattedDate})</p>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="size-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-on-surface-variant font-medium">Đang tải danh sách bác sĩ và ca trực...</p>
                    </td>
                  </tr>
                ) : doctors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-xs text-on-surface-variant italic font-medium">
                      Không tìm thấy bác sĩ nào để phân ca trực.
                    </td>
                  </tr>
                ) : (
                  doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <Stethoscope className="size-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{doc.degree} · {doc.specialty}</p>
                          </div>
                        </div>
                      </td>
                      
                      {weekdayHeaders.map((head, idx) => {
                        const schedule = weeklyDuty[doc.id]?.[head.dayIndex] || { shift: "off", room: "" }
                        const date = weekDates[idx]
                        const isPast = date ? (() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const compareDate = new Date(date)
                          compareDate.setHours(0, 0, 0, 0)
                          return compareDate < today
                        })() : false
                        return (
                          <td key={head.dayIndex} className="px-2 py-3 text-center">
                            <div className="flex items-center max-w-[130px] mx-auto h-9">
                              {/* Shift Type Select */}
                              <select
                                value={schedule.shift}
                                disabled={isPast}
                                onChange={(e) => handleShiftChange(doc.id, head.dayIndex, e.target.value as ShiftType)}
                                className={cn(
                                  "w-full text-center py-1.5 px-2.5 rounded-lg text-xs font-bold outline-none border transition-all",
                                  isPast ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                                 schedule.shift === "off"
                                    ? "bg-slate-50 text-slate-400 border-slate-200"
                                    : schedule.shift === "morning"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : schedule.shift === "afternoon"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                )}
                              >
                                <option value="off">Nghỉ</option>
                                <option value="morning">Ca Sáng</option>
                                <option value="afternoon">Ca Chiều</option>
                                <option value="evening">Ca Tối</option>
                              </select>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
