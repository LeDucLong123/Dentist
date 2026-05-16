import { User2, Stethoscope, Shield } from "lucide-react"

export type Role = "admin" | "doctor" | "patient"

export const ROLES = [
  {
    value: "patient" as Role,
    label: "Bệnh nhân",
    desc: "Đặt lịch khám & xem hồ sơ",
    icon: User2,
    accent: "text-teal-700",
    iconBg: "bg-teal-100",
    border: "border-teal-300",
    activeBg: "bg-teal-50",
  },
  {
    value: "doctor" as Role,
    label: "Bác sĩ",
    desc: "Quản lý bệnh nhân & lịch hẹn",
    icon: Stethoscope,
    accent: "text-blue-700",
    iconBg: "bg-blue-100",
    border: "border-blue-300",
    activeBg: "bg-blue-50",
  },
  {
    value: "admin" as Role,
    label: "Quản trị viên",
    desc: "Toàn quyền quản lý hệ thống",
    icon: Shield,
    accent: "text-purple-700",
    iconBg: "bg-purple-100",
    border: "border-purple-300",
    activeBg: "bg-purple-50",
  },
]

export const MOCK_EXISTING_USERS = [
  { id: "u1", name: "BS. Nguyễn Văn A", email: "nguyenvana@clinic.vn" },
  { id: "u2", name: "Nguyễn Thị B", email: "nguyenthib@clinic.vn" },
  { id: "u3", name: "Trần Văn C", email: "tranvanc@clinic.vn" },
]
