"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { Topbar } from "@/components/topbar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getAppointmentDetail, updateAppointmentDetail } from "@/lib/appointments-data"
import { fmtCurrency } from "@/lib/date-utils"
import { StatusBadge } from "@/components/status-badge"
import { RescheduleDialog } from "./_components/reschedule-dialog"
import { AddServiceDialog } from "./_components/add-service-dialog"
import { PaymentDialog } from "./_components/payment-dialog"
import { ClinicalExamForm } from "./_components/clinical-exam-form"
import {
  ChevronRight,
  Clock,
  CalendarDays,
  User,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Tag,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowRightLeft,
  BadgeCheck,
  Activity,
  Plus,
} from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Đã xác nhận",
  scheduled: "Chờ xác nhận",
  checked_in: "Đã tiếp đón",
  examining: "Đang khám",
  rescheduled: "Yêu cầu đổi",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const initialApt = getAppointmentDetail(id)
  
  const [apt, setApt] = useState(initialApt)

  // Modals visibility states
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

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

  // Clinical Exam states
  const [examSymptoms, setExamSymptoms] = useState("")
  const [examDiagnosis, setExamDiagnosis] = useState("")
  const [examPrescription, setExamPrescription] = useState("")
  const [examNote, setExamNote] = useState("")

  // Sync clinical exam inputs when apt changes
  useEffect(() => {
    if (apt) {
      setExamSymptoms(apt.symptoms || "")
      setExamDiagnosis(apt.diagnosis || "")
      setExamPrescription(apt.prescription || "")
      setExamNote(apt.note || "")
    }
  }, [apt])

  if (!apt) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        Không tìm thấy lịch khám #{id}
      </div>
    )
  }

  const handleReschedule = (date: Date | undefined, startTime: string, endTime: string, room: string) => {
    const nextDate = date ? format(date, "yyyy-MM-dd") : apt.date
    updateAppointmentDetail(apt.id, {
      date: nextDate,
      start: startTime,
      end: endTime,
      room: room,
      status: "rescheduled"
    })
    setApt(getAppointmentDetail(apt.id))
    setIsRescheduleOpen(false)
  }

  const handleAddService = (item: { name: string; qty: number; unit: string; price: number; type: "vip" | "thuong" | "khuyenmai" }) => {
    const updatedItems = [...apt.items, item]
    const updatedPrice = apt.price + (item.price * item.qty)
    
    updateAppointmentDetail(apt.id, {
      items: updatedItems,
      price: updatedPrice
    })
    setApt(getAppointmentDetail(apt.id))
    setIsAddServiceOpen(false)
  }

  const handleConfirmPayment = (amount: number, method: string) => {
    if (amount <= 0) return
    const newPaid = apt.paid + amount
    const newPayment = {
      date: format(new Date(), "yyyy-MM-dd HH:mm"),
      amount: amount,
      method: method
    }
    const updatedPayments = [...(apt.payments || []), newPayment]

    updateAppointmentDetail(apt.id, {
      paid: newPaid,
      payments: updatedPayments
    })
    setApt(getAppointmentDetail(apt.id))
    setIsPaymentOpen(false)
  }

  const handleCompleteExamClick = () => {
    setConfirmAction({
      isOpen: true,
      title: "Lưu hồ sơ & Hoàn tất khám",
      description: "Xác nhận lưu toàn bộ hồ sơ lâm sàng và hoàn tất ca khám? Ca khám sẽ chuyển sang trạng thái Hoàn thành (chờ thanh toán).",
      action: () => {
        updateAppointmentDetail(apt.id, {
          status: "completed",
          symptoms: examSymptoms,
          diagnosis: examDiagnosis,
          prescription: examPrescription,
          note: examNote
        })
        setApt(getAppointmentDetail(apt.id))
        setConfirmAction(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const total = apt.price - apt.discount
  const remaining = total - apt.paid
  const isActionable = apt.status === "scheduled" || apt.status === "confirmed" || apt.status === "rescheduled"
  const statusLabel = STATUS_LABELS[apt.status] || apt.status

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
              <StatusBadge status={apt.status} variant="icon" />
              <span className="text-xs font-mono text-on-surface-variant/50">#{apt.id}</span>
            </div>
            <h1 className="text-xl font-bold text-on-surface">Ca khám: {apt.service}</h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tiếp đón: Scheduled / Confirmed / Rescheduled */}
              {(apt.status === "scheduled" || apt.status === "confirmed" || apt.status === "rescheduled") && (
                <Button 
                  onClick={() => setConfirmAction({
                    isOpen: true,
                    title: "Tiếp đón bệnh nhân",
                    description: "Xác nhận bệnh nhân đã có mặt tại phòng khám và sẵn sàng chờ khám?",
                    action: () => {
                      updateAppointmentDetail(apt.id, { status: "checked_in" })
                      setApt(getAppointmentDetail(apt.id))
                      setConfirmAction(prev => ({ ...prev, isOpen: false }))
                    }
                  })}
                  className="h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-sm font-semibold border-transparent"
                >
                  <CheckCircle2 className="size-4" />
                  Tiếp đón
                </Button>
              )}

              {/* Bắt đầu khám: checked_in */}
              {apt.status === "checked_in" && (
                <Button 
                  onClick={() => setConfirmAction({
                    isOpen: true,
                    title: "Bắt đầu khám bệnh",
                    description: "Bắt đầu tiến hành khám và cập nhật hồ sơ lâm sàng cho bệnh nhân?",
                    action: () => {
                      updateAppointmentDetail(apt.id, { status: "examining" })
                      setApt(getAppointmentDetail(apt.id))
                      setConfirmAction(prev => ({ ...prev, isOpen: false }))
                    }
                  })}
                  className="h-9 rounded-xl bg-pink-600 hover:bg-pink-700 text-white gap-1.5 text-sm font-semibold border-transparent"
                >
                  <Activity className="size-4" />
                  Bắt đầu khám
                </Button>
              )}

              {/* Hoàn tất khám: examining */}
              {apt.status === "examining" && (
                <Button 
                  onClick={handleCompleteExamClick}
                  className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-sm font-semibold border-transparent"
                >
                  <BadgeCheck className="size-4" />
                  Hoàn tất khám
                </Button>
              )}

              {/* Đổi lịch */}
              <Button 
                disabled={!isActionable}
                onClick={() => setIsRescheduleOpen(true)}
                variant="outline" 
                className="h-9 rounded-xl border-outline-variant/30 text-on-surface-variant gap-1.5 text-sm font-semibold hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRightLeft className="size-4 text-violet-500" />
                Đổi lịch
              </Button>

              {/* Hủy lịch */}
              <Button 
                disabled={!isActionable}
                onClick={() => setConfirmAction({
                  isOpen: true,
                  title: "Hủy lịch khám",
                  description: "Bạn có chắc chắn muốn hủy lịch khám này? Hành động này không thể hoàn tác.",
                  action: () => {
                    updateAppointmentDetail(apt.id, { status: "cancelled" })
                    setApt(getAppointmentDetail(apt.id))
                    setConfirmAction(prev => ({ ...prev, isOpen: false }))
                  },
                  variant: "destructive"
                })}
                variant="outline" 
                className="h-9 rounded-xl border-red-200 text-red-500 gap-1.5 text-sm font-semibold hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <Trash2 className="size-4" />
                Hủy lịch
              </Button>
            </div>
            {/* Warning block */}
            <div className="text-[11px] text-on-surface-variant/60 flex items-center gap-2 flex-wrap justify-end">
              {!isActionable && (
                <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200/50 flex items-center gap-1">
                  <AlertCircle className="size-3 text-red-500 shrink-0" />
                  Không thể đổi/hủy lịch ở trạng thái: {statusLabel}
                </span>
              )}
              <span className="font-medium text-on-surface-variant/40">
                * Chỉ đổi/hủy lịch ở trạng thái: Chờ xác nhận, Đã xác nhận, Yêu cầu đổi.
              </span>
            </div>
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
              <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="size-4 text-primary" />
                  <h2 className="font-bold text-sm text-on-surface">Dịch vụ & Chi phí</h2>
                </div>
                {apt.status === "examining" && (
                  <Button 
                    onClick={() => setIsAddServiceOpen(true)}
                    size="sm"
                    className="h-8 rounded-lg bg-primary hover:bg-primary/95 text-white gap-1 text-xs font-semibold border-transparent"
                  >
                    <Plus className="size-3" />
                    Thêm dịch vụ
                  </Button>
                )}
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
                    "flex justify-between items-center text-xs font-bold rounded-lg px-3 py-2 mt-1",
                    remaining > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                  )}>
                    <span className="flex items-center gap-1">
                      <CreditCard className="size-3" />
                      {remaining > 0 ? "Còn nợ" : "Đã thanh toán đủ"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{remaining > 0 ? fmtCurrency(remaining) : "✓"}</span>
                      {apt.status === "completed" && remaining > 0 && (
                        <Button 
                          onClick={() => setIsPaymentOpen(true)}
                          size="sm" 
                          className="h-6 px-2 text-[10px] rounded bg-emerald-600 hover:bg-emerald-750 text-white font-bold border-transparent"
                        >
                          Thanh toán
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lịch sử thanh toán */}
                {apt.payments && apt.payments.length > 0 && (
                  <div className="mt-4 border-t border-outline-variant/10 pt-4">
                    <h3 className="text-xs font-bold text-on-surface mb-2">Lịch sử thanh toán</h3>
                    <div className="space-y-1.5">
                      {apt.payments.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] bg-slate-50 p-2 rounded-lg">
                          <span className="text-on-surface-variant/70">{p.date} ({p.method})</span>
                          <span className="font-bold text-emerald-600">+{fmtCurrency(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ghi chú */}
            <ClinicalExamForm
              status={apt.status}
              symptoms={examSymptoms}
              setSymptoms={setExamSymptoms}
              diagnosis={examDiagnosis}
              setDiagnosis={setExamDiagnosis}
              prescription={examPrescription}
              setPrescription={setExamPrescription}
              note={examNote}
              setNote={setExamNote}
            />
          </div>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <RescheduleDialog
        key={apt.date + "-" + apt.start + "-" + apt.end + "-" + isRescheduleOpen}
        isOpen={isRescheduleOpen}
        onOpenChange={setIsRescheduleOpen}
        initialDate={apt.date}
        initialStart={apt.start}
        initialEnd={apt.end}
        initialRoom={apt.room}
        onConfirm={handleReschedule}
      />

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

      {/* Add Service Dialog */}
      <AddServiceDialog
        key={apt.items.length + "-" + isAddServiceOpen}
        isOpen={isAddServiceOpen}
        onOpenChange={setIsAddServiceOpen}
        onConfirm={handleAddService}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        key={remaining + "-" + isPaymentOpen}
        isOpen={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        total={total}
        paid={apt.paid}
        remaining={remaining}
        onConfirm={handleConfirmPayment}
      />
    </>
  )
}
