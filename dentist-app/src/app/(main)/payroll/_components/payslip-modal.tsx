"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { APPOINTMENTS, getAppointmentDetail } from "@/lib/appointments-data"
import { DoctorPayrollItem, calcAptDuration, getMappedDoctorName } from "@/lib/payroll-data"
import { fmtCurrency } from "@/lib/date-utils"
import { toast } from "sonner"
import {
  Printer,
  Download,
  Calendar,
  User,
  Activity,
  FileText,
  Clock,
  Coins,
} from "lucide-react"

interface PayslipModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  payroll: DoctorPayrollItem | null
  yearMonth: string
  hourlyRate: number
}

export function PayslipModal({
  isOpen,
  onOpenChange,
  payroll,
  yearMonth,
  hourlyRate,
}: PayslipModalProps) {
  
  // Resolve appointments for this doctor in this month
  const doctorAppointments = useMemo(() => {
    if (!payroll) return []
    const searchName = getMappedDoctorName(payroll.name)
    return APPOINTMENTS.filter((a) => {
      const isCompleted = a.status === "completed"
      const isDoctorMatch = a.doctor.toLowerCase().includes(searchName.toLowerCase()) || 
                            searchName.toLowerCase().includes(a.doctor.toLowerCase())
      const isInMonth = a.date.startsWith(yearMonth)
      return isCompleted && isDoctorMatch && isInMonth
    }).map(a => getAppointmentDetail(a.id))
  }, [payroll, yearMonth])

  if (!payroll) return null

  const handleExport = () => {
    toast.success(`Đã xuất phiếu lương của bác sĩ ${payroll.name} thành công dưới dạng PDF.`)
  }

  const handlePrint = () => {
    toast.success(`Đang gửi lệnh in phiếu lương cho bác sĩ ${payroll.name}...`)
  }

  const [year, month] = yearMonth.split("-")
  const dateFormatted = `Tháng ${month}/${year}`

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-900">
            <Coins className="size-5 text-violet-500" />
            Chi Tiết Phiếu Lương
          </DialogTitle>
          <DialogDescription>
            Bảng chi tiết lương thực lĩnh của bác sĩ {payroll.name} - {dateFormatted}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* General Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin bác sĩ</h3>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">{payroll.name}</p>
                <p className="text-xs text-slate-500 font-semibold">{payroll.role} · Chuyên môn: {payroll.degree}</p>
                <p className="text-xs text-on-surface-variant/70">Hệ số lương làm thêm: <span className="font-bold text-primary">{payroll.coefficient}</span></p>
              </div>
            </div>

            {/* Total Pay Slip */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 space-y-2">
              <h3 className="text-xs font-bold text-blue-800/60 uppercase tracking-wider">Tổng thực lĩnh</h3>
              <div className="flex justify-between items-end">
                <p className="text-2xl font-extrabold text-blue-900 leading-none">{fmtCurrency(payroll.netSalary)}</p>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Thực nhận</span>
              </div>
              <p className="text-[10px] text-slate-400">Đã khấu trừ bảo hiểm & thuế TNCN (10%).</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" />
              Chi tiết khoản lương
            </h4>
            <div className="rounded-xl border border-outline-variant/10 overflow-hidden text-xs">
              <div className="grid grid-cols-2 p-3 bg-slate-50 border-b border-outline-variant/10 font-bold text-slate-500">
                <span>Khoản mục</span>
                <span className="text-right">Số tiền (VND)</span>
              </div>
              <div className="divide-y divide-outline-variant/5">
                <div className="grid grid-cols-2 p-3">
                  <span className="text-slate-600 font-medium">Lương cơ bản</span>
                  <span className="text-right font-bold text-slate-800">{fmtCurrency(payroll.baseSalary)}</span>
                </div>
                <div className="grid grid-cols-2 p-3 bg-slate-50/30">
                  <div>
                    <span className="text-slate-600 font-medium">Lương làm thêm ngoài giờ</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">({payroll.appointmentsCount} ca · {payroll.overtimeHours.toFixed(1)} giờ)</p>
                  </div>
                  <span className="text-right font-bold text-slate-800">+{fmtCurrency(payroll.overtimePay)}</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="text-slate-600 font-medium">Phụ cấp chức danh</span>
                  <span className="text-right font-bold text-slate-800">+{fmtCurrency(payroll.allowance)}</span>
                </div>
                <div className="grid grid-cols-2 p-3 bg-red-50/30">
                  <span className="text-red-700 font-medium">Khấu trừ (10% Thuế & BH)</span>
                  <span className="text-right font-bold text-red-600">-{fmtCurrency(payroll.deduction)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Breakdown List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="size-3.5 text-violet-500" />
              Danh sách ca khám hoàn thành trong tháng
            </h4>
            <div className="rounded-xl border border-outline-variant/10 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="px-4 py-3">Mã ca</th>
                    <th className="px-4 py-3">Ngày</th>
                    <th className="px-4 py-3">Bệnh nhân</th>
                    <th className="px-4 py-3">Dịch vụ</th>
                    <th className="px-4 py-3 text-center">Số giờ</th>
                    <th className="px-4 py-3 text-right">Tạm tính</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {doctorAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                        Không có ca khám hoàn thành trong tháng này.
                      </td>
                    </tr>
                  ) : (
                    doctorAppointments.map((apt) => {
                      const duration = calcAptDuration(apt.start, apt.end)
                      const aptPay = payroll.coefficient * hourlyRate * duration
                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-500">{apt.id}</td>
                          <td className="px-4 py-2.5">
                            {new Date(apt.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-slate-700">{apt.patient}</td>
                          <td className="px-4 py-2.5 text-slate-600 truncate max-w-[120px]">{apt.service}</td>
                          <td className="px-4 py-2.5 text-center font-mono font-medium">{duration.toFixed(1)} h</td>
                          <td className="px-4 py-2.5 text-right font-bold text-emerald-600">+{fmtCurrency(aptPay)}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handlePrint} className="rounded-xl border-outline-variant/30 text-slate-700 gap-1.5 text-xs font-semibold">
            <Printer className="size-4" /> In phiếu lương
          </Button>
          <Button variant="outline" onClick={handleExport} className="rounded-xl border-outline-variant/30 text-slate-700 gap-1.5 text-xs font-semibold">
            <Download className="size-4" /> Xuất PDF
          </Button>
          <Button onClick={() => onOpenChange(false)} className="rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-semibold px-5 border-transparent">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
