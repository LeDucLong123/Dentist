import { initialDoctors, Doctor } from "@/app/(main)/doctors/page"

export type ShiftType = "morning" | "afternoon" | "full_day" | "off"

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
  full_day: "Cả ngày (08:00 - 17:30)",
  off: "Nghỉ"
}

export const DEFAULT_WEEKLY_DUTY: WeeklyDuty = {
  "1": { // BS. Phạm Thành Nam
    1: { shift: "morning", room: "Phòng 3A" },
    2: { shift: "morning", room: "Phòng 3A" },
    3: { shift: "full_day", room: "Phòng 3A" },
    4: { shift: "morning", room: "Phòng 3A" },
    5: { shift: "morning", room: "Phòng 3A" },
    6: { shift: "off", room: "" },
    0: { shift: "off", room: "" }
  },
  "2": { // ThS.BS. Nguyễn Minh Thư
    1: { shift: "afternoon", room: "Phòng 2B" },
    2: { shift: "afternoon", room: "Phòng 2B" },
    3: { shift: "off", room: "" },
    4: { shift: "afternoon", room: "Phòng 2B" },
    5: { shift: "full_day", room: "Phòng 2B" },
    6: { shift: "morning", room: "Phòng 2B" },
    0: { shift: "off", room: "" }
  },
  "3": { // BS. Lê Hoàng Vũ
    1: { shift: "morning", room: "Phòng 1A" },
    2: { shift: "morning", room: "Phòng 1A" },
    3: { shift: "morning", room: "Phòng 1A" },
    4: { shift: "off", room: "" },
    5: { shift: "afternoon", room: "Phòng 1A" },
    6: { shift: "off", room: "" },
    0: { shift: "off", room: "" }
  },
  "4": { // BS. Trần Mai Anh
    1: { shift: "full_day", room: "Phòng 1B" },
    2: { shift: "off", room: "" },
    3: { shift: "afternoon", room: "Phòng 1B" },
    4: { shift: "full_day", room: "Phòng 1B" },
    5: { shift: "morning", room: "Phòng 1B" },
    6: { shift: "morning", room: "Phòng 1B" },
    0: { shift: "off", room: "" }
  },
  "5": { // BS. Đỗ Quang Khải
    1: { shift: "off", room: "" },
    2: { shift: "full_day", room: "Phòng 2A" },
    3: { shift: "morning", room: "Phòng 2A" },
    4: { shift: "afternoon", room: "Phòng 2A" },
    5: { shift: "off", room: "" },
    6: { shift: "afternoon", room: "Phòng 2A" },
    0: { shift: "off", room: "" }
  }
}

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
export function getDutyShiftsForDate(date: Date, duty: WeeklyDuty = getSavedWeeklyDuty()): DutyShift[] {
  const dayOfWeek = date.getDay() // 0 to 6
  const list: DutyShift[] = []
  
  initialDoctors.forEach((doc) => {
    const docDuty = duty[doc.id]?.[dayOfWeek]
    if (docDuty && docDuty.shift !== "off") {
      list.push({
        doctorId: doc.id,
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
  duty: WeeklyDuty = getSavedWeeklyDuty()
): { hasDuty: boolean; message?: string } {
  // Tìm doctorId tương ứng
  const doctor = initialDoctors.find(
    (d) => d.name.toLowerCase().includes(doctorName.toLowerCase()) || 
           doctorName.toLowerCase().includes(d.name.toLowerCase())
  )
  if (!doctor) return { hasDuty: true } // Không tìm thấy bác sĩ thì bỏ qua cảnh báo
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return { hasDuty: true }
  
  const dayOfWeek = date.getDay()
  const docDuty = duty[doctor.id]?.[dayOfWeek]
  
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
  // Cả ngày: 8h-17h30 (480 - 1050 phút)
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
  } else if (docDuty.shift === "full_day") {
    if (timeMinutes < 480 || timeMinutes > 1050) {
      return { 
        hasDuty: false, 
        message: `Bác sĩ ${doctor.name} chỉ trực khung giờ Hành chính (08:00 - 17:30) hôm nay.` 
      }
    }
  }
  
  return { hasDuty: true }
}
