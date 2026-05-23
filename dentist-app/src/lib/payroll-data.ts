import { APPOINTMENTS, getAppointmentDetail } from "./appointments-data"

export interface PayrollConfig {
  hourlyRate: number
  coefDegree: Record<string, number>
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
  baseSalaries: {
    "Trưởng khoa": 30000000,
    "BS. Chính": 20000000,
    "BS. Phụ": 12000000,
    "Bác sĩ": 15000000
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
  baseSalary: number
  appointmentsCount: number
  overtimeHours: number
  overtimePay: number
  allowance: number
  deduction: number
  netSalary: number
}

export function getDoctorPayroll(
  doctor: { id: string; name: string; role: string; degree: string },
  yearMonth: string, // format: "YYYY-MM"
  config: PayrollConfig = DEFAULT_PAYROLL_CONFIG
): DoctorPayrollItem {
  // Resolve mapping for mock data
  const searchName = getMappedDoctorName(doctor.name)
  
  // Find completed appointments in the month
  const completedApts = APPOINTMENTS.filter((a) => {
    const isCompleted = a.status === "completed"
    const isDoctorMatch = a.doctor.toLowerCase().includes(searchName.toLowerCase()) || 
                          searchName.toLowerCase().includes(a.doctor.toLowerCase())
    const isInMonth = a.date.startsWith(yearMonth)
    return isCompleted && isDoctorMatch && isInMonth
  }).map(a => getAppointmentDetail(a.id))

  // Calculate hours and pay
  let overtimeHours = 0
  let overtimePay = 0
  
  const coefficient = config.coefDegree[doctor.degree] ?? 1.3
  const baseSalary = config.baseSalaries[doctor.role] ?? config.baseSalaries["Bác sĩ"]

  completedApts.forEach((apt) => {
    const hours = calcAptDuration(apt.start, apt.end)
    overtimeHours += hours
    overtimePay += coefficient * config.hourlyRate * hours
  })

  // Fixed allowances for demonstration
  let allowance = 0
  if (doctor.role === "Trưởng khoa") allowance = 3000000
  else if (doctor.role === "BS. Chính") allowance = 1500000

  // Fixed deduction (taxes/insurance)
  const deduction = Math.round((baseSalary + overtimePay + allowance) * 0.1) // 10% tax/insurance

  const netSalary = baseSalary + overtimePay + allowance - deduction

  return {
    doctorId: doctor.id,
    name: doctor.name,
    role: doctor.role,
    degree: doctor.degree,
    coefficient,
    baseSalary,
    appointmentsCount: completedApts.length,
    overtimeHours,
    overtimePay,
    allowance,
    deduction,
    netSalary
  }
}
