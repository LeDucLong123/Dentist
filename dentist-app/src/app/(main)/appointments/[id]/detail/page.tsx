"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Topbar } from "@/components/topbar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { vi } from "date-fns/locale/vi"
import { cn } from "@/lib/utils"
import { getAppointmentDetail } from "@/lib/appointments-data"
import {
  ChevronRight,
  Clock,
  CalendarDays,
  User,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  FileText,
  Tag,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowRightLeft,
  BadgeCheck,
} from "lucide-react"

// ─── Status ───────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  confirmed:   { label: "Đã xác nhận",  bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  scheduled:   { label: "Chờ xác nhận", bg: "bg-blue-50",    text: "text-blue-700",    icon: AlertCircle },
  rescheduled: { label: "Yêu cầu đổi",  bg: "bg-amber-50",   text: "text-amber-700",   icon: ArrowRightLeft },
  completed:   { label: "Hoàn thành",   bg: "bg-slate-50",   text: "text-slate-600",   icon: BadgeCheck },
  cancelled:   { label: "Đã hủy",       bg: "bg-red-50",     text: "text-red-600",     icon: AlertCircle },
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const initialApt = getAppointmentDetail(id)
  
  const [apt, setApt] = useState(initialApt)

  // Reschedule dialog states
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(initialApt?.date ? new Date(initialApt.date) : undefined)
  const [rescheduleStartTime, setRescheduleStartTime] = useState(initialApt?.start || "09:00")
  const [rescheduleEndTime, setRescheduleEndTime] = useState(initialApt?.end || "10:00")
  const [rescheduleRoom, setRescheduleRoom] = useState(initialApt?.room || "P.01")
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean
    title: string
    description: string
    action: () => void
    variant?: "destructive" | "default"
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: () => {},
  })

  if (!apt) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        Không tìm thấy lịch khám #{id}
      </div>
    )
  }

  const handleReschedule = () => {
    setApt({
      ...apt,
      date: rescheduleDate ? format(rescheduleDate, "yyyy-MM-dd") : apt.date,
      start: rescheduleStartTime,
      end: rescheduleEndTime,
      room: rescheduleRoom,
      status: "rescheduled"
    })
    setIsRescheduleOpen(false)
  }

  const s = STATUS_MAP[apt.status] ?? STATUS_MAP.scheduled
  const StatusIcon = s.icon
  const total = apt.price - apt.discount
  const remaining = total - apt.paid

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50 mb-6">
          <Link href="/appointments" className="hover:text-primary transition-colors">Lịch khám</Link>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Chi tiết #{apt.id}</span>
        </nav>

        {/* Header strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold", s.bg, s.text)}>
                <StatusIcon className="size-3" />
                {s.label}
              </span>
              <span className="text-xs font-mono text-on-surface-variant/50">#{apt.id}</span>
            </div>
            <h1 className="text-xl font-bold text-on-surface">Ca khám: {apt.service}</h1>
          </div>
          <div className="flex items-center gap-2">
            {apt.status === "scheduled" && (
              <Button 
                onClick={() => setConfirmAction({
                  isOpen: true,
                  title: "Xác nhận lịch khám",
                  description: "Bạn có chắc chắn muốn xác nhận lịch khám này? Bệnh nhân sẽ nhận được thông báo xác nhận.",
                  action: () => { setApt({ ...apt, status: "confirmed" }); setConfirmAction(prev => ({ ...prev, isOpen: false })) }
                })}
                className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-sm font-semibold border-transparent"
              >
                <CheckCircle2 className="size-4" />
                Xác nhận
              </Button>
            )}
            {apt.status === "confirmed" && (
              <Button 
                onClick={() => setConfirmAction({
                  isOpen: true,
                  title: "Hoàn thành ca khám",
                  description: "Đánh dấu ca khám đã hoàn tất? Bạn sẽ không thể thay đổi thông tin hóa đơn sau khi hoàn thành.",
                  action: () => { setApt({ ...apt, status: "completed" }); setConfirmAction(prev => ({ ...prev, isOpen: false })) }
                })}
                className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-sm font-semibold border-transparent"
              >
                <BadgeCheck className="size-4" />
                Hoàn thành
              </Button>
            )}
            {apt.status !== "completed" && apt.status !== "cancelled" && (
              <Button 
                onClick={() => setIsRescheduleOpen(true)}
                variant="outline" 
                className="h-9 rounded-xl border-outline-variant/30 text-on-surface-variant gap-1.5 text-sm font-semibold hover:text-primary hover:border-primary/30"
              >
                <ArrowRightLeft className="size-4 text-violet-500" />
                Đổi lịch
              </Button>
            )}
            {apt.status !== "completed" && apt.status !== "cancelled" && (
              <Button 
                onClick={() => setConfirmAction({
                  isOpen: true,
                  title: "Hủy lịch khám",
                  description: "Bạn có chắc chắn muốn hủy lịch khám này? Hành động này không thể hoàn tác.",
                  action: () => { setApt({ ...apt, status: "cancelled" }); setConfirmAction(prev => ({ ...prev, isOpen: false })) },
                  variant: "destructive"
                })}
                variant="outline" 
                className="h-9 rounded-xl border-red-200 text-red-500 gap-1.5 text-sm font-semibold hover:bg-red-50"
              >
                <Trash2 className="size-4" />
                Hủy lịch
              </Button>
            )}
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ════ LEFT ════ */}
          <div className="lg:col-span-1 space-y-4">

            {/* Thời gian */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="size-4 text-primary" />
                </div>
                <h2 className="font-bold text-sm text-on-surface">Thời gian</h2>
              </div>
              <div className="space-y-0">
                {[
                  { label: "Ngày khám", value: apt.date ? new Date(apt.date).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "---" },
                  { label: "Giờ bắt đầu", value: apt.start, icon: Clock },
                  { label: "Giờ kết thúc", value: apt.end, icon: Clock },
                  { label: "Phòng khám", value: apt.room, icon: MapPin, highlight: true },
                ].map(({ label, value, icon: Icon, highlight }, i, arr) => (
                  <div key={label} className={cn("flex items-center justify-between py-2.5", i < arr.length - 1 && "border-b border-outline-variant/10")}>
                    <span className="text-xs text-on-surface-variant/60 font-medium flex items-center gap-1">
                      {Icon && <Icon className="size-3" />}
                      {label}
                    </span>
                    <span className={cn("text-xs font-bold", highlight ? "text-primary" : "text-on-surface")}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bệnh nhân */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <User className="size-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-on-surface">Bệnh nhân</h2>
                  <span className="text-[10px] text-on-surface-variant/50 font-mono">{apt.patientId}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50">
                <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">
                  {apt.patient.split(" ").slice(-1)[0][0]}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{apt.patient}</p>
                  <p className="text-[10px] text-on-surface-variant/60">
                    {apt.patientDob ? `Sinh: ${new Date(apt.patientDob).toLocaleDateString("vi-VN")}` : ""}
                  </p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <Phone className="size-3.5 text-on-surface-variant/40 shrink-0" />
                  {apt.patientPhone}
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant truncate">
                  <Mail className="size-3.5 text-on-surface-variant/40 shrink-0" />
                  {apt.patientEmail}
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                  <MapPin className="size-3.5 text-on-surface-variant/40 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{apt.patientAddress}</span>
                </div>
              </div>
            </div>

            {/* Bác sĩ */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Stethoscope className="size-4 text-violet-600" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-on-surface">Bác sĩ</h2>
                  <span className="text-[10px] text-on-surface-variant/50 font-mono">{apt.doctorId}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50">
                <div className="size-10 rounded-full bg-violet-100 flex items-center justify-center font-bold text-violet-700 text-sm shrink-0">
                  {apt.doctor.replace("BS. ", "")[0]}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{apt.doctor}</p>
                  <p className="text-[10px] text-violet-600 font-medium">{apt.doctorSpecialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Phone className="size-3.5 text-on-surface-variant/40 shrink-0" />
                {apt.doctorPhone}
              </div>
            </div>
          </div>

          {/* ════ RIGHT ════ */}
          <div className="lg:col-span-2 space-y-4">

            {/* Dịch vụ & Chi phí */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex items-center gap-2">
                <Tag className="size-4 text-primary" />
                <h2 className="font-bold text-sm text-on-surface">Dịch vụ & Chi phí</h2>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-outline-variant/10">
                      <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 w-full">Dịch vụ / Vật tư</th>
                      <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 text-right whitespace-nowrap pl-4">SL</th>
                      <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 text-right whitespace-nowrap pl-4">Đơn giá</th>
                      <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 text-right whitespace-nowrap pl-4">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {apt.items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-xs text-on-surface-variant/40 italic">Chưa có thông tin dịch vụ</td>
                      </tr>
                    ) : apt.items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="text-sm font-medium text-on-surface flex items-center gap-2">
                            {item.name}
                            {item.type === "vip" && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">VIP</span>}
                            {item.type === "thuong" && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Thường</span>}
                            {item.type === "khuyenmai" && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Khuyến mãi</span>}
                          </p>
                          <p className="text-[10px] text-on-surface-variant/50">{item.unit}</p>
                        </td>
                        <td className="py-3 pl-4 text-right text-xs font-mono text-on-surface whitespace-nowrap">{item.qty}</td>
                        <td className="py-3 pl-4 text-right text-xs font-mono text-on-surface whitespace-nowrap">{fmtCurrency(item.price)}</td>
                        <td className="py-3 pl-4 text-right text-xs font-bold text-on-surface whitespace-nowrap">{fmtCurrency(item.price * item.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="px-6 pb-6 pt-0">
                <div className="rounded-xl bg-slate-50 p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant/60">Tổng dịch vụ</span>
                    <span className="font-semibold">{fmtCurrency(apt.price)}</span>
                  </div>
                  {apt.discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span>Giảm giá</span>
                      <span className="font-semibold">- {fmtCurrency(apt.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-outline-variant/10 pt-2">
                    <span className="text-on-surface">Tổng thanh toán</span>
                    <span className="text-primary">{fmtCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant/60">Đã thanh toán</span>
                    <span className="font-semibold text-emerald-600">{fmtCurrency(apt.paid)}</span>
                  </div>
                  <div className={cn(
                    "flex justify-between text-xs font-bold rounded-lg px-3 py-2 mt-1",
                    remaining > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                  )}>
                    <span className="flex items-center gap-1">
                      <CreditCard className="size-3" />
                      {remaining > 0 ? "Còn nợ" : "Đã thanh toán đủ"}
                    </span>
                    <span>{remaining > 0 ? fmtCurrency(remaining) : "✓"}</span>
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
                {apt.note ? (
                  <div className="flex gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 leading-relaxed">{apt.note}</p>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant/40 italic">Không có ghi chú</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đổi lịch khám</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/60">Ngày khám mới</label>
              <Popover>
                <PopoverTrigger 
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "h-10 w-full justify-start text-left font-medium rounded-xl bg-slate-50 border-transparent focus-visible:ring-primary/20",
                        !rescheduleDate && "text-on-surface-variant/40"
                      )}
                    />
                  }
                >
                  <CalendarDays className="mr-2 size-4" />
                  {rescheduleDate ? format(rescheduleDate, "dd/MM/yyyy") : <span>Chọn ngày khám</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={(d) => d && setRescheduleDate(d)}
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant/60">Giờ bắt đầu</label>
                <Select value={rescheduleStartTime} onValueChange={(v) => v && setRescheduleStartTime(v)}>
                  <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent">
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant/60">Giờ kết thúc</label>
                <Select value={rescheduleEndTime} onValueChange={(v) => v && setRescheduleEndTime(v)}>
                  <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent">
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    {["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/60">Phòng (Tuỳ chọn)</label>
              <Select value={rescheduleRoom} onValueChange={(v) => v && setRescheduleRoom(v)}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent">
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>
                <SelectContent>
                  {["P.01", "P.02", "P.03", "P.04", "Phòng Phẫu Thuật"].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleReschedule} className="rounded-xl bg-primary text-white hover:bg-primary/90">Xác nhận đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmAction.isOpen} onOpenChange={(open) => setConfirmAction(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{confirmAction.title}</DialogTitle>
            <DialogDescription>{confirmAction.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmAction(prev => ({ ...prev, isOpen: false }))} className="rounded-xl">Hủy</Button>
            <Button 
              onClick={confirmAction.action} 
              className={cn("rounded-xl text-white", confirmAction.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90")}
            >
              Đồng ý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
