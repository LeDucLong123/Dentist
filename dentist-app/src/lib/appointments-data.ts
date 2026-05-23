// ─── Shared appointment data ──────────────────────────────────────────────────
// Dùng chung giữa /appointments (list) và /appointments/[id]/detail

export const APPOINTMENTS = [
  // Ngày hôm nay (2026-05-22)
  { id: "LK001", patient: "Nguyễn Văn A",  doctor: "BS. Julian Pierce",   service: "Cấy ghép Implant",      date: "2026-05-22", start: "08:00", end: "09:30", status: "confirmed" },
  { id: "LK002", patient: "Trần Thị B",    doctor: "BS. Emily Thorne",    service: "Chỉnh nha mắc cài",     date: "2026-05-22", start: "09:00", end: "10:30", status: "scheduled" },
  { id: "LK003", patient: "Lê Văn C",      doctor: "BS. Julian Pierce",   service: "Tẩy trắng răng",        date: "2026-05-22", start: "10:00", end: "11:00", status: "rescheduled" },
  { id: "LK004", patient: "Phạm Thị D",    doctor: "BS. Phạm Quốc Dũng",  service: "Khám tổng quát",        date: "2026-05-22", start: "13:30", end: "14:30", status: "completed" },
  { id: "LK005", patient: "Đỗ Văn M",      doctor: "BS. Nguyễn Thị Lan",  service: "Nhổ răng khôn",         date: "2026-05-22", start: "15:00", end: "16:30", status: "confirmed" },

  // Ngày mai (2026-05-23)
  { id: "LK006", patient: "Hoàng Minh E",  doctor: "BS. Julian Pierce",   service: "Nhổ răng khôn",         date: "2026-05-23", start: "08:30", end: "09:30", status: "confirmed" },
  { id: "LK007", patient: "Vũ Thị F",      doctor: "BS. Emily Thorne",    service: "Bọc răng sứ",           date: "2026-05-23", start: "10:00", end: "11:30", status: "scheduled" },
  { id: "LK008", patient: "Đặng Văn G",    doctor: "BS. Phạm Quốc Dũng",  service: "Tẩy trắng răng",        date: "2026-05-23", start: "14:00", end: "15:00", status: "confirmed" },
  { id: "LK009", patient: "Bùi Thị H",     doctor: "BS. Julian Pierce",   service: "Cấy ghép Implant",      date: "2026-05-23", start: "15:30", end: "17:00", status: "scheduled" },
  { id: "LK010", patient: "Lý Văn X",      doctor: "BS. Nguyễn Thị Lan",  service: "Nhổ răng khôn",         date: "2026-05-23", start: "16:00", end: "17:00", status: "cancelled" },
]

// ─── Extended detail data ─────────────────────────────────────────────────────

export interface AppointmentDetail {
  id: string
  patient: string; patientId: string; patientPhone: string; patientEmail: string; patientAddress: string; patientDob: string
  doctor: string; doctorId: string; doctorSpecialty: string; doctorPhone: string
  service: string; date: string; start: string; end: string; status: string; room: string; note: string
  price: number; discount: number; paid: number
  items: { name: string; qty: number; unit: string; price: number; type: "vip" | "thuong" | "khuyenmai" }[]
  symptoms?: string
  diagnosis?: string
  prescription?: string
  payments?: { date: string; amount: number; method: string }[]
}

const DETAIL_MAP: Record<string, Partial<AppointmentDetail>> = {
  LK001: {
    patientId: "BN001", patientPhone: "0912 345 678", patientEmail: "nva@email.com",
    patientAddress: "123 Lê Lợi, Q.1, TP.HCM", patientDob: "1990-03-15",
    doctorId: "BS001", doctorSpecialty: "Cấy ghép Implant", doctorPhone: "0901 111 222",
    room: "Phòng 3A", note: "Bệnh nhân dị ứng thuốc tê Lidocaine, dùng Articaine thay thế.",
    price: 15000000, discount: 1500000, paid: 5000000,
    items: [
      { name: "Implant Straumann SLA", qty: 1, unit: "cái", price: 10000000, type: "vip" },
      { name: "Abutment titan", qty: 1, unit: "cái", price: 3000000, type: "thuong" },
      { name: "Mão sứ Zirconia", qty: 1, unit: "cái", price: 2000000, type: "khuyenmai" },
    ],
  },
  LK002: {
    patientId: "BN002", patientPhone: "0987 654 321", patientEmail: "ttb@email.com",
    patientAddress: "45 Nguyễn Huệ, Q.1, TP.HCM", patientDob: "1995-07-22",
    doctorId: "BS002", doctorSpecialty: "Chỉnh nha", doctorPhone: "0902 222 333",
    room: "Phòng 2B", note: "",
    price: 25000000, discount: 0, paid: 5000000,
    items: [
      { name: "Mắc cài kim loại", qty: 1, unit: "bộ", price: 20000000, type: "thuong" },
      { name: "Khám & lập kế hoạch điều trị", qty: 1, unit: "lần", price: 3000000, type: "thuong" },
      { name: "Lấy dấu răng kỹ thuật số", qty: 1, unit: "lần", price: 2000000, type: "vip" },
    ],
  },
  LK003: {
    patientId: "BN003", patientPhone: "0909 111 222", patientEmail: "lvc@email.com",
    patientAddress: "78 Trần Hưng Đạo, Q.5, TP.HCM", patientDob: "1988-11-03",
    doctorId: "BS001", doctorSpecialty: "Cấy ghép Implant", doctorPhone: "0901 111 222",
    room: "Phòng 1A", note: "Yêu cầu tẩy trắng bằng đèn laser, không dùng máng.",
    price: 4500000, discount: 500000, paid: 4000000,
    items: [
      { name: "Tẩy trắng Zoom Whitening", qty: 1, unit: "ca", price: 3500000, type: "vip" },
      { name: "Gel tẩy trắng take-home", qty: 1, unit: "bộ", price: 1000000, type: "khuyenmai" },
    ],
  },
  LK004: {
    patientId: "BN004", patientPhone: "0978 222 333", patientEmail: "ptd@email.com",
    patientAddress: "56 Võ Văn Tần, Q.3, TP.HCM", patientDob: "1985-02-28",
    doctorId: "BS003", doctorSpecialty: "Nhổ răng & Phẫu thuật", doctorPhone: "0903 333 444",
    room: "Phòng 1B", note: "Bệnh nhân cao huyết áp, kiểm tra trước khi gây tê.",
    price: 500000, discount: 0, paid: 500000,
    items: [
      { name: "Khám tổng quát", qty: 1, unit: "lần", price: 300000, type: "thuong" },
      { name: "X-quang panoramic", qty: 1, unit: "lần", price: 200000, type: "thuong" },
    ],
  },
  LK005: {
    patientId: "BN011", patientPhone: "0965 444 555", patientEmail: "dvm@email.com",
    patientAddress: "89 Nguyễn Đình Chiểu, Q.3, TP.HCM", patientDob: "1993-09-12",
    doctorId: "BS001", doctorSpecialty: "Cấy ghép Implant", doctorPhone: "0901 111 222",
    room: "Phòng 1A", note: "",
    price: 4500000, discount: 0, paid: 0,
    items: [
      { name: "Tẩy trắng Zoom Whitening", qty: 1, unit: "ca", price: 3500000, type: "vip" },
      { name: "Gel tẩy trắng take-home", qty: 1, unit: "bộ", price: 1000000, type: "thuong" },
    ],
  },
  LK006: {
    patientId: "BN005", patientPhone: "0912 888 999", patientEmail: "hme@email.com",
    patientAddress: "34 Đinh Tiên Hoàng, Q.BT, TP.HCM", patientDob: "1991-04-05",
    doctorId: "BS001", doctorSpecialty: "Cấy ghép Implant", doctorPhone: "0901 111 222",
    room: "Phòng 2A", note: "Răng khôn mọc lệch, cần phẫu thuật cắt lợi.",
    price: 3500000, discount: 500000, paid: 3000000,
    items: [
      { name: "Nhổ răng khôn phẫu thuật", qty: 1, unit: "răng", price: 2500000, type: "thuong" },
      { name: "Thuốc kháng sinh + giảm đau", qty: 1, unit: "đơn", price: 1000000, type: "khuyenmai" },
    ],
  },
  LK007: {
    patientId: "BN006", patientPhone: "0987 111 333", patientEmail: "vtf@email.com",
    patientAddress: "67 Lý Thường Kiệt, Q.10, TP.HCM", patientDob: "1994-12-20",
    doctorId: "BS002", doctorSpecialty: "Chỉnh nha", doctorPhone: "0902 222 333",
    room: "Phòng 3B", note: "",
    price: 8000000, discount: 0, paid: 4000000,
    items: [
      { name: "Bọc răng sứ E-max (2 răng)", qty: 2, unit: "cái", price: 4000000, type: "vip" },
    ],
  },
  LK008: {
    patientId: "BN007", patientPhone: "0909 777 888", patientEmail: "dvg@email.com",
    patientAddress: "23 Cách Mạng Tháng 8, Q.TB, TP.HCM", patientDob: "1987-08-15",
    doctorId: "BS003", doctorSpecialty: "Nhổ răng & Phẫu thuật", doctorPhone: "0903 333 444",
    room: "Phòng 1A", note: "",
    price: 3000000, discount: 300000, paid: 2700000,
    items: [
      { name: "Tẩy trắng tại phòng khám", qty: 1, unit: "ca", price: 3000000, type: "thuong" },
    ],
  },
  LK009: {
    patientId: "BN008", patientPhone: "0934 222 111", patientEmail: "bth@email.com",
    patientAddress: "101 Nguyễn Văn Cừ, Q.5, TP.HCM", patientDob: "1989-01-30",
    doctorId: "BS001", doctorSpecialty: "Cấy ghép Implant", doctorPhone: "0901 111 222",
    room: "Phòng 3A", note: "Ca implant số 2 phía trên. Cần chụp CT cone beam trước khi phẫu thuật.",
    price: 18000000, discount: 0, paid: 9000000,
    items: [
      { name: "Implant Nobel Biocare", qty: 1, unit: "cái", price: 13000000, type: "vip" },
      { name: "Abutment cao cấp", qty: 1, unit: "cái", price: 3000000, type: "vip" },
      { name: "Mão sứ Zirconia full", qty: 1, unit: "cái", price: 2000000, type: "thuong" },
    ],
  },
  LK010: {
    patientId: "BN010", patientPhone: "0999 888 777", patientEmail: "lvx@email.com",
    patientAddress: "123 Nguyễn Văn Hưởng, Q.2, TP.HCM", patientDob: "1998-05-12",
    doctorId: "BS004", doctorSpecialty: "Thẩm mỹ nha khoa", doctorPhone: "0904 444 555",
    room: "Phòng 2C", note: "Bệnh nhân báo bận đột xuất, xin dời lịch nhưng chưa xác định ngày.",
    price: 2500000, discount: 0, paid: 0,
    items: [
      { name: "Nhổ răng khôn phẫu thuật", qty: 1, unit: "răng", price: 2500000, type: "thuong" }
    ],
  },
}

// ─── Getter: merge base + detail ─────────────────────────────────────────────

export function getAppointmentDetail(id: string): AppointmentDetail {
  const base = APPOINTMENTS.find((a) => a.id === id)
  const detail = DETAIL_MAP[id] ?? {}

  return {
    id,
    patient:         base?.patient         ?? "Bệnh nhân",
    patientId:       detail.patientId      ?? "BN000",
    patientPhone:    detail.patientPhone   ?? "---",
    patientEmail:    detail.patientEmail   ?? "---",
    patientAddress:  detail.patientAddress ?? "---",
    patientDob:      detail.patientDob     ?? "",
    doctor:          base?.doctor          ?? "BS. ---",
    doctorId:        detail.doctorId       ?? "BS000",
    doctorSpecialty: detail.doctorSpecialty ?? "---",
    doctorPhone:     detail.doctorPhone    ?? "---",
    service:         base?.service         ?? "Dịch vụ",
    date:            base?.date            ?? "",
    start:           base?.start           ?? "--:--",
    end:             base?.end             ?? "--:--",
    status:          base?.status          ?? "scheduled",
    room:            detail.room           ?? "---",
    note:            detail.note           ?? "",
    price:           detail.price          ?? 0,
    discount:        detail.discount       ?? 0,
    paid:            detail.paid           ?? 0,
    items:           detail.items          ?? [],
    symptoms:        detail.symptoms       ?? "",
    diagnosis:       detail.diagnosis      ?? "",
    prescription:    detail.prescription   ?? "",
    payments:        detail.payments       ?? [],
  }
}

export function updateAppointmentDetail(id: string, updates: Partial<AppointmentDetail>) {
  const base = APPOINTMENTS.find((a) => a.id === id)
  if (base) {
    if (updates.status !== undefined) base.status = updates.status
    if (updates.date !== undefined) base.date = updates.date
    if (updates.start !== undefined) base.start = updates.start
    if (updates.end !== undefined) base.end = updates.end
    if (updates.service !== undefined) base.service = updates.service
    if (updates.patient !== undefined) base.patient = updates.patient
    if (updates.doctor !== undefined) base.doctor = updates.doctor
  }

  if (!DETAIL_MAP[id]) {
    DETAIL_MAP[id] = {}
  }
  
  const detail = DETAIL_MAP[id]
  if (updates.patientId !== undefined) detail.patientId = updates.patientId
  if (updates.patientPhone !== undefined) detail.patientPhone = updates.patientPhone
  if (updates.patientEmail !== undefined) detail.patientEmail = updates.patientEmail
  if (updates.patientAddress !== undefined) detail.patientAddress = updates.patientAddress
  if (updates.patientDob !== undefined) detail.patientDob = updates.patientDob
  if (updates.doctorId !== undefined) detail.doctorId = updates.doctorId
  if (updates.doctorSpecialty !== undefined) detail.doctorSpecialty = updates.doctorSpecialty
  if (updates.doctorPhone !== undefined) detail.doctorPhone = updates.doctorPhone
  if (updates.room !== undefined) detail.room = updates.room
  if (updates.note !== undefined) detail.note = updates.note
  if (updates.price !== undefined) detail.price = updates.price
  if (updates.discount !== undefined) detail.discount = updates.discount
  if (updates.paid !== undefined) detail.paid = updates.paid
  if (updates.items !== undefined) detail.items = updates.items
  if (updates.symptoms !== undefined) detail.symptoms = updates.symptoms
  if (updates.diagnosis !== undefined) detail.diagnosis = updates.diagnosis
  if (updates.prescription !== undefined) detail.prescription = updates.prescription
  if (updates.payments !== undefined) detail.payments = updates.payments
}

// ─── Shared Mock Entities ─────────────────────────────────────────────────────

export const PATIENTS = [
  { id: "BN001", name: "Nguyễn Văn An",   phone: "0912 345 678", email: "nva@email.com", address: "123 Lê Lợi, Q.1, TP.HCM", dob: "1990-03-15" },
  { id: "BN002", name: "Trần Thị Bích",   phone: "0987 654 321", email: "ttb@email.com", address: "45 Nguyễn Huệ, Q.1, TP.HCM", dob: "1995-07-22" },
  { id: "BN003", name: "Lê Hoàng Cường",  phone: "0909 111 222", email: "lvc@email.com", address: "78 Trần Hưng Đạo, Q.5, TP.HCM", dob: "1988-11-03" },
  { id: "BN004", name: "Phạm Thị Dung",   phone: "0934 567 890", email: "ptd@email.com", address: "56 Võ Văn Tần, Q.3, TP.HCM", dob: "1985-02-28" },
]

export const DOCTORS = [
  { id: "BS001", name: "BS. Julian Pierce",   specialty: "Cấy ghép Implant", phone: "0901 111 222" },
  { id: "BS002", name: "BS. Emily Thorne",    specialty: "Chỉnh nha", phone: "0902 222 333" },
  { id: "BS003", name: "BS. Phạm Quốc Dũng", specialty: "Nhổ răng & Phẫu thuật", phone: "0903 333 444" },
  { id: "BS004", name: "BS. Nguyễn Thị Lan", specialty: "Thẩm mỹ nha khoa", phone: "0904 444 555" },
]

export const SERVICES = [
  { id: "DV001", name: "Khám tổng quát", price: { thuong: 300000, vip: 500000, khuyenmai: 250000 }, unit: "lần" },
  { id: "DV002", name: "X-quang panoramic", price: { thuong: 200000, vip: 300000, khuyenmai: 150000 }, unit: "lần" },
  { id: "DV003", name: "Nhổ răng khôn phẫu thuật", price: { thuong: 2500000, vip: 4000000, khuyenmai: 2000000 }, unit: "răng" },
  { id: "DV004", name: "Tẩy trắng Zoom Whitening", price: { thuong: 2500000, vip: 3500000, khuyenmai: 2000000 }, unit: "ca" },
  { id: "DV005", name: "Bọc răng sứ Zirconia", price: { thuong: 2500000, vip: 3000000, khuyenmai: 2200000 }, unit: "cái" },
  { id: "DV006", name: "Implant Straumann SLA", price: { thuong: 8000000, vip: 10000000, khuyenmai: 7000000 }, unit: "cái" },
  { id: "DV007", name: "Mắc cài kim loại", price: { thuong: 18000000, vip: 20000000, khuyenmai: 15000000 }, unit: "bộ" },
]

