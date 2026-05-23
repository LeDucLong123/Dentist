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
} from "lucide-react"

export default function PayrollPage() {
  const [yearMonth, setYearMonth] = useState("2026-05")
  const [config, setConfig] = useState<PayrollConfig>(DEFAULT_PAYROLL_CONFIG)
  const [selectedDocPayroll, setSelectedDocPayroll] = useState<any | null>(null)
  const [isPayslipOpen, setIsPayslipOpen] = useState(false)

  // Load config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("payroll-config")
      if (saved) {
        setConfig(JSON.parse(saved))
      }
    } catch {}
  }, [])

  // Save config changes helper
  const handleConfigChange = (updated: Partial<PayrollConfig>) => {
    const next = { ...config, ...updated }
    setConfig(next)
    try {
      localStorage.setItem("payroll-config", JSON.stringify(next))
    } catch {}
  }

  const handleCoefChange = (degree: string, value: number) => {
    const nextCoefs = { ...config.coefDegree, [degree]: value }
    handleConfigChange({ coefDegree: nextCoefs })
  }

  const handleBaseSalaryChange = (role: string, value: number) => {
    const nextBase = { ...config.baseSalaries, [role]: value }
    handleConfigChange({ baseSalaries: nextBase })
  }

  // Calculate payroll items for all doctors
  const payrollItems = useMemo(() => {
    return initialDoctors.map((doc) => getDoctorPayroll(doc, yearMonth, config))
  }, [yearMonth, config])

  // Aggregate stats
  const stats = useMemo(() => {
    let totalNet = 0
    let totalApts = 0
    let totalHours = 0
    let totalBase = 0
    let totalOvertime = 0

    payrollItems.forEach((p) => {
      totalNet += p.netSalary
      totalApts += p.appointmentsCount
      totalHours += p.overtimeHours
      totalBase += p.baseSalary
      totalOvertime += p.overtimePay
    })

    const avgNet = payrollItems.length > 0 ? totalNet / payrollItems.length : 0

    return {
      totalNet,
      totalApts,
      totalHours,
      totalBase,
      totalOvertime,
      avgNet
    }
  }, [payrollItems])

  const [year, month] = yearMonth.split("-")
  const formattedMonthLabel = `Tháng ${month}/${year}`

  const handleExportAll = () => {
    toast.success(`Đã xuất bảng tổng hợp lương ${formattedMonthLabel} thành công.`)
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-primary/10">
                <Coins className="size-5 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Tính Lương Bác Sĩ</h1>
            </div>
            <p className="text-sm text-on-surface-variant ml-[44px]">
              Tính toán tiền lương, thù lao ca khám ngoài giờ cho bác sĩ dựa trên học hàm học vị.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Year Month Picker */}
            <div className="flex items-center gap-2 bg-white border border-outline-variant/30 px-3 py-1.5 rounded-xl text-xs font-bold text-primary shadow-sm h-10">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold select-none">Kỳ công lương:</span>
              <select
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-primary focus:ring-0 cursor-pointer"
              >
                {["2026-05", "2026-06", "2026-07"].map((m) => {
                  const [y, mn] = m.split("-")
                  return (
                    <option key={m} value={m}>Tháng {mn}/{y}</option>
                  )
                })}
              </select>
            </div>

            <Button onClick={handleExportAll} className="bg-primary text-white h-10 px-5 shadow-md shadow-primary/25 hover:shadow-primary/40 font-semibold gap-2 border-transparent">
              <FileSpreadsheet className="size-4" /> Xuất bảng kê
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Tổng quỹ lương thực lĩnh", value: fmtCurrency(stats.totalNet), sub: `Lương cơ bản: ${fmtCurrency(stats.totalBase)}`, color: "text-blue-900", bg: "bg-blue-50/50" },
            { label: "Tổng số ca khám hoàn thành", value: `${stats.totalApts} ca`, sub: `Tổng số giờ: ${stats.totalHours.toFixed(1)} h`, color: "text-emerald-700", bg: "bg-emerald-50/50" },
            { label: "Quỹ thưởng ngoài giờ (Overtime)", value: fmtCurrency(stats.totalOvertime), sub: `Đơn giá chuẩn: ${fmtCurrency(config.hourlyRate)}/h`, color: "text-violet-750", bg: "bg-violet-50/50" },
            { label: "Lương bác sĩ trung bình", value: fmtCurrency(stats.avgNet), sub: `Tính trên ${payrollItems.length} bác sĩ`, color: "text-amber-800", bg: "bg-amber-50/50" },
          ].map((s, idx) => (
            <div key={idx} className={`rounded-2xl p-5 ${s.bg} border border-slate-100 flex flex-col justify-between h-28 shadow-sm`}>
              <p className="text-xs font-semibold text-on-surface-variant/70 leading-none">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} leading-none mt-2`}>{s.value}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-none">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Grid: Config Panel + Calculation Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Config column (LEFT) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5 space-y-4">
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
                  onChange={(e) => handleConfigChange({ hourlyRate: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="h-10 rounded-xl bg-slate-50 border-transparent focus-visible:ring-primary/20 font-bold text-primary"
                />
              </div>

              {/* Coefficients */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Hệ số Học hàm/Học vị</label>
                {Object.entries(config.coefDegree).map(([degree, val]) => (
                  <div key={degree} className="flex items-center justify-between gap-3 bg-slate-50/50 p-2 rounded-xl">
                    <span className="text-xs text-slate-600 font-semibold">{degree}</span>
                    <input
                      type="number"
                      step={0.1}
                      min={1}
                      value={val}
                      onChange={(e) => handleCoefChange(degree, Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-16 h-8 text-center rounded-lg border border-outline-variant/20 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                ))}
              </div>

              {/* Base salaries config */}
              <div className="space-y-3 pt-2 border-t border-outline-variant/5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Lương cơ bản theo chức danh</label>
                {Object.entries(config.baseSalaries).map(([role, val]) => (
                  <div key={role} className="flex flex-col gap-1 bg-slate-50/50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{role}</span>
                    <input
                      type="number"
                      step={500000}
                      min={0}
                      value={val}
                      onChange={(e) => handleBaseSalaryChange(role, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full h-8 px-2 rounded-lg border border-outline-variant/20 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30"
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
                  <h2 className="font-bold text-sm text-on-surface">Bảng kê chi tiết tiền lương bác sĩ ({formattedMonthLabel})</h2>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/10 bg-slate-50/40 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="px-6 py-4">Bác sĩ</th>
                      <th className="px-6 py-4 text-center">Hệ số</th>
                      <th className="px-6 py-4 text-right">Lương cơ bản</th>
                      <th className="px-6 py-4 text-center">Số ca (Giờ)</th>
                      <th className="px-6 py-4 text-right">Tiền làm thêm</th>
                      <th className="px-6 py-4 text-right">Phụ cấp/Trừ</th>
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
                        <td className="px-6 py-3.5 text-right font-medium text-slate-700">{fmtCurrency(p.baseSalary)}</td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="font-bold text-slate-800">{p.appointmentsCount} ca</span>
                          <span className="text-[10px] text-slate-400 block">({p.overtimeHours.toFixed(1)} h)</span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-emerald-600">+{fmtCurrency(p.overtimePay)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <p className="text-emerald-600 font-medium">+{fmtCurrency(p.allowance)}</p>
                          <p className="text-red-500 font-medium">-{fmtCurrency(p.deduction)}</p>
                        </td>
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
              <span>* Khấu trừ đã bao gồm 10% thuế TNCN và các chi phí bảo hiểm bắt buộc trên tổng thu nhập.</span>
              <span className="text-primary font-bold">Clinical Serenity System v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payslip Modal */}
      <PayslipModal
        isOpen={isPayslipOpen}
        onOpenChange={setIsPayslipOpen}
        payroll={selectedDocPayroll}
        yearMonth={yearMonth}
        hourlyRate={config.hourlyRate}
      />
    </>
  )
}
