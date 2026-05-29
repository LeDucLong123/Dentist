"use client"

import { useState, useMemo } from "react"
import { Topbar } from "@/components/topbar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  User,
  Stethoscope,
  FileText,
  CheckCircle2,
  Phone,
  MapPin,
  Mail,
  CalendarDays,
  ChevronRight,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { SearchCombobox } from "@/components/search-combobox"
import { PATIENTS, DOCTORS } from "@/lib/appointments-data"
import { ServicesTable } from "./_components/services-table"
import { checkDoctorDuty } from "@/lib/duty-data"

export default function NewAppointmentPage() {
  const [selectedPatient, setSelectedPatient] = useState<typeof PATIENTS[0] | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null)

  // Form states
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [room, setRoom] = useState("")
  const [note, setNote] = useState("")
  
  // Services
  const [items, setItems] = useState<{ id: string, name: string, qty: number, unit: string, price: number, type: "vip" | "thuong" | "khuyenmai" }[]>([
    { id: "1", name: "Khám tổng quát", qty: 1, unit: "lần", price: 0, type: "thuong" }
  ])
  
  const [discount, setDiscount] = useState(0)

  const dutyWarning = useMemo(() => {
    if (!selectedDoctor || !date || !startTime) return null
    const result = checkDoctorDuty(selectedDoctor.name, date, startTime)
    if (!result.hasDuty) {
      return result.message
    }
    return null
  }, [selectedDoctor, date, startTime])

  const patientItems = PATIENTS.map((p) => ({ id: p.id, name: p.name, sub: p.phone }))
  const doctorItems = DOCTORS.map((d) => ({ id: d.id, name: d.name, sub: d.specialty }))

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50 mb-6">
          <Link href="/appointments" className="hover:text-primary transition-colors">Lịch khám</Link>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Tạo mới</span>
        </nav>

        {/* Header strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
                <CalendarDays className="size-3" />
                Đang tạo
              </span>
            </div>
            <h1 className="text-xl font-bold text-on-surface">Tạo lịch khám mới</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/appointments">
              <Button variant="outline" className="h-9 rounded-xl border-outline-variant/30 text-on-surface-variant gap-1.5 text-sm font-semibold hover:text-on-surface hover:bg-surface-container-low">
                Hủy bỏ
              </Button>
            </Link>
            <Button className="h-9 rounded-xl border-transparent bg-primary text-on-primary gap-1.5 text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90">
              <CheckCircle2 className="size-4" />
              Xác nhận lịch hẹn
            </Button>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ════ LEFT (1 col) ════ */}
          <div className="lg:col-span-1 space-y-4">

            {/* Thời gian */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="size-4 text-primary" />
                </div>
                <h2 className="font-bold text-sm text-on-surface">Thời gian</h2>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant/60">Ngày khám</label>
                  <Popover>
                    <PopoverTrigger 
                      render={
                        <Button
                          variant={"outline"}
                          className={cn(
                            "h-10 w-full justify-start text-left font-medium rounded-xl bg-slate-50 border-transparent focus-visible:ring-primary/20 hover:bg-slate-100",
                            !date && "text-on-surface-variant/40"
                          )}
                        />
                      }
                    >
                      <CalendarDays className="mr-2 size-4" />
                      {date ? format(new Date(date), "dd/MM/yyyy") : <span>Chọn ngày khám</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date ? new Date(date) : undefined}
                        onSelect={(d) => setDate(d ? format(d, "yyyy-MM-dd") : "")}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface-variant/60">Bắt đầu</label>
                    <Select value={startTime} onValueChange={(val) => setStartTime(val || "")}>
                      <SelectTrigger className="h-10 text-sm font-medium rounded-xl bg-slate-50 border-transparent focus:ring-primary/20">
                        <SelectValue placeholder="Chọn giờ" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).flatMap((_, i) => [`${String(i).padStart(2, '0')}:00`, `${String(i).padStart(2, '0')}:30`]).filter(t => t >= "07:00" && t <= "18:00").map(time => (
                          <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface-variant/60">Kết thúc</label>
                    <Select value={endTime} onValueChange={(val) => setEndTime(val || "")}>
                      <SelectTrigger className="h-10 text-sm font-medium rounded-xl bg-slate-50 border-transparent focus:ring-primary/20">
                        <SelectValue placeholder="Chọn giờ" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).flatMap((_, i) => [`${String(i).padStart(2, '0')}:00`, `${String(i).padStart(2, '0')}:30`]).filter(t => t >= "07:00" && t <= "18:00").map(time => (
                          <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant/60">Phòng khám</label>
                  <Select value={room} onValueChange={(val) => setRoom(val || "")}>
                    <SelectTrigger className="h-10 text-sm font-medium rounded-xl bg-slate-50 border-transparent focus:ring-primary/20">
                      <SelectValue placeholder="Chọn phòng..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phòng Khám 01">Phòng Khám 01 (Tổng quát)</SelectItem>
                      <SelectItem value="Phòng Khám 02">Phòng Khám 02 (Chỉnh nha)</SelectItem>
                      <SelectItem value="Phòng Khám VIP">Phòng Khám VIP</SelectItem>
                      <SelectItem value="Phòng Phẫu Thuật">Phòng Phẫu Thuật</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Bệnh nhân */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <User className="size-4 text-emerald-600" />
                </div>
                <h2 className="font-bold text-sm text-on-surface">Bệnh nhân</h2>
              </div>

              {!selectedPatient ? (
                <SearchCombobox
                  items={patientItems}
                  value={null}
                  onSelect={(item) => setSelectedPatient(PATIENTS.find(p => p.id === item?.id) ?? null)}
                  placeholder="Tìm bệnh nhân..."
                  icon={User}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 flex-1 border border-outline-variant/5">
                      <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">
                        {selectedPatient.name.split(" ").slice(-1)[0][0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-on-surface truncate">{selectedPatient.name}</p>
                        <p className="text-[10px] text-on-surface-variant/60">Sinh: {selectedPatient.dob ? new Date(selectedPatient.dob).toLocaleDateString("vi-VN") : "---"}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedPatient(null)} className="ml-2 p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-on-surface-variant transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Phone className="size-3.5 text-on-surface-variant/40 shrink-0" />
                      <span className="font-medium text-on-surface">{selectedPatient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant truncate">
                      <Mail className="size-3.5 text-on-surface-variant/40 shrink-0" />
                      {selectedPatient.email}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                      <MapPin className="size-3.5 text-on-surface-variant/40 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{selectedPatient.address}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bác sĩ */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Stethoscope className="size-4 text-violet-600" />
                </div>
                <h2 className="font-bold text-sm text-on-surface">Bác sĩ</h2>
              </div>

              {!selectedDoctor ? (
                <SearchCombobox
                  items={doctorItems}
                  value={null}
                  onSelect={(item) => setSelectedDoctor(DOCTORS.find(d => d.id === item?.id) ?? null)}
                  placeholder="Tìm bác sĩ..."
                  icon={Stethoscope}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 flex-1 border border-outline-variant/5">
                      <div className="size-10 rounded-full bg-violet-100 flex items-center justify-center font-bold text-violet-700 text-sm shrink-0">
                        {selectedDoctor.name.replace("BS. ", "")[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-on-surface truncate">{selectedDoctor.name}</p>
                        <p className="text-[10px] text-violet-600 font-medium truncate">{selectedDoctor.specialty}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedDoctor(null)} className="ml-2 p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-on-surface-variant transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Phone className="size-3.5 text-on-surface-variant/40 shrink-0" />
                    <span className="font-medium text-on-surface">{selectedDoctor.phone}</span>
                  </div>

                  {dutyWarning && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-start gap-2 animate-in fade-in duration-200">
                      <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                      <span className="leading-normal">{dutyWarning}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ════ RIGHT (2 cols) ════ */}
          <div className="lg:col-span-2 space-y-4">

            {/* Dịch vụ & Chi phí */}
            <ServicesTable 
              items={items}
              setItems={setItems}
              discount={discount}
              setDiscount={setDiscount}
            />

            {/* Ghi chú */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <h2 className="font-bold text-sm text-on-surface">Ghi chú lâm sàng</h2>
              </div>
              <div className="p-6">
                <Textarea 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt..." 
                  className="min-h-[140px] bg-slate-50 border-0 rounded-xl focus-visible:ring-primary/20 p-4 resize-none text-sm leading-relaxed"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
