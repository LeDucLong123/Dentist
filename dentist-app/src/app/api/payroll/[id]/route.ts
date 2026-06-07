import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import PayrollPeriod from "@/models/PayrollPeriod"
import User from "@/models/User"
import Appointment from "@/models/Appointment"
import { verifyToken } from "@/lib/auth"
import { getDoctorPayroll } from "@/lib/payroll-data"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    const period = await PayrollPeriod.findOne({ periodId: id })
    if (!period) {
      return NextResponse.json({ message: "Không tìm thấy kỳ lương." }, { status: 404 })
    }

    let items = []
    if (period.status === "closed") {
      items = period.items || []
    } else {
      // Draft: calculate dynamically using DB doctors and DB appointments
      const doctors = await User.find({ role: "doctor" })
      const mappedDocs = doctors.map(d => ({
        id: d._id.toString(),
        name: d.name,
        role: d.doctorRole || "Bác sĩ",
        degree: d.degree || "BS"
      }))

      const appointments = await Appointment.find({ status: "completed", date: { $regex: new RegExp("^" + id) } })
      items = mappedDocs.map(doc => getDoctorPayroll(doc, id, period.config, appointments))
    }

    const formatted = {
      id: period.periodId,
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      status: period.status,
      closedAt: period.closedAt?.toISOString(),
      closedBy: period.closedBy,
      config: period.config,
      items
    }

    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error("GET Payroll Period Detail Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải chi tiết kỳ lương." }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền cập nhật kỳ lương." }, { status: 403 })
    }

    const { id } = await params
    await dbConnect()

    const period = await PayrollPeriod.findOne({ periodId: id })
    if (!period) {
      return NextResponse.json({ message: "Không tìm thấy kỳ lương." }, { status: 404 })
    }

    if (period.status === "closed") {
      return NextResponse.json({ message: "Không thể chỉnh sửa cấu hình của kỳ lương đã chốt." }, { status: 400 })
    }

    const body = await req.json()
    const { config, status } = body

    if (config) {
      const configObj = period.config && typeof period.config.toObject === "function"
        ? period.config.toObject()
        : period.config
      period.config = {
        ...configObj,
        ...config,
        coefDegree: {
          ...(configObj.coefDegree || {}),
          ...(config.coefDegree || {})
        },
        baseSalaries: {
          ...(configObj.baseSalaries || {}),
          ...(config.baseSalaries || {})
        }
      }
    }

    if (status === "closed") {
      // Calculate final frozen items
      const doctors = await User.find({ role: "doctor" })
      const mappedDocs = doctors.map(d => ({
        id: d._id.toString(),
        name: d.name,
        role: d.doctorRole || "Bác sĩ",
        degree: d.degree || "BS"
      }))

      const appointments = await Appointment.find({ status: "completed", date: { $regex: new RegExp("^" + id) } })
      const finalItems = mappedDocs.map(doc => getDoctorPayroll(doc, id, period.config, appointments))

      const adminUser = await User.findById(decoded.id)
      const adminName = adminUser?.name || "Quản trị viên"

      period.status = "closed"
      period.closedAt = new Date()
      period.closedBy = adminName
      period.items = finalItems
    }

    await period.save()

    return NextResponse.json({
      message: status === "closed" ? "Chốt kỳ lương thành công." : "Cập nhật kỳ lương thành công.",
      period: {
        id: period.periodId,
        name: period.name,
        status: period.status
      }
    })
  } catch (error: any) {
    console.error("PATCH Payroll Period Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi cập nhật kỳ lương." }, { status: 500 })
  }
}
