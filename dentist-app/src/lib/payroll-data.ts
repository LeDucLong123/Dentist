import { APPOINTMENTS, getAppointmentDetail } from "./appointments-data"

export interface PayrollConfig {
  hourlyRate: number
  coefDegree: Record<string, number>
  weekendCoef: number
  nightCoef: number
  baseSalaries: Record<string, number>
}

export const DEFAULT_PAYROLL_CONFIG: PayrollConfig = {
  hourlyRate: 150000,
  coefDegree: {
    "Đại học": 1.3,
    "Thạc sĩ": 1.5,
    "BSCK I": 1.5,
    "BSCK II": 1.7,
    "Tiến sĩ": 1.7,
    "Phó Giáo sư": 2.0,
    "Giáo sư": 2.5
  },
  weekendCoef: 1.5,
  nightCoef: 1.5,
  baseSalaries: {
    "Trưởng khoa": 0,
    "BS Chính": 0,
    "BS Phụ": 0,
    "Bác sĩ": 0
  }
}

export function calcAptDuration(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  return Math.max(0, (endMin - startMin) / 60)
}

export function getMappedDoctorName(name: string): string {
  if (name.includes("Phạm Thành Nam")) return "BS. Julian Pierce"
  if (name.includes("Nguyễn Minh Thư")) return "BS. Emily Thorne"
  if (name.includes("Lê Hoàng Vũ")) return "BS. Phạm Quốc Dũng"
  if (name.includes("Trần Mai Anh")) return "BS. Nguyễn Thị Lan"
  if (name.includes("Đỗ Quang Khải")) return "BS. Julian Pierce"
  return name
}

export interface DoctorPayrollItem {
  doctorId: string
  name: string
  role: string
  degree: string
  coefficient: number
  weekendCoef: number
  nightCoef: number
  baseSalary: number
  appointmentsCount: number
  actualHours: number
  convertedHours: number
  overtimeHours: number
  overtimePay: number
  allowance: number
  deduction: number
  netSalary: number
  appointments?: any[]
}

export function getDoctorPayroll(
  doctor: { id: string; name: string; role: string; degree: string },
  yearMonth: string, // format: "YYYY-MM"
  config: PayrollConfig = DEFAULT_PAYROLL_CONFIG,
  appointmentsList?: any[]
): DoctorPayrollItem {
  // Resolve mapping for mock data
  const searchName = getMappedDoctorName(doctor.name)
  
  // Find completed appointments in the month
  let completedApts: any[] = []
  
  if (appointmentsList) {
    completedApts = appointmentsList.filter((a) => {
      const isCompleted = a.status === "completed"
      const docId = doctor.id || (doctor as any)._id?.toString()
      const isDoctorMatch = 
        (a.doctorId && a.doctorId.toString() === docId) ||
        (a.doctor && (a.doctor.toLowerCase().includes(searchName.toLowerCase()) || 
                      searchName.toLowerCase().includes(a.doctor.toLowerCase())))
      const isInMonth = a.date && a.date.startsWith(yearMonth)
      return isCompleted && isDoctorMatch && isInMonth
    })
  } else {
    completedApts = APPOINTMENTS.filter((a) => {
      const isCompleted = a.status === "completed"
      const isDoctorMatch = a.doctor.toLowerCase().includes(searchName.toLowerCase()) || 
                            searchName.toLowerCase().includes(a.doctor.toLowerCase())
      const isInMonth = a.date.startsWith(yearMonth)
      return isCompleted && isDoctorMatch && isInMonth
    }).map(a => getAppointmentDetail(a.id))
  }

  // Calculate hours and pay
  let actualHours = 0
  let convertedHours = 0
  let totalPay = 0
  
  const coefficient = config.coefDegree[doctor.degree] ?? 1.3
  const weekendCoef = config.weekendCoef ?? 1.5
  const nightCoef = config.nightCoef ?? 1.5

  completedApts.forEach((apt) => {
    const hours = calcAptDuration(apt.start, apt.end)
    const [y, m, d] = apt.date.split("-").map(Number)
    const dayOfWeek = new Date(y, m - 1, d).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isNight = apt.start >= "18:00"

    const weekendMultiplier = isWeekend ? weekendCoef : 1.0
    const nightMultiplier = isNight ? nightCoef : 1.0
    const shiftCoef = Math.max(weekendMultiplier, nightMultiplier)
    
    const converted = hours * shiftCoef
    const pay = converted * coefficient * config.hourlyRate
    
    actualHours += hours
    convertedHours += converted
    totalPay += pay
  })

  // Mandatory constraints: base salary, allowance, deductions are exactly 0
  const baseSalary = 0
  const allowance = 0
  const deduction = 0
  const netSalary = Math.round(totalPay)

  return {
    doctorId: doctor.id,
    name: doctor.name,
    role: doctor.role,
    degree: doctor.degree,
    coefficient,
    weekendCoef,
    nightCoef,
    baseSalary,
    appointmentsCount: completedApts.length,
    actualHours,
    convertedHours,
    overtimeHours: convertedHours, // Keep for backward compatibility
    overtimePay: netSalary,
    allowance,
    deduction,
    netSalary,
    appointments: completedApts.map(apt => ({
      id: apt.appointmentId || apt.id,
      patient: apt.patient,
      date: apt.date,
      start: apt.start,
      end: apt.end,
      status: apt.status
    }))
  }
}
