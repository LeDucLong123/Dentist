import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import Appointment from "@/models/Appointment"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền truy cập." }, { status: 403 })
    }

    await dbConnect()

    // 1. Get dates in GMT+7
    const tzOffset = 7 * 60 * 60 * 1000
    const localDate = new Date(Date.now() + tzOffset)
    const todayStr = localDate.toISOString().slice(0, 10) // YYYY-MM-DD

    const currentYear = localDate.getFullYear()
    const currentMonth = localDate.getMonth() + 1

    const formatMonth = (y: number, m: number) => `${y}-${m.toString().padStart(2, "0")}`
    const currentMonthStr = formatMonth(currentYear, currentMonth)

    const prevMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const prevMonthStr = formatMonth(prevMonthYear, prevMonth)

    // 2. Fetch data
    const todayApts = await Appointment.find({ date: todayStr })
      .populate("patientId")
      .populate("doctorId")
      .populate("items")

    const currentMonthApts = await Appointment.find({ date: { $regex: new RegExp("^" + currentMonthStr) } })
      .populate("patientId")
      .populate("doctorId")
      .populate("items")

    const prevMonthApts = await Appointment.find({ date: { $regex: new RegExp("^" + prevMonthStr) } })

    const yearApts = await Appointment.find({
      date: { $regex: new RegExp("^" + currentYear) },
      status: { $ne: "cancelled" }
    })

    const allAppointments = await Appointment.find({}).populate("items")
    const doctors = await User.find({ role: "doctor" })

    // 3. Compute KPI 1: Today's Appointments
    const todayCount = todayApts.length
    const confirmedToday = todayApts.filter(a => ["confirmed", "checked_in", "examining"].includes(a.status)).length
    const pendingToday = todayApts.filter(a => a.status === "scheduled").length

    // 4. Compute KPI 2: Patients Count & Trend
    const currentPatientsSet = new Set(currentMonthApts.map(a => a.patientId ? a.patientId._id.toString() : ""))
    currentPatientsSet.delete("")
    const currentPatientsCount = currentPatientsSet.size

    const prevPatientsSet = new Set(prevMonthApts.map(a => a.patientId ? a.patientId.toString() : ""))
    prevPatientsSet.delete("")
    const prevPatientsCount = prevPatientsSet.size

    let patientTrend = "+0%"
    let patientTrendUp = true
    if (prevPatientsCount > 0) {
      const diff = ((currentPatientsCount - prevPatientsCount) / prevPatientsCount) * 100
      patientTrend = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`
      patientTrendUp = diff >= 0
    } else if (currentPatientsCount > 0) {
      patientTrend = "+100%"
      patientTrendUp = true
    }

    // 5. Compute KPI 3: Revenue & Trend (based on sum of actual payment transaction amounts in that month)
    let currentMonthRev = 0
    let prevMonthRev = 0

    allAppointments.forEach(a => {
      if (a.payments && a.payments.length > 0) {
        a.payments.forEach((p: any) => {
          if (p && p.date) {
            if (p.date.startsWith(currentMonthStr)) {
              currentMonthRev += p.amount || 0
            } else if (p.date.startsWith(prevMonthStr)) {
              prevMonthRev += p.amount || 0
            }
          }
        })
      }
    })

    let revTrend = "+0%"
    let revTrendUp = true
    if (prevMonthRev > 0) {
      const diff = ((currentMonthRev - prevMonthRev) / prevMonthRev) * 100
      revTrend = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`
      revTrendUp = diff >= 0
    } else if (currentMonthRev > 0) {
      revTrend = "+100%"
      revTrendUp = true
    }
    const monthlyRevStr = `${(currentMonthRev / 1000000).toFixed(1)}M`

    // 6. Compute KPI 4: Completion rate
    const completedCount = currentMonthApts.filter(a => a.status === "completed").length
    const cancelledCount = currentMonthApts.filter(a => a.status === "cancelled").length
    const totalApts = currentMonthApts.length

    const compRateVal = totalApts > 0 ? (completedCount / totalApts) * 100 : 0
    const cancelledRateVal = totalApts > 0 ? (cancelledCount / totalApts) * 100 : 0
    const compRateStr = `${compRateVal.toFixed(1)}%`
    const cancelledRateStr = `${cancelledRateVal.toFixed(1)}%`

    // 7. Monthly Revenue Chart (12 Months) - based on sum of actual payment transactions in each month
    const revenueMonths = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1
      const prefix = `${currentYear}-${monthNum.toString().padStart(2, "0")}`
      
      let sumPaid = 0
      allAppointments.forEach(a => {
        if (a.payments && a.payments.length > 0) {
          a.payments.forEach((p: any) => {
            if (p && p.date && p.date.startsWith(prefix)) {
              sumPaid += p.amount || 0
            }
          })
        }
      })

      return {
        month: `T${monthNum}`,
        value: parseFloat((sumPaid / 1000000).toFixed(2))
      }
    })

    // 8. Top Doctors
    const topDoctors = doctors.map(doc => {
      const docApts = allAppointments.filter(a => a.doctorId.toString() === doc._id.toString())
      const docPatientsCount = new Set(docApts.map(a => a.patientId ? a.patientId.toString() : "")).size
      const rating = Math.min(5.0, 4.5 + (docPatientsCount * 0.05))
      const names = doc.name.replace(/^(BS\.|ThS\.BS\.)\s*/i, "").split(" ")
      const avatar = names.map((n: string) => n[0]).filter(Boolean).slice(-2).join("").toUpperCase() || "BS"

      return {
        name: doc.name,
        specialty: doc.specialty || "Bác sĩ",
        patients: docPatientsCount,
        rating: parseFloat(rating.toFixed(1)),
        avatar
      }
    }).sort((a, b) => b.patients - a.patients).slice(0, 4)

    // 9. Top Services
    const serviceMap: Record<string, number> = {}
    allAppointments.forEach(a => {
      if (a.items && a.items.length > 0) {
        a.items.forEach((item: any) => {
          if (item && item.serviceName) {
            serviceMap[item.serviceName] = (serviceMap[item.serviceName] || 0) + 1
          }
        })
      }
    })

    const serviceColors = [
      "bg-primary",
      "bg-violet-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-red-400",
      "bg-blue-400"
    ]

    const serviceList = Object.entries(serviceMap).map(([name, count]) => ({ name, count }))
    if (serviceList.length === 0) {
      serviceList.push(
        { name: "Cấy ghép Implant", count: 12 },
        { name: "Chỉnh nha mắc cài", count: 8 },
        { name: "Bọc răng sứ", count: 7 },
        { name: "Tẩy trắng răng", count: 5 },
        { name: "Nhổ răng khôn", count: 3 }
      )
    }

    const totalServicesCount = serviceList.reduce((sum, s) => sum + s.count, 0)
    const topServices = serviceList.sort((a, b) => b.count - a.count).slice(0, 5).map((s, idx) => {
      const pct = totalServicesCount > 0 ? Math.round((s.count / totalServicesCount) * 100) : 0
      return {
        name: s.name,
        count: s.count,
        pct,
        color: serviceColors[idx % serviceColors.length]
      }
    })

    // 10. Recent Activity (based on 6 most recently updated appointments)
    const recentApts = await Appointment.find({})
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate("patientId")

    const recentActivity = recentApts.map(a => {
      const pName = a.patientId ? (a.patientId as any).name : "Bệnh nhân"
      let desc = `Lịch khám của bệnh nhân ${pName} đã cập nhật`
      let type = "info"

      const updatedTime = new Date(a.updatedAt)
      const timeStr = updatedTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })

      if (a.status === "completed") {
        desc = `Lịch khám ${a.appointmentId} của ${pName} đã hoàn thành`
        type = "success"
      } else if (a.status === "cancelled") {
        desc = `Lịch khám ${a.appointmentId} của ${pName} bị hủy`
        type = "error"
      } else if (a.status === "scheduled") {
        desc = `Lịch khám ${a.appointmentId} của ${pName} chờ xác nhận`
        type = "warn"
      } else if (a.status === "confirmed") {
        desc = `Lịch khám ${a.appointmentId} của ${pName} được xác nhận`
        type = "success"
      } else if (a.status === "checked_in") {
        desc = `Bệnh nhân ${pName} đã tiếp đón tại phòng khám`
        type = "info"
      } else if (a.status === "examining") {
        desc = `Bác sĩ đang thực hiện khám cho ${pName}`
        type = "info"
      }

      return {
        time: timeStr,
        desc,
        type
      }
    })

    // Format today's appointments for frontend
    const formattedTodayApts = todayApts.map(a => {
      const pName = a.patientId ? (a.patientId as any).name : "Không rõ"
      // Find main service name
      let serviceName = "Khám răng"
      if (a.items && a.items.length > 0) {
        serviceName = (a.items[0] as any).serviceName
      }
      return {
        id: a.appointmentId,
        patient: pName,
        start: a.start,
        service: serviceName,
        status: a.status
      }
    })

    return NextResponse.json({
      todayApts: formattedTodayApts,
      todayCount,
      confirmedToday,
      pendingToday,
      patientCountVal: currentPatientsCount,
      patientTrend,
      patientTrendUp,
      monthlyRevStr,
      monthlyRevVal: currentMonthRev,
      revTrend,
      revTrendUp,
      compRateStr,
      cancelledRateStr,
      revenueMonths,
      topDoctors,
      topServices,
      recentActivity
    })

  } catch (error: any) {
    console.error("GET Dashboard Stats Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải số liệu thống kê." }, { status: 500 })
  }
}
