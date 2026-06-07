import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import Appointment from "@/models/Appointment"
import { verifyToken } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    await dbConnect()
    const dbAppointments = await Appointment.find({})
      .populate("patientId")
      .populate("doctorId")
      .populate("items")
      .sort({ date: 1, start: 1 })
    
    const formatted = dbAppointments.map((apt: any) => ({
      id: apt.appointmentId,
      patient: apt.patientId?.name || "Bệnh nhân",
      patientId: apt.patientId?._id?.toString() || "",
      doctor: apt.doctorId?.name || "Bác sĩ",
      doctorId: apt.doctorId?._id?.toString() || "",
      service: apt.items && apt.items.length > 0 ? apt.items[0].serviceName : "Khám tổng quát",
      date: apt.date,
      start: apt.start,
      end: apt.end,
      status: apt.status,
      price: apt.price || 0,
      discount: apt.discount || 0,
      paid: apt.paid || 0,
    }))

    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error("GET Appointments Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải danh sách lịch khám." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    await dbConnect()
    const body = await req.json()
    const { 
      patient,
      doctor,
      date,
      start,
      end,
      room,
      note,
      items,
      price,
      discount,
      paid,
    } = body

    if (!patient || !doctor || !date || !start || !end || !room) {
      return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc." }, { status: 400 })
    }

    // Check for room conflict: same date, same room, overlapping time slot
    const overlappingRoom = await Appointment.findOne({
      date,
      room,
      start: { $lt: end },
      end: { $gt: start },
      status: { $ne: "cancelled" }
    })

    if (overlappingRoom) {
      return NextResponse.json({
        message: `Phòng khám "${room}" đã có lịch hẹn từ ${overlappingRoom.start} đến ${overlappingRoom.end}. Vui lòng chọn phòng khám khác hoặc thời gian khác.`
      }, { status: 400 })
    }

    // Auto-generate next appointmentId
    const lastApt = await Appointment.findOne({ appointmentId: /^LK\d+$/ }).sort({ appointmentId: -1 })
    let nextNum = 1
    if (lastApt && lastApt.appointmentId) {
      const match = lastApt.appointmentId.match(/^LK(\d+)$/)
      if (match) {
        nextNum = parseInt(match[1]) + 1
      }
    }
    const appointmentId = `LK${String(nextNum).padStart(3, "0")}`

    const PricingModel = (await import("@/models/Pricing")).default
    const pricings = await PricingModel.find({})
    const resolvedIds = []

    if (items && items.length > 0) {
      for (const item of items) {
        const itemId = typeof item === "string" ? item : (item.id || item._id)
        if (itemId && itemId.length === 24) {
          resolvedIds.push(itemId)
        } else if (item.name) {
          const mappedType = item.type === "vip" ? "VIP" : item.type === "khuyenmai" ? "Khuyến mãi" : "Thường"
          const matchedPricing = pricings.find(pr => 
            pr.serviceName.toLowerCase() === item.name.toLowerCase() && 
            pr.priceType === mappedType
          )
          if (matchedPricing) {
            resolvedIds.push(matchedPricing._id)
          } else {
            const matchedNameOnly = pricings.find(pr => pr.serviceName.toLowerCase() === item.name.toLowerCase())
            if (matchedNameOnly) {
              resolvedIds.push(matchedNameOnly._id)
            }
          }
        }
      }
    }

    const newApt = await Appointment.create({
      appointmentId,
      patientId: patient.id,
      doctorId: doctor.id,
      date,
      start,
      end,
      room,
      note,
      items: resolvedIds,
      price: price || 0,
      discount: discount || 0,
      paid: paid || 0,
      status: "scheduled",
    })

    const populatedApt = await Appointment.findById(newApt._id)
      .populate("patientId")
      .populate("doctorId")
      .populate("items")

    return NextResponse.json({
      message: "Tạo lịch hẹn thành công.",
      appointment: {
        id: populatedApt.appointmentId,
        patient: populatedApt.patientId?.name || "",
        doctor: populatedApt.doctorId?.name || "",
        service: populatedApt.items && populatedApt.items.length > 0 ? populatedApt.items[0].serviceName : "Khám tổng quát",
        date: populatedApt.date,
        start: populatedApt.start,
        end: populatedApt.end,
        status: populatedApt.status,
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error("POST Appointment Error:", error)
    return NextResponse.json({ message: error.message || "Lỗi hệ thống khi tạo lịch khám." }, { status: 500 })
  }
}
