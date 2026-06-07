import { initialDoctors, Doctor } from "@/app/(main)/doctors/page"

export type ShiftType = "morning" | "afternoon" | "evening" | "off"

export interface DutyShift {
  doctorId: string
  doctorName: string
  shift: ShiftType
  room: string
}

export interface WeeklyDuty {
  // key is doctorId
  [doctorId: string]: {
    // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    [dayOfWeek: number]: {
      shift: ShiftType
      room: string
    }
  }
}

export const SHIFT_LABELS: Record<ShiftType, string> = {
  morning: "Sáng (08:00 - 12:00)",
  afternoon: "Chiều (13:30 - 17:30)",
  evening: "Tối (18:00 - 22:00)",
  off: "Nghỉ"
}

export const DEFAULT_WEEKLY_DUTY: WeeklyDuty = {}

// Lấy lịch trực trong localStorage hoặc trả về mặc định
export function getSavedWeeklyDuty(): WeeklyDuty {
  if (typeof window === "undefined") return DEFAULT_WEEKLY_DUTY
  try {
    const saved = localStorage.getItem("weekly-duty")
    if (saved) return JSON.parse(saved)
  } catch {}
  return DEFAULT_WEEKLY_DUTY
}

// Lưu lịch trực vào localStorage
export function saveWeeklyDuty(duty: WeeklyDuty) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("weekly-duty", JSON.stringify(duty))
  } catch {}
}

// Lấy danh sách trực của 1 ngày cụ thể
export function getDutyShiftsForDate(
  date: Date,
  duty: WeeklyDuty = getSavedWeeklyDuty(),
  doctorsList?: any[]
): DutyShift[] {
  const dayOfWeek = date.getDay() // 0 to 6
  const list: DutyShift[] = []
  const doctorsToUse = doctorsList || initialDoctors
  
  doctorsToUse.forEach((doc) => {
    const docId = doc.id || doc._id || doc.doctorId
    const docDuty = duty[docId]?.[dayOfWeek]
    if (docDuty && docDuty.shift !== "off") {
      list.push({
        doctorId: docId,
        doctorName: doc.name,
        shift: docDuty.shift,
        room: docDuty.room
      })
    }
  })
  
  return list
}

// Kiểm tra xem bác sĩ có ca trực vào ngày và giờ cụ thể hay không
export function checkDoctorDuty(
  doctorName: string,
  dateStr: string, // YYYY-MM-DD
  timeStr: string, // HH:MM
  duty: WeeklyDuty = getSavedWeeklyDuty(),
  doctorsList?: any[]
): { hasDuty: boolean; message?: string } {
  const doctorsToUse = doctorsList || initialDoctors
  
  // Tìm doctorId tương ứng
  const doctor = doctorsToUse.find(
    (d) => d.name.toLowerCase().includes(doctorName.toLowerCase()) || 
           doctorName.toLowerCase().includes(d.name.toLowerCase())
  )
  if (!doctor) return { hasDuty: true } // Không tìm thấy bác sĩ thì bỏ qua cảnh báo
  
  const docId = doctor.id || doctor._id || doctor.doctorId
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return { hasDuty: true }
  
  const dayOfWeek = date.getDay()
  const docDuty = duty[docId]?.[dayOfWeek]
  
  if (!docDuty || docDuty.shift === "off") {
    return { 
      hasDuty: false, 
      message: `Bác sĩ ${doctor.name} không có lịch trực vào ngày này (Thứ ${dayOfWeek === 0 ? "Chủ Nhật" : dayOfWeek + 1}).` 
    }
  }
  
  const [h, m] = timeStr.split(":").map(Number)
  const timeMinutes = h * 60 + m
  
  // Ca Sáng: 8h-12h (480 - 720 phút)
  // Ca Chiều: 13h30-17h30 (810 - 1050 phút)
  // Ca Tối: 18h-22h (1080 - 1320 phút)
  if (docDuty.shift === "morning") {
    if (timeMinutes < 480 || timeMinutes > 720) {
      return { 
        hasDuty: false, 
        message: `Bác sĩ ${doctor.name} chỉ trực Ca Sáng (08:00 - 12:00) hôm nay.` 
      }
    }
  } else if (docDuty.shift === "afternoon") {
    if (timeMinutes < 810 || timeMinutes > 1050) {
      return { 
        hasDuty: false, 
        message: `Bác sĩ ${doctor.name} chỉ trực Ca Chiều (13:30 - 17:30) hôm nay.` 
      }
    }
  } else if (docDuty.shift === "evening") {
    if (timeMinutes < 1080 || timeMinutes > 1320) {
      return { 
        hasDuty: false, 
        message: `Bác sĩ ${doctor.name} chỉ trực Ca Tối (18:00 - 22:00) hôm nay.` 
      }
    }
  }
  
  return { hasDuty: true }
}
