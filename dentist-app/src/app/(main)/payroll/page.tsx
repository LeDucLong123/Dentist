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
  const [selectedPeriodId, setSelectedPeriodId] = useState("")
  const [selectedPeriodDetails, setSelectedPeriodDetails] = useState<PayrollPeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [selectedDocPayroll, setSelectedDocPayroll] = useState<any | null>(null)
  const [isPayslipOpen, setIsPayslipOpen] = useState(false)
  
  // Dialog/Modal states
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newMonth, setNewMonth] = useState("2026-06")

  // Local string states for inputs to allow typing decimal point smoothly
  const [hourlyRateStr, setHourlyRateStr] = useState("")
  const [weekendCoefStr, setWeekendCoefStr] = useState("")
  const [nightCoefStr, setNightCoefStr] = useState("")
  const [coefDegreeStr, setCoefDegreeStr] = useState<Record<string, string>>({})

  // Load periods from API
  const fetchPeriods = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/payroll")
      if (res.ok) {
        const data = await res.json()
        setPeriods(data)
        if (data.length > 0 && !selectedPeriodId) {
          setSelectedPeriodId(data[data.length - 1].id)
        }
      }
    } catch (err) {
      console.error("Lỗi tải danh sách kỳ lương:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriods()
  }, [])

  // Fetch details when selected period changes
  useEffect(() => {
    if (!selectedPeriodId) return
    
    const fetchPeriodDetails = async () => {
      try {
        setLoadingDetails(true)
        const res = await fetch(`/api/payroll/${selectedPeriodId}`)
        if (res.ok) {
          const data = await res.json()
          setSelectedPeriodDetails(data)
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết kỳ lương:", err)
      } finally {
        setLoadingDetails(false)
      }
    }

    fetchPeriodDetails()
  }, [selectedPeriodId])

  // Synchronize string states when selectedPeriodDetails or selectedPeriodId changes
  useEffect(() => {
    if (selectedPeriodDetails?.config) {
      setHourlyRateStr(selectedPeriodDetails.config.hourlyRate.toString())
      setWeekendCoefStr((selectedPeriodDetails.config.weekendCoef ?? 1.5).toString())
      setNightCoefStr((selectedPeriodDetails.config.nightCoef ?? 1.5).toString())
      
      const degreesObj: Record<string, string> = {}
      Object.entries(selectedPeriodDetails.config.coefDegree || {}).forEach(([deg, val]) => {
        degreesObj[deg] = (val as number).toString()
      })
      setCoefDegreeStr(degreesObj)
    }
  }, [selectedPeriodDetails])

  // Get config of selected period (fallback to default if undefined)
  const config = useMemo(() => {
    return selectedPeriodDetails?.config || DEFAULT_PAYROLL_CONFIG
  }, [selectedPeriodDetails])

  // Save config changes for draft periods
  const handleConfigChange = async (updated: Partial<PayrollConfig>) => {
    if (!selectedPeriodDetails || selectedPeriodDetails.status === "closed") return
    
    const nextConfig = {
      ...selectedPeriodDetails.config,
      ...updated,
      coefDegree: {
        ...selectedPeriodDetails.config.coefDegree,
        ...(updated.coefDegree || {})
      },
      baseSalaries: {
        ...selectedPeriodDetails.config.baseSalaries,
        ...(updated.baseSalaries || {})
      }
    }
    
    // Optimistic UI update
    setSelectedPeriodDetails(prev => prev ? { ...prev, config: nextConfig } : null)
    
    try {
      const res = await fetch(`/api/payroll/${selectedPeriodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: nextConfig })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Không thể cập nhật cấu hình.")
      }
      
      setPeriods(prev => prev.map(p => p.id === selectedPeriodId ? { ...p, config: nextConfig } : p))
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu cấu hình.")
      // Revert
      const res = await fetch(`/api/payroll/${selectedPeriodId}`)
      if (res.ok) {
        setSelectedPeriodDetails(await res.json())
      }
    }
  }

  // Safe handlers for input fields
  const handleHourlyRateInputChange = (valStr: string) => {
    setHourlyRateStr(valStr)
    const val = parseInt(valStr)
    if (!isNaN(val) && val >= 0) {
      handleConfigChange({ hourlyRate: val })
    }
  }

  const handleHourlyRateBlur = () => {
    const val = parseInt(hourlyRateStr)
    if (isNaN(val) || val < 0) {
      setHourlyRateStr(config.hourlyRate.toString())
    }
  }

  const handleWeekendCoefInputChange = (valStr: string) => {
    setWeekendCoefStr(valStr)
    const val = parseFloat(valStr)
    if (!isNaN(val) && !valStr.endsWith(".")) {
      handleConfigChange({ weekendCoef: val })
    }
  }

  const handleWeekendCoefBlur = () => {
    const val = parseFloat(weekendCoefStr)
    if (isNaN(val) || val < 1) {
      setWeekendCoefStr((config.weekendCoef ?? 1.5).toString())
    }
  }

  const handleNightCoefInputChange = (valStr: string) => {
    setNightCoefStr(valStr)
    const val = parseFloat(valStr)
    if (!isNaN(val) && !valStr.endsWith(".")) {
      handleConfigChange({ nightCoef: val })
    }
  }

  const handleNightCoefBlur = () => {
    const val = parseFloat(nightCoefStr)
    if (isNaN(val) || val < 1) {
      setNightCoefStr((config.nightCoef ?? 1.5).toString())
    }
  }

  const handleDegreeCoefInputChange = (degree: string, valStr: string) => {
    setCoefDegreeStr(prev => ({ ...prev, [degree]: valStr }))
    const val = parseFloat(valStr)
    if (!isNaN(val) && !valStr.endsWith(".")) {
      const nextCoefs = { ...(config.coefDegree || {}), [degree]: val }
      handleConfigChange({ coefDegree: nextCoefs })
    }
  }

  const handleDegreeCoefBlur = (degree: string) => {
    const val = parseFloat(coefDegreeStr[degree])
    if (isNaN(val) || val < 1) {
      setCoefDegreeStr(prev => ({
        ...prev,
        [degree]: (config.coefDegree[degree] ?? 1.3).toString()
      }))
    }
  }

  const handleBaseSalaryChange = (role: string, value: number) => {
    const nextBase = { ...config.baseSalaries, [role]: value }
    handleConfigChange({ baseSalaries: nextBase })
  }

  // Retrieve payroll items (dynamically computed for draft periods to support real-time configuration changes)
  const payrollItems = useMemo(() => {
    const rawItems = selectedPeriodDetails?.items || []
    if (!selectedPeriodDetails || selectedPeriodDetails.status === "closed") {
      return rawItems
    }

    // Recalculate on the fly for draft periods using current config state
    return rawItems.map((p) => {
      const appointments = p.appointments || []
      let actualHours = 0
      let convertedHours = 0
      let totalPay = 0

      const coefficient = config.coefDegree[p.degree] ?? 1.3
      const weekendCoef = config.weekendCoef ?? 1.5
      const nightCoef = config.nightCoef ?? 1.5

      appointments.forEach((apt: any) => {
        const hours = calcAptDuration(apt.start, apt.end)
        const parts = apt.date ? apt.date.split("-") : []
        if (parts.length < 3) return

        const [y, m, d] = parts.map(Number)
        const dayOfWeek = new Date(y, m - 1, d).getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const isNight = apt.start >= "18:00"

        const weekendMultiplier = isWeekend ? weekendCoef : 1.0
        const nightMultiplier = isNight ? nightCoef : 1.0
        const shiftCoef = Math.max(weekendMultiplier, nightMultiplier)

        const converted = hours * shiftCoef
        const pay = converted * coefficient * config.hourlyRate

        actualHours += hours
        convertedHours += converted
        totalPay += pay
      })

      const netSalary = Math.round(totalPay)

      return {
        ...p,
        coefficient,
        weekendCoef,
        nightCoef,
        actualHours,
        convertedHours,
        overtimeHours: convertedHours,
        overtimePay: netSalary,
        netSalary,
      }
    })
  }, [selectedPeriodDetails, config])

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
    toast.success(`Đã xuất bảng tổng hợp lương ${selectedPeriodDetails?.name} thành công.`)
  }

  const handleClosePeriod = async () => {
    if (!selectedPeriodDetails || selectedPeriodDetails.status === "closed") return
    
    try {
      const res = await fetch(`/api/payroll/${selectedPeriodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Không thể chốt kỳ lương.")

      toast.success(`Đã chốt và đóng băng kỳ lương ${selectedPeriodDetails.name} thành công.`)
      setIsConfirmCloseOpen(false)

      await fetchPeriods()
      const detailsRes = await fetch(`/api/payroll/${selectedPeriodId}`)
      if (detailsRes.ok) {
        setSelectedPeriodDetails(await detailsRes.json())
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi chốt kỳ lương.")
    }
  }

  const handleOpenCreateModal = () => {
    if (periods.length > 0) {
      const sorted = [...periods].sort((a, b) => a.id.localeCompare(b.id))
      const latestId = sorted[sorted.length - 1].id
      const [year, month] = latestId.split("-").map(Number)
      let nextYear = year
      let nextMonth = month + 1
      if (nextMonth > 12) {
        nextMonth = 1
        nextYear += 1
      }
      const nextMonthStr = `${nextYear}-${nextMonth.toString().padStart(2, "0")}`
      setNewMonth(nextMonthStr)
    } else {
      setNewMonth("2026-06")
    }
    setIsCreateOpen(true)
  }

  const handleCreatePeriod = async () => {
    const [y, m] = newMonth.split("-")
    const formattedMonth = `Tháng ${m}/${y}`
    
    if (periods.some((p) => p.id === newMonth)) {
      toast.error(`Kỳ lương ${formattedMonth} đã tồn tại trong hệ thống.`)
      return
    }
    
    let latestConfig = DEFAULT_PAYROLL_CONFIG
    if (periods.length > 0) {
      const sorted = [...periods].sort((a, b) => a.id.localeCompare(b.id))
      latestConfig = sorted[sorted.length - 1].config || DEFAULT_PAYROLL_CONFIG
    }
    
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newMonth,
          name: formattedMonth,
          config: latestConfig
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Tạo kỳ lương thất bại.")

      toast.success(`Đã tạo kỳ lương nháp ${formattedMonth} thành công.`)
      setIsCreateOpen(false)

      await fetchPeriods()
      setSelectedPeriodId(newMonth)
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tạo kỳ lương.")
    }
  }

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm..." />

      <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50">
          <span>Hệ thống</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-semibold">Tính lương bác sĩ</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                  <Coins className="size-5 text-primary" />
                </div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-blue-900 tracking-tight truncate">Tính Lương Bác Sĩ</h1>
              </div>
              <p className="text-xs text-on-surface-variant ml-[44px] hidden sm:block">
                Tính toán tiền lương, thù lao ca khám ngoài giờ cho bác sĩ dựa trên kỳ tính lương và giai đoạn.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:flex-wrap">
            {/* Year Month Picker */}
            <div className="flex items-center gap-2 bg-slate-50 border border-outline-variant/30 px-3 py-1.5 rounded-xl text-xs font-bold text-primary h-10 min-w-0 w-full sm:w-auto">
              <Calendar className="size-4 text-primary shrink-0" />
              <span className="font-semibold select-none shrink-0 hidden xs:inline">Kỳ công lương:</span>
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-primary focus:ring-0 cursor-pointer min-w-0 flex-1 truncate"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.status === "closed" ? "(Đã chốt)" : "(Nháp)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
              {/* Create new period */}
              <Button
                onClick={handleOpenCreateModal}
                variant="outline"
                className="border-outline-variant/30 text-on-surface-variant h-10 px-3 sm:px-3.5 font-bold gap-1.5 rounded-xl hover:bg-slate-50 text-xs flex-1 sm:flex-initial"
              >
                <Plus className="size-4 shrink-0" />
                <span className="truncate">Tạo kỳ lương mới</span>
              </Button>

              {/* Close period button */}
              {selectedPeriodDetails?.status === "draft" && (
                <Button
                  onClick={() => setIsConfirmCloseOpen(true)}
                  className="bg-amber-600 text-white h-10 px-3 sm:px-4 shadow-md shadow-amber-600/25 hover:shadow-amber-600/40 font-bold gap-1.5 border-transparent hover:bg-amber-500 text-xs transition-all flex-1 sm:flex-initial"
                >
                  <CheckCircle className="size-4 shrink-0" />
                  <span className="truncate">Chốt kỳ lương</span>
                </Button>
              )}

              <Button onClick={handleExportAll} className="bg-primary text-white h-10 px-3 sm:px-4 shadow-md shadow-primary/25 hover:shadow-primary/40 font-bold gap-1.5 border-transparent text-xs flex-1 sm:flex-initial">
                <FileSpreadsheet className="size-4 shrink-0" />
                <span className="truncate">Xuất bảng kê</span>
              </Button>
            </div>
          </div>
        </div>

        {/* State Banner */}
        {selectedPeriodDetails && (
          selectedPeriodDetails.status === "draft" ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                <Info className="size-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider">Trạng thái Nháp (Đang tính toán)</p>
                  <p className="text-[11px] sm:text-xs text-amber-700/80 leading-relaxed">
                    Số liệu tiền lương và ca khám ngoài giờ bên dưới là tạm tính. Bạn có thể thay đổi đơn giá, hệ số hoặc thêm ca khám mới. Bạn có thể nhấn <strong>"Chốt kỳ lương"</strong> để đóng băng số liệu, hoặc tạo kỳ lương nháp mới trước.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleOpenCreateModal}
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-900 bg-amber-100/50 hover:bg-amber-100 font-bold shrink-0 text-xs self-start sm:self-center"
              >
                Tạo kỳ nháp mới
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="size-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider">Trạng thái Đã Chốt (Đóng băng dữ liệu)</p>
                <p className="text-[11px] sm:text-xs text-emerald-700/80 leading-relaxed">
                  Bảng lương này được chốt thành công vào {new Date(selectedPeriodDetails.closedAt || "").toLocaleString("vi-VN")} bởi <strong>{selectedPeriodDetails.closedBy}</strong>. Các số liệu đã được lưu trữ cố định vào DB và đóng băng để phục vụ thanh toán, không thay đổi ngay cả khi cấu hình hoặc ca khám hiện tại của hệ thống biến động.
                </p>
              </div>
            </div>
          )
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Tổng quỹ lương thực lĩnh", value: fmtCurrency(stats.totalNet), sub: "Không phụ cấp & khấu trừ", color: "text-blue-900", bg: "bg-blue-50/50" },
            { label: "Tổng số ca khám hoàn thành", value: `${stats.totalApts} ca`, sub: `Tổng giờ thực tế: ${stats.totalActualHours.toFixed(1)} h`, color: "text-emerald-700", bg: "bg-emerald-50/50" },
            { label: "Tổng số giờ quy đổi", value: `${stats.totalConvertedHours.toFixed(1)} h`, sub: `Đơn giá thù lao: ${fmtCurrency(config.hourlyRate)}/h`, color: "text-violet-750", bg: "bg-violet-50/50" },
            { label: "Lương bác sĩ trung bình", value: fmtCurrency(stats.avgNet), sub: `Tính trên ${payrollItems.length} bác sĩ`, color: "text-amber-800", bg: "bg-amber-50/50" },
          ].map((s, idx) => (
            <div key={idx} className={`rounded-2xl p-3 sm:p-5 ${s.bg} border border-slate-100 flex flex-col justify-between min-h-[6rem] sm:h-28 shadow-sm`}>
              <p className="text-[10px] sm:text-xs font-semibold text-on-surface-variant/70 leading-tight">{s.label}</p>
              <p className={`text-base sm:text-xl font-black ${s.color} leading-none mt-1.5 sm:mt-2 truncate`}>{s.value}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-none truncate">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Grid: Config Panel + Calculation Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Config column (LEFT) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-3 sm:p-5 space-y-3 sm:space-y-4 relative overflow-hidden">
              {selectedPeriodDetails?.status === "closed" && (
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
                  type="text"
                  value={hourlyRateStr}
                  disabled={selectedPeriodDetails?.status === "closed"}
                  onChange={(e) => handleHourlyRateInputChange(e.target.value)}
                  onBlur={handleHourlyRateBlur}
                  className="h-10 rounded-xl bg-slate-50 border-transparent focus-visible:ring-primary/20 font-bold text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Weekend Coefficient */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hệ số ca cuối tuần (T7/CN)</label>
                <Input
                  type="text"
                  value={weekendCoefStr}
                  disabled={selectedPeriodDetails?.status === "closed"}
                  onChange={(e) => handleWeekendCoefInputChange(e.target.value)}
                  onBlur={handleWeekendCoefBlur}
                  className="h-10 rounded-xl bg-slate-50 border-transparent focus-visible:ring-primary/20 font-bold text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Night Coefficient */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hệ số ca tối (sau 18h)</label>
                <Input
                  type="text"
                  value={nightCoefStr}
                  disabled={selectedPeriodDetails?.status === "closed"}
                  onChange={(e) => handleNightCoefInputChange(e.target.value)}
                  onBlur={handleNightCoefBlur}
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
                      type="text"
                      value={coefDegreeStr[degree] ?? val.toString()}
                      disabled={selectedPeriodDetails?.status === "closed"}
                      onChange={(e) => handleDegreeCoefInputChange(degree, e.target.value)}
                      onBlur={() => handleDegreeCoefBlur(degree)}
                      className="w-16 h-8 text-center rounded-lg border border-outline-variant/20 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payroll calculation table list (RIGHT) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col justify-between min-w-0">
            {loadingDetails ? (
              <div className="flex-1 flex flex-col items-center justify-center p-16">
                <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-on-surface-variant">Đang tải bảng lương...</p>
              </div>
            ) : (
              <div>
                <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calculator className="size-4 text-primary shrink-0" />
                    <h2 className="font-bold text-xs sm:text-sm text-on-surface truncate">Bảng kê chi tiết tiền lương bác sĩ ({selectedPeriodDetails?.name})</h2>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-outline-variant/10 bg-slate-50/40 text-[10px] font-bold text-slate-500 uppercase">
                        <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Bác sĩ</th>
                        <th className="px-2 lg:px-4 py-3 text-center whitespace-nowrap">Hệ số BS</th>
                        <th className="px-2 lg:px-4 py-3 text-center whitespace-nowrap">Số ca</th>
                        <th className="px-2 lg:px-4 py-3 text-center whitespace-nowrap">Giờ thực tế</th>
                        <th className="px-2 lg:px-4 py-3 text-center whitespace-nowrap">Giờ quy đổi</th>
                        <th className="px-2 lg:px-4 py-3 text-right whitespace-nowrap">Đơn giá/giờ</th>
                        <th className="px-2 lg:px-4 py-3 text-right whitespace-nowrap">Thực lĩnh</th>
                        <th className="px-2 lg:px-4 py-3 text-center whitespace-nowrap">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {payrollItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 lg:px-4 py-12 text-center text-xs text-on-surface-variant/60 italic font-medium">
                            Không có dữ liệu thù lao cho kỳ lương này.
                          </td>
                        </tr>
                      ) : (
                        payrollItems.map((p) => (
                          <tr key={p.doctorId} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-3 lg:px-4 py-3">
                              <p className="font-bold text-slate-800 whitespace-nowrap">{p.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">{p.role} · {p.degree}</p>
                            </td>
                            <td className="px-2 lg:px-4 py-3 text-center font-mono font-bold text-slate-600">{p.coefficient}</td>
                            <td className="px-2 lg:px-4 py-3 text-center font-bold text-slate-800">{p.appointmentsCount} ca</td>
                            <td className="px-2 lg:px-4 py-3 text-center font-mono font-medium text-slate-600">{(p.actualHours ?? p.overtimeHours).toFixed(1)} h</td>
                            <td className="px-2 lg:px-4 py-3 text-center font-mono font-bold text-blue-600">{(p.convertedHours ?? p.overtimeHours).toFixed(1)} h</td>
                            <td className="px-2 lg:px-4 py-3 text-right font-medium text-slate-500">{fmtCurrency(config.hourlyRate)}</td>
                            <td className="px-2 lg:px-4 py-3 text-right font-black text-primary text-sm">{fmtCurrency(p.netSalary)}</td>
                            <td className="px-2 lg:px-4 py-3 text-center">
                              <Button
                                onClick={() => {
                                  setSelectedDocPayroll(p)
                                  setIsPayslipOpen(true)
                                }}
                                size="sm"
                                variant="outline"
                                className="h-7 sm:h-8 rounded-lg border-outline-variant/30 text-[10px] sm:text-[11px] font-semibold hover:text-primary hover:border-primary/20 whitespace-nowrap"
                              >
                                Phiếu lương
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="p-3 sm:p-4 bg-slate-50/50 border-t border-outline-variant/10 text-[10px] sm:text-[11px] text-slate-500 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mt-auto">
              <span className="leading-relaxed">* Lương được tính chính xác theo thù lao ca khám: Giờ quy đổi * Hệ số bác sĩ * Đơn giá/giờ. Không áp dụng thuế, bảo hiểm, phụ cấp hay lương cơ bản.</span>
              <span className="text-primary font-bold shrink-0">Clinical Serenity System v1.0</span>
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
        description={`Bạn có chắc chắn muốn chốt kỳ lương "${selectedPeriodDetails?.name}"? Hệ thống sẽ đóng băng toàn bộ cấu hình đơn giá, hệ số bác sĩ, hệ số cuối tuần cùng danh sách ca khám đã thực hiện của các bác sĩ. Sau khi chốt, dữ liệu sẽ được lưu cố định và không thể chỉnh sửa.`}
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
              Tạo Kỳ Lương Nháp Mới
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
                <li>Cấu hình đơn giá và hệ số ban đầu sẽ được kế thừa từ kỳ lương nháp gần nhất.</li>
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
              Tạo kỳ lương nháp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslip Modal */}
      {selectedPeriodDetails && (
        <PayslipModal
          isOpen={isPayslipOpen}
          onOpenChange={setIsPayslipOpen}
          payroll={selectedDocPayroll}
          yearMonth={selectedPeriodDetails.id}
          hourlyRate={selectedPeriodDetails.config.hourlyRate}
        />
      )}
    </>
  )
}

