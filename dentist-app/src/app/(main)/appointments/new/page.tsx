"use client"

import { useState, useRef, useMemo } from "react"
import { Topbar } from "@/components/topbar"
import { FormSection } from "@/components/form-section"
import { SecurityCard } from "@/components/security-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Clock,
  Stethoscope,
  FileText,
  Calendar,
  CheckCircle2,
  Info,
  Search,
  X,
  Phone,
  Hash,
  MapPin,
  Mail,
  Tag,
  CreditCard,
  Plus,
  Trash2,
  CalendarDays,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// ─── Mock data ────────────────────────────────────────────────────────────────

const PATIENTS = [
  { id: "BN001", name: "Nguyễn Văn An",   phone: "0912 345 678", email: "nva@email.com", address: "123 Lê Lợi, Q.1, TP.HCM", dob: "1990-03-15" },
  { id: "BN002", name: "Trần Thị Bích",   phone: "0987 654 321", email: "ttb@email.com", address: "45 Nguyễn Huệ, Q.1, TP.HCM", dob: "1995-07-22" },
  { id: "BN003", name: "Lê Hoàng Cường",  phone: "0909 111 222", email: "lvc@email.com", address: "78 Trần Hưng Đạo, Q.5, TP.HCM", dob: "1988-11-03" },
  { id: "BN004", name: "Phạm Thị Dung",   phone: "0934 567 890", email: "ptd@email.com", address: "56 Võ Văn Tần, Q.3, TP.HCM", dob: "1985-02-28" },
]

const DOCTORS = [
  { id: "BS001", name: "BS. Julian Pierce",   specialty: "Cấy ghép Implant", phone: "0901 111 222" },
  { id: "BS002", name: "BS. Emily Thorne",    specialty: "Chỉnh nha", phone: "0902 222 333" },
  { id: "BS003", name: "BS. Phạm Quốc Dũng", specialty: "Nhổ răng & Phẫu thuật", phone: "0903 333 444" },
  { id: "BS004", name: "BS. Nguyễn Thị Lan", specialty: "Thẩm mỹ nha khoa", phone: "0904 444 555" },
]
const SERVICES = [
  { id: "DV001", name: "Khám tổng quát", price: { thuong: 300000, vip: 500000, khuyenmai: 250000 }, unit: "lần" },
  { id: "DV002", name: "X-quang panoramic", price: { thuong: 200000, vip: 300000, khuyenmai: 150000 }, unit: "lần" },
  { id: "DV003", name: "Nhổ răng khôn phẫu thuật", price: { thuong: 2500000, vip: 4000000, khuyenmai: 2000000 }, unit: "răng" },
  { id: "DV004", name: "Tẩy trắng Zoom Whitening", price: { thuong: 2500000, vip: 3500000, khuyenmai: 2000000 }, unit: "ca" },
  { id: "DV005", name: "Bọc răng sứ Zirconia", price: { thuong: 2500000, vip: 3000000, khuyenmai: 2200000 }, unit: "cái" },
  { id: "DV006", name: "Implant Straumann SLA", price: { thuong: 8000000, vip: 10000000, khuyenmai: 7000000 }, unit: "cái" },
  { id: "DV007", name: "Mắc cài kim loại", price: { thuong: 18000000, vip: 20000000, khuyenmai: 15000000 }, unit: "bộ" },
]

// ─── SearchCombobox component ─────────────────────────────────────────────────

interface ComboItem { id: string; name: string; sub?: string }

function SearchCombobox({
  items,
  value,
  onSelect,
  placeholder,
  icon: Icon,
  renderItem,
  containerClassName = "h-12 text-sm",
  iconClassName = "left-4 size-4",
  inputClassName = "pl-11 pr-10",
}: {
  items: ComboItem[]
  value: ComboItem | null
  onSelect: (item: ComboItem) => void
  placeholder: string
  icon: React.ElementType
  renderItem?: (item: ComboItem) => React.ReactNode
  containerClassName?: string
  iconClassName?: string
  inputClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(
    () =>
      items.filter(
        (it) =>
          it.name.toLowerCase().includes(query.toLowerCase()) ||
          (it.sub ?? "").toLowerCase().includes(query.toLowerCase()) ||
          it.id.toLowerCase().includes(query.toLowerCase())
      ),
    [items, query]
  )

  const handleSelect = (item: ComboItem) => {
    onSelect(item)
    setQuery("")
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(null as unknown as ComboItem)
    setQuery("")
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setQuery("")
      }}
    >
      <PopoverTrigger
        nativeButton={false}
        render={
          <div className={cn("relative bg-slate-50 rounded-xl border border-transparent focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 overflow-visible transition-all", containerClassName)} />
        }
      >
        <Icon className={cn("absolute top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none z-10", iconClassName)} />

        {/* Hiển thị item đã chọn */}
        {value && !open ? (
          <div className={cn("absolute inset-0 flex items-center", inputClassName)}>
            <span className="text-sm font-semibold text-on-surface truncate">{value.name}</span>
            {value.sub && (
              <span className="ml-2 text-xs text-on-surface-variant/60 truncate shrink-0">{value.sub}</span>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            value={query}
            onClick={(e) => { e.stopPropagation(); setOpen(true) }}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder={value ? value.name : placeholder}
            className={cn(
              "absolute inset-0 bg-transparent font-medium outline-none",
              inputClassName,
              value ? "placeholder:text-on-surface placeholder:font-semibold" : "placeholder:text-on-surface-variant/40"
            )}
          />
        )}

        {/* Nút X xóa */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-on-surface/10 hover:bg-on-surface/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="size-3 text-on-surface-variant" />
          </button>
        )}
        {!value && query && (
          <button
            onClick={(e) => { e.stopPropagation(); setQuery(""); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-on-surface/10 hover:bg-on-surface/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="size-3 text-on-surface-variant" />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-1.5 rounded-xl shadow-lg border border-outline-variant/15 bg-white"
        align="start"
        sideOffset={6}
      >
        {/* Inline search nếu đang có value đã chọn */}
        {value && (
          <div className="relative mb-1.5 px-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm khác..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-lg text-xs font-medium outline-none border border-transparent focus:border-primary/30"
            />
          </div>
        )}

        <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider px-2 py-1">
          Kết quả
        </div>

        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {suggestions.length === 0 ? (
            <div className="px-2 py-3 text-xs text-on-surface-variant/50 italic text-center">
              Không tìm thấy kết quả
            </div>
          ) : (
            suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors text-sm",
                  value?.id === item.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-slate-50 text-on-surface"
                )}
              >
                {renderItem ? renderItem(item) : (
                  <span className="font-medium">{item.name}</span>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewAppointmentPage() {
  const [selectedPatient, setSelectedPatient] = useState<(typeof PATIENTS)[0] | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<(typeof DOCTORS)[0] | null>(null)

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

  const patientItems: ComboItem[] = PATIENTS.map((p) => ({ id: p.id, name: p.name, sub: p.phone }))
  const doctorItems: ComboItem[] = DOCTORS.map((d) => ({ id: d.id, name: d.name, sub: d.specialty }))

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const finalPrice = Math.max(0, totalPrice - discount)

  const fmtCurrency = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)

  const addItem = () => {
    setItems(prev => [...prev, { id: Math.random().toString(), name: "", qty: 1, unit: "lần", price: 0, type: "thuong" }])
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it))
  }
  
  const updateItemFields = (id: string, updates: Partial<typeof items[0]>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...updates } : it))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id))
  }

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
                </>
              )}
            </div>
          </div>

          {/* ════ RIGHT (2 cols) ════ */}
          <div className="lg:col-span-2 space-y-4">

            {/* Dịch vụ & Chi phí */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="size-4 text-primary" />
                  <h2 className="font-bold text-sm text-on-surface">Dịch vụ & Chi phí</h2>
                </div>
                <Button onClick={addItem} variant="ghost" size="sm" className="h-8 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary rounded-lg border border-primary/20 bg-primary/5">
                  <Plus className="size-3.5 mr-1" />
                  Thêm dịch vụ
                </Button>
              </div>
              
              <div className="p-6 overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left border-b border-outline-variant/10">
                      <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 w-full">Dịch vụ / Vật tư</th>
                      <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 whitespace-nowrap pl-4 w-24 text-center">SL</th>
                      <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 text-right whitespace-nowrap pl-4 w-40">Đơn giá</th>
                      <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 text-right whitespace-nowrap pl-4 w-40">Thành tiền</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-on-surface-variant/40 italic bg-slate-50/50">
                          Chưa có dịch vụ nào được thêm. Nhấn "Thêm dịch vụ" để bắt đầu.
                        </td>
                      </tr>
                    ) : items.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-2.5 pr-4">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <SearchCombobox
                                items={SERVICES.map(s => ({ id: s.id, name: s.name }))}
                                value={item.name ? { id: item.id.toString(), name: item.name } : null}
                                onSelect={(selected) => {
                                  if (selected) {
                                    const svc = SERVICES.find(s => s.id === selected.id)
                                    if (svc) {
                                      const t = item.type || "thuong"
                                      updateItemFields(item.id, {
                                        name: svc.name,
                                        type: t,
                                        qty: 1,
                                        price: svc.price[t as keyof typeof svc.price]
                                      })
                                    }
                                  } else {
                                    updateItemFields(item.id, { name: "", price: 0, qty: 0 })
                                  }
                                }}
                                placeholder="Tìm dịch vụ..."
                                icon={Search}
                                containerClassName="h-9 text-xs rounded-lg"
                                iconClassName="left-3 size-3.5"
                                inputClassName="pl-9 pr-8"
                                renderItem={(s) => (
                                  <div className="flex items-center w-full">
                                    <span className="font-medium text-on-surface truncate">{s.name}</span>
                                  </div>
                                )}
                              />
                            </div>
                            <Select 
                              value={item.type} 
                              onValueChange={v => {
                                const svc = SERVICES.find(s => s.name === item.name)
                                if (svc) {
                                  updateItemFields(item.id, { type: v as any, price: svc.price[v as keyof typeof svc.price] })
                                } else {
                                  updateItem(item.id, "type", v)
                                }
                              }}
                            >
                              <SelectTrigger className="h-9 w-[110px] text-[10px] font-bold uppercase tracking-wider bg-slate-50 border-transparent focus:ring-primary/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="thuong">Thường</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="khuyenmai">Khuyến mãi</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="py-2.5 pl-4">
                          <Input 
                            type="number" 
                            min="1" 
                            value={item.qty || ""} 
                            onChange={e => updateItem(item.id, "qty", parseInt(e.target.value) || 0)} 
                            className="w-14 h-9 text-xs font-mono text-center bg-slate-50 border-transparent focus-visible:ring-primary/20"
                          />
                        </td>
                        <td className="py-2.5 pl-4 text-right text-xs font-mono font-medium text-on-surface-variant whitespace-nowrap">
                          {item.price > 0 ? fmtCurrency(item.price) : "—"}
                        </td>
                        <td className="py-2.5 pl-4 text-right text-xs font-bold text-on-surface whitespace-nowrap">
                          {fmtCurrency(item.price * item.qty)}
                        </td>
                        <td className="py-2.5 pl-2 text-right">
                          <button onClick={() => removeItem(item.id)} className="p-2 text-on-surface-variant/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="px-6 pb-6 pt-2 mt-auto">
                <div className="rounded-2xl bg-slate-50 p-5 space-y-3 w-full sm:w-[320px] ml-auto border border-outline-variant/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant/60 font-medium">Tổng dịch vụ</span>
                    <span className="font-bold">{fmtCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-600 font-medium">Giảm giá</span>
                    <Input 
                      type="number" 
                      min="0"
                      step="50000"
                      value={discount || ""} 
                      onChange={e => setDiscount(parseInt(e.target.value) || 0)} 
                      placeholder="0"
                      className="h-8 w-28 text-xs font-mono text-right bg-white border-outline-variant/20 focus-visible:ring-primary/20 text-emerald-700 font-bold"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold border-t border-outline-variant/10 pt-3 mt-3">
                    <span className="text-on-surface uppercase tracking-wider text-[10px]">Tổng thanh toán</span>
                    <span className="text-primary text-base">{fmtCurrency(finalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

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
