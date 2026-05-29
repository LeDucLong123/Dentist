"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Topbar } from "@/components/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { initialDoctors } from "@/app/(main)/doctors/page"
import {
  DEFAULT_PAYROLL_CONFIG,
  PayrollConfig,
  getDoctorPayroll,
  calcAptDuration,
  getMappedDoctorName
} from "@/lib/payroll-data"
import { fmtCurrency } from "@/lib/date-utils"
import { PayslipModal } from "./_components/payslip-modal"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Coins,
  ChevronRight,
  Calculator,
  Calendar,
  Settings,
  Users,
  Clock,
  TrendingUp,
  CreditCard,
  CheckCircle,
  FileSpreadsheet,
  Plus,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
} from "lucide-react"

interface PayrollPeriod {
  id: string              // Định dạng "YYYY-MM"
  name: string            // Định dạng "Tháng MM/YYYY"
  startDate: string
  endDate: string
  status: "draft" | "closed"
  closedAt?: string
  closedBy?: string
  config: PayrollConfig
  items?: any[]           // Lưu trữ danh sách tính toán lương cố định khi chốt
}

const defaultPeriods = (docs: any[]): PayrollPeriod[] => [
  {
    id: "2026-03",
    name: "Tháng 03/2026",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    status: "closed",
    closedAt: "2026-04-05T10:00:00Z",
    closedBy: "Kế toán trưởng",
    config: DEFAULT_PAYROLL_CONFIG,
    items: docs.map((doc) => getDoctorPayroll(doc, "2026-03", DEFAULT_PAYROLL_CONFIG))
  },
  {
    id: "2026-04",
    name: "Tháng 04/2026",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "closed",
    closedAt: "2026-05-05T09:30:00Z",
    closedBy: "Kế toán trưởng",
    config: DEFAULT_PAYROLL_CONFIG,
    items: docs.map((doc) => getDoctorPayroll(doc, "2026-04", DEFAULT_PAYROLL_CONFIG))
  },
  {
    id: "2026-05",
    name: "Tháng 05/2026",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    status: "draft",
    config: DEFAULT_PAYROLL_CONFIG
  }
]

export default function PayrollPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([])
  const [selectedPeriodId, setSelectedPeriodId] = useState("2026-05")
  const [selectedDocPayroll, setSelectedDocPayroll] = useState<any | null>(null)
  const [isPayslipOpen, setIsPayslipOpen] = useState(false)
  
  // Dialog/Modal states
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newMonth, setNewMonth] = useState("2026-06")

  // Load periods from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("payroll-periods")
      if (saved) {
        const parsed = JSON.parse(saved)
        // Safe migration to ensure weekendCoef exists in loaded configs
        const migrated = parsed.map((p: any) => ({
          ...p,
          config: {
            ...DEFAULT_PAYROLL_CONFIG,
            ...p.config,
            coefDegree: {
              ...DEFAULT_PAYROLL_CONFIG.coefDegree,
              ...(p.config?.coefDegree || {})
            }
          }
        }))
        setPeriods(migrated)
        localStorage.setItem("payroll-periods", JSON.stringify(migrated))
      } else {
        const initial = defaultPeriods(initialDoctors)
        setPeriods(initial)
        localStorage.setItem("payroll-periods", JSON.stringify(initial))
      }
    } catch {
      setPeriods(defaultPeriods(initialDoctors))
    }
  }, [])

  // Find currently selected period
  const selectedPeriod = useMemo(() => {
    return periods.find((p) => p.id === selectedPeriodId) || periods[periods.length - 1]
  }, [periods, selectedPeriodId])

  // Get config of selected period (fallback to default if undefined)
  const config = useMemo(() => {
    return selectedPeriod?.config || DEFAULT_PAYROLL_CONFIG
  }, [selectedPeriod])

  // Save config changes for draft periods
  const handleConfigChange = (updated: Partial<PayrollConfig>) => {
    if (!selectedPeriod || selectedPeriod.status === "closed") return
    
    const nextConfig = { ...selectedPeriod.config, ...updated }
    const nextPeriods = periods.map((p) => {
      if (p.id === selectedPeriod.id) {
        return { ...p, config: nextConfig }
      }
      return p
    })
    
    setPeriods(nextPeriods)
    try {
      localStorage.setItem("payroll-periods", JSON.stringify(nextPeriods))
    } catch {}
  }

  const handleCoefChange = (degree: string, value: number) => {
    const nextCoefs = { ...config.coefDegree, [degree]: value }
    handleConfigChange({ coefDegree: nextCoefs })
  }

  const handleWeekendCoefChange = (value: number) => {
    handleConfigChange({ weekendCoef: value })
  }

  const handleBaseSalaryChange = (role: string, value: number) => {
    const nextBase = { ...config.baseSalaries, [role]: value }
    handleConfigChange({ baseSalaries: nextBase })
  }

  // Calculate or retrieve payroll items
  const payrollItems = useMemo(() => {
    if (!selectedPeriod) return []
    if (selectedPeriod.status === "closed" && selectedPeriod.items) {
      return selectedPeriod.items
    }
    // Draft: Calculate dynamically with current config
    return initialDoctors.map((doc) => getDoctorPayroll(doc, selectedPeriod.id, selectedPeriod.config))
  }, [selectedPeriod])

  // Aggregate stats
  const stats = useMemo(() => {
    let totalNet = 0
    let totalApts = 0
    let totalActualHours = 0
    let totalConvertedHours = 0

    payrollItems.forEach((p) => {
      totalNet += p.netSalary
      totalApts += p.appointmentsCount
      totalActualHours += (p.actualHours ?? p.overtimeHours)
      totalConvertedHours += (p.convertedHours ?? p.overtimeHours)
    })

    const avgNet = payrollItems.length > 0 ? totalNet / payrollItems.length : 0

    return {
      totalNet,
      totalApts,
      totalActualHours,
      totalConvertedHours,
      avgNet
    }
  }, [payrollItems])

  const handleExportAll = () => {
    toast.success(`Đã xuất bảng tổng hợp lương ${selectedPeriod?.name} thành công.`)
  }

  const handleClosePeriod = () => {
    if (!selectedPeriod || selectedPeriod.status === "closed") return
    
    // Calculate final static items to freeze them
    const itemsToFreeze = initialDoctors.map((doc) => 
      getDoctorPayroll(doc, selectedPeriod.id, selectedPeriod.config)
    )
    
    const nextPeriods = periods.map((p) => {
      if (p.id === selectedPeriod.id) {
        return {
          ...p,
          status: "closed" as const,
          closedAt: new Date().toISOString(),
          closedBy: "Quản trị viên",
          items: itemsToFreeze
        }
      }
      return p
    })
    
    setPeriods(nextPeriods)
    try {
      localStorage.setItem("payroll-periods", JSON.stringify(nextPeriods))
    } catch {}
    
    toast.success(`Đã chốt và đóng băng kỳ lương ${selectedPeriod.name} thành công.`)
    setIsConfirmCloseOpen(false)
  }

  const handleCreatePeriod = () => {
    const [y, m] = newMonth.split("-")
    const formattedMonth = `Tháng ${m}/${y}`
    
    if (periods.some((p) => p.id === newMonth)) {
      toast.error(`Kỳ lương ${formattedMonth} đã tồn tại trong hệ thống.`)
      return
    }
    
    const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate()
    
    const newPeriod: PayrollPeriod = {
      id: newMonth,
      name: formattedMonth,
      startDate: `${newMonth}-01`,
      endDate: `${newMonth}-${lastDay}`,
      status: "draft",
      config: { ...config } // Kế thừa cấu hình từ kỳ lương hiện tại
    }
    
    const nextPeriods = [...periods, newPeriod]
    nextPeriods.sort((a, b) => a.id.localeCompare(b.id))
    
    setPeriods(nextPeriods)
    setSelectedPeriodId(newMonth)
    try {
      localStorage.setItem("payroll-periods", JSON.stringify(nextPeriods))
    } catch {}
    
    toast.success(`Đã tạo kỳ lương nháp ${formattedMonth} thành công.`)
    setIsCreateOpen(false)
  }

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm..." />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50">
          <span>Hệ thống</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Tính lương bác sĩ</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-primary/10">
                <Coins className="size-5 text-primary" />
              </div>
              <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Tính Lương Bác Sĩ</h1>
            </div>
            <p className="text-xs text-on-surface-variant ml-[44px]">
              Tính toán tiền lương, thù lao ca khám ngoài giờ cho bác sĩ dựa trên kỳ tính lương và giai đoạn.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Year Month Picker */}
            <div className="flex items-center gap-2 bg-slate-50 border border-outline-variant/30 px-3 py-1.5 rounded-xl text-xs font-bold text-primary h-10">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold select-none">Kỳ công lương:</span>
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-primary focus:ring-0 cursor-pointer"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.status === "closed" ? "(Đã chốt)" : "(Nháp)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Create new period */}
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="outline"
              className="border-outline-variant/30 text-on-surface-variant h-10 px-3.5 font-bold gap-1.5 rounded-xl hover:bg-slate-50 text-xs"
            >
              <Plus className="size-4" /> Tạo kỳ lương
            </Button>

            {/* Close period button */}
            {selectedPeriod?.status === "draft" && (
              <Button
                onClick={() => setIsConfirmCloseOpen(true)}
                className="bg-amber-600 text-white h-10 px-4 shadow-md shadow-amber-600/25 hover:shadow-amber-600/40 font-bold gap-1.5 border-transparent hover:bg-amber-500 text-xs transition-all"
              >
                <CheckCircle className="size-4" /> Chốt kỳ lương
              </Button>
            )}

            <Button onClick={handleExportAll} className="bg-primary text-white h-10 px-4 shadow-md shadow-primary/25 hover:shadow-primary/40 font-bold gap-1.5 border-transparent text-xs">
              <FileSpreadsheet className="size-4" /> Xuất bảng kê
            </Button>
          </div>
        </div>

        {/* State Banner */}
        {selectedPeriod && (
          selectedPeriod.status === "draft" ? (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <Info className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider">Trạng thái Nháp (Đang tính toán)</p>
                <p className="text-xs text-amber-700/80 leading-relaxed">
                  Số liệu tiền lương và ca khám ngoài giờ bên dưới là tạm tính. Bạn có thể thay đổi đơn giá, hệ số hoặc thêm ca khám mới. Hãy nhấn nút <strong>"Chốt kỳ lương"</strong> để khóa cấu hình và đóng băng số liệu lưu cố định vào cơ sở dữ liệu.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="size-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider">Trạng thái Đã Chốt (Đóng băng dữ liệu)</p>
                <p className="text-xs text-emerald-700/80 leading-relaxed">
                  Bảng lương này được chốt thành công vào {new Date(selectedPeriod.closedAt || "").toLocaleString("vi-VN")} bởi <strong>{selectedPeriod.closedBy}</strong>. Các số liệu đã được lưu trữ cố định vào DB và đóng băng để phục vụ thanh toán, không thay đổi ngay cả khi cấu hình hoặc ca khám hiện tại của hệ thống biến động.
                </p>
              </div>
            </div>
          )
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Tổng quỹ lương thực lĩnh", value: fmtCurrency(stats.totalNet), sub: "Không phụ cấp & khấu trừ", color: "text-blue-900", bg: "bg-blue-50/50" },
            { label: "Tổng số ca khám hoàn thành", value: `${stats.totalApts} ca`, sub: `Tổng giờ thực tế: ${stats.totalActualHours.toFixed(1)} h`, color: "text-emerald-700", bg: "bg-emerald-50/50" },
            { label: "Tổng số giờ quy đổi", value: `${stats.totalConvertedHours.toFixed(1)} h`, sub: `Đơn giá thù lao: ${fmtCurrency(config.hourlyRate)}/h`, color: "text-violet-750", bg: "bg-violet-50/50" },
            { label: "Lương bác sĩ trung bình", value: fmtCurrency(stats.avgNet), sub: `Tính trên ${payrollItems.length} bác sĩ`, color: "text-amber-800", bg: "bg-amber-50/50" },
          ].map((s, idx) => (
            <div key={idx} className={`rounded-2xl p-5 ${s.bg} border border-slate-100 flex flex-col justify-between h-28 shadow-sm`}>
              <p className="text-xs font-semibold text-on-surface-variant/70 leading-none">{s.label}</p>
              <p className={`text-xl font-black ${s.color} leading-none mt-2`}>{s.value}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-none">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Grid: Config Panel + Calculation Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Config column (LEFT) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5 space-y-4 relative overflow-hidden">
              {selectedPeriod?.status === "closed" && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-2 py-0.5 rounded-bl-lg text-[9px] font-bold flex items-center gap-1 shadow-sm">
                  <Lock className="size-2.5" /> ĐÃ KHÓA
                </div>
              )}
              
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-3">
                <Settings className="size-4 text-violet-500" />
                <h2 className="font-extrabold text-sm text-slate-900">Cấu hình Đơn giá & Hệ số</h2>
              </div>

              {/* Hourly rate */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đơn giá một giờ (VND)</label>
                <Input
                  type="number"
                  step={10000}
                  min={1000}
                  value={config.hourlyRate}
                  disabled={selectedPeriod?.status === "closed"}
                  onChange={(e) => handleConfigChange({ hourlyRate: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="h-10 rounded-xl bg-slate-50 border-transparent focus-visible:ring-primary/20 font-bold text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Weekend Coefficient */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hệ số ca cuối tuần (T7/CN)</label>
                <Input
                  type="number"
                  step={0.1}
                  min={1}
                  value={config.weekendCoef ?? 1.5}
                  disabled={selectedPeriod?.status === "closed"}
                  onChange={(e) => handleWeekendCoefChange(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="h-10 rounded-xl bg-slate-50 border-transparent focus-visible:ring-primary/20 font-bold text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Coefficients */}
              <div className="space-y-3 pt-2 border-t border-outline-variant/5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Hệ số Học hàm/Học vị</label>
                {Object.entries(config.coefDegree).map(([degree, val]) => (
                  <div key={degree} className="flex items-center justify-between gap-3 bg-slate-50/50 p-2 rounded-xl">
                    <span className="text-xs text-slate-600 font-semibold">{degree}</span>
                    <input
                      type="number"
                      step={0.1}
                      min={1}
                      value={val}
                      disabled={selectedPeriod?.status === "closed"}
                      onChange={(e) => handleCoefChange(degree, Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-16 h-8 text-center rounded-lg border border-outline-variant/20 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payroll calculation table list (RIGHT) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="size-4 text-primary" />
                  <h2 className="font-bold text-sm text-on-surface">Bảng kê chi tiết tiền lương bác sĩ ({selectedPeriod?.name})</h2>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/10 bg-slate-50/40 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="px-6 py-4">Bác sĩ</th>
                      <th className="px-6 py-4 text-center">Hệ số BS</th>
                      <th className="px-6 py-4 text-center">Số ca</th>
                      <th className="px-6 py-4 text-center">Giờ thực tế</th>
                      <th className="px-6 py-4 text-center">Giờ quy đổi</th>
                      <th className="px-6 py-4 text-right">Đơn giá/giờ</th>
                      <th className="px-6 py-4 text-right">Thực lĩnh</th>
                      <th className="px-6 py-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {payrollItems.map((p) => (
                      <tr key={p.doctorId} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-3.5">
                          <p className="font-bold text-slate-800">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{p.role} · {p.degree}</p>
                        </td>
                        <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-600">{p.coefficient}</td>
                        <td className="px-6 py-3.5 text-center font-bold text-slate-800">{p.appointmentsCount} ca</td>
                        <td className="px-6 py-3.5 text-center font-mono font-medium text-slate-600">{(p.actualHours ?? p.overtimeHours).toFixed(1)} h</td>
                        <td className="px-6 py-3.5 text-center font-mono font-bold text-blue-600">{(p.convertedHours ?? p.overtimeHours).toFixed(1)} h</td>
                        <td className="px-6 py-3.5 text-right font-medium text-slate-500">{fmtCurrency(config.hourlyRate)}</td>
                        <td className="px-6 py-3.5 text-right font-black text-primary text-sm">{fmtCurrency(p.netSalary)}</td>
                        <td className="px-6 py-3.5 text-center">
                          <Button
                            onClick={() => {
                              setSelectedDocPayroll(p)
                              setIsPayslipOpen(true)
                            }}
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg border-outline-variant/30 text-[11px] font-semibold hover:text-primary hover:border-primary/20"
                          >
                            Phiếu lương
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-outline-variant/10 text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>* Lương được tính chính xác theo thù lao ca khám: Giờ quy đổi * Hệ số bác sĩ * Đơn giá/giờ. Không áp dụng thuế, bảo hiểm, phụ cấp hay lương cơ bản.</span>
              <span className="text-primary font-bold">Clinical Serenity System v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm dialog for closing payroll */}
      <ConfirmDialog
        open={isConfirmCloseOpen}
        onClose={() => setIsConfirmCloseOpen(false)}
        onConfirm={handleClosePeriod}
        title="Xác nhận chốt kỳ lương?"
        description={`Bạn có chắc chắn muốn chốt kỳ lương "${selectedPeriod?.name}"? Hệ thống sẽ đóng băng toàn bộ cấu hình đơn giá, hệ số bác sĩ, hệ số cuối tuần cùng danh sách ca khám đã thực hiện của các bác sĩ. Sau khi chốt, dữ liệu sẽ được lưu cố định và không thể chỉnh sửa.`}
        confirmText="Chốt kỳ lương"
        cancelText="Hủy bỏ"
        destructive={false}
      />

      {/* Create New Period Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-900 font-headline font-bold">
              <Calendar className="size-5 text-primary" />
              Tạo Kỳ Lương Mới
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Tạo giai đoạn tính lương mới ở trạng thái nháp để bắt đầu tính toán và đối soát.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                Chọn tháng tính lương
              </Label>
              <Input
                type="month"
                value={newMonth}
                onChange={(e) => setNewMonth(e.target.value)}
                className="bg-surface-container-low border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20 font-semibold"
              />
            </div>
            
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-1.5">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Lưu ý nghiệp vụ</p>
              <ul className="space-y-1 text-xs text-blue-700/80 list-disc list-inside">
                <li>Bảng lương mới được tạo mặc định ở trạng thái nháp.</li>
                <li>Dữ liệu ca khám sẽ được quét tự động từ ngày bắt đầu đến ngày cuối cùng của tháng được chọn.</li>
                <li>Cấu hình đơn giá và hệ số ban đầu sẽ được kế thừa từ kỳ lương hiện tại.</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-xl border-outline-variant/30 text-on-surface-variant h-10 font-bold"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleCreatePeriod}
              className="rounded-xl bg-primary hover:bg-primary/95 text-white font-bold px-5 border-transparent h-10"
            >
              Tạo kỳ lương
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslip Modal */}
      {selectedPeriod && (
        <PayslipModal
          isOpen={isPayslipOpen}
          onOpenChange={setIsPayslipOpen}
          payroll={selectedDocPayroll}
          yearMonth={selectedPeriod.id}
          hourlyRate={selectedPeriod.config.hourlyRate}
        />
      )}
    </>
  )
}

