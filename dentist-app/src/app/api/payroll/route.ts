import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import PayrollPeriod from "@/models/PayrollPeriod"
import User from "@/models/User"
import Appointment from "@/models/Appointment"
import { verifyToken } from "@/lib/auth"
import { getDoctorPayroll, DEFAULT_PAYROLL_CONFIG } from "@/lib/payroll-data"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    await dbConnect()
    let periods = await PayrollPeriod.find({}).sort({ periodId: 1 })

    if (periods.length === 0) {
      // Seed default periods in DB if none exist
      const doctors = await User.find({ role: "doctor" })
      const mappedDocs = doctors.map(d => ({
        id: d._id.toString(),
        name: d.name,
        role: d.doctorRole || "Bác sĩ",
        degree: d.degree || "BS"
      }))

      const getFrozenItems = async (ym: string) => {
        const appointments = await Appointment.find({ status: "completed", date: { $regex: new RegExp("^" + ym) } })
        return mappedDocs.map(doc => getDoctorPayroll(doc, ym, DEFAULT_PAYROLL_CONFIG, appointments))
      }

      const items03 = await getFrozenItems("2026-03")
      const items04 = await getFrozenItems("2026-04")

      const defaultPeriodsData = [
        {
          periodId: "2026-03",
          name: "Tháng 03/2026",
          startDate: "2026-03-01",
          endDate: "2026-03-31",
          status: "closed",
          closedAt: new Date("2026-04-05T10:00:00Z"),
          closedBy: "Kế toán trưởng",
          config: DEFAULT_PAYROLL_CONFIG,
          items: items03
        },
        {
          periodId: "2026-04",
          name: "Tháng 04/2026",
          startDate: "2026-04-01",
          endDate: "2026-04-30",
          status: "closed",
          closedAt: new Date("2026-05-05T09:30:00Z"),
          closedBy: "Kế toán trưởng",
          config: DEFAULT_PAYROLL_CONFIG,
          items: items04
        },
        {
          periodId: "2026-05",
          name: "Tháng 05/2026",
          startDate: "2026-05-01",
          endDate: "2026-05-31",
          status: "draft",
          config: DEFAULT_PAYROLL_CONFIG
        }
      ]

      await PayrollPeriod.create(defaultPeriodsData)
      periods = await PayrollPeriod.find({}).sort({ periodId: 1 })
    }

    // Map to UI-friendly structure (id instead of periodId)
    const formatted = periods.map(p => ({
      id: p.periodId,
      name: p.name,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
      closedAt: p.closedAt?.toISOString(),
      closedBy: p.closedBy,
      config: p.config
    }))

    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error("GET Payroll Periods Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải kỳ lương." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền tạo kỳ lương." }, { status: 403 })
    }

    await dbConnect()
    const body = await req.json()
    const { id, name, config } = body

    if (!id || !name) {
      return NextResponse.json({ message: "Vui lòng điền đầy đủ thông tin kỳ lương." }, { status: 400 })
    }

    const existing = await PayrollPeriod.findOne({ periodId: id })
    if (existing) {
      return NextResponse.json({ message: "Kỳ lương này đã tồn tại." }, { status: 400 })
    }

    const [y, m] = id.split("-").map(Number)
    const lastDay = new Date(y, m, 0).getDate()
    const startDate = `${id}-01`
    const endDate = `${id}-${lastDay}`

    const newPeriod = await PayrollPeriod.create({
      periodId: id,
      name,
      startDate,
      endDate,
      status: "draft",
      config: config || DEFAULT_PAYROLL_CONFIG
    })

    return NextResponse.json({
      message: "Tạo kỳ lương thành công.",
      period: {
        id: newPeriod.periodId,
        name: newPeriod.name,
        startDate: newPeriod.startDate,
        endDate: newPeriod.endDate,
        status: newPeriod.status
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error("POST Payroll Period Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tạo kỳ lương." }, { status: 500 })
  }
}
