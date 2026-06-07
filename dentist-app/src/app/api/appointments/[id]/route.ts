import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import Appointment from "@/models/Appointment"
import { verifyToken } from "@/lib/auth"

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
    const apt = await Appointment.findOne({ appointmentId: id })
      .populate("patientId")
      .populate("doctorId")
      .populate("items")

    if (!apt) {
      return NextResponse.json({ message: "Không tìm thấy lịch khám." }, { status: 404 })
    }

    const formatted = {
      id: apt.appointmentId,
      patient: apt.patientId?.name || "Bệnh nhân",
      patientId: apt.patientId?._id?.toString() || "",
      patientPhone: apt.patientId?.phone || "---",
      patientEmail: apt.patientId?.email || "---",
      patientAddress: apt.patientId?.address || "---",
      patientDob: apt.patientId?.dob || "",
      doctor: apt.doctorId?.name || "Bác sĩ",
      doctorId: apt.doctorId?._id?.toString() || "",
      doctorSpecialty: apt.doctorId?.specialty || "---",
      doctorPhone: apt.doctorId?.phone || "---",
      service: apt.items && apt.items.length > 0 ? apt.items[0].serviceName : "Chưa chọn dịch vụ",
      date: apt.date || "",
      start: apt.start || "--:--",
      end: apt.end || "--:--",
      status: apt.status || "scheduled",
      room: apt.room || "---",
      note: apt.note || "",
      price: apt.price || 0,
      discount: apt.discount || 0,
      paid: apt.paid || 0,
      items: apt.items?.map((item: any) => ({
        id: item._id?.toString(),
        pricingId: item.pricingId,
        name: item.serviceName,
        price: item.standardPrice,
        qty: 1,
        unit: "ca",
        type: item.priceType === "VIP" ? "vip" : item.priceType === "Khuyến mãi" ? "khuyenmai" : "thuong"
      })) || [],
      symptoms: apt.symptoms || "",
      diagnosis: apt.diagnosis || "",
      prescription: apt.prescription || "",
      payments: apt.payments || [],
    }

    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error("GET Appointment Detail Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải chi tiết lịch khám." }, { status: 500 })
  }
}

export async function PATCH(
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
    const body = await req.json()

    const apt = await Appointment.findOne({ appointmentId: id })
    if (!apt) {
      return NextResponse.json({ message: "Không tìm thấy lịch khám." }, { status: 404 })
    }

    const nextRoom = body.room !== undefined ? body.room : apt.room
    const nextDate = body.date !== undefined ? body.date : apt.date
    const nextStart = body.start !== undefined ? body.start : apt.start
    const nextEnd = body.end !== undefined ? body.end : apt.end
    const nextStatus = body.status !== undefined ? body.status : apt.status

    if (nextRoom && nextStatus !== "cancelled") {
      const overlappingRoom = await Appointment.findOne({
        appointmentId: { $ne: id },
        date: nextDate,
        room: nextRoom,
        start: { $lt: nextEnd },
        end: { $gt: nextStart },
        status: { $ne: "cancelled" }
      })

      if (overlappingRoom) {
        return NextResponse.json({
          message: `Phòng khám "${nextRoom}" đã có lịch hẹn từ ${overlappingRoom.start} đến ${overlappingRoom.end}. Vui lòng chọn phòng khám khác hoặc thời gian khác.`
        }, { status: 400 })
      }
    }

    const updatableFields = [
      "status", "date", "start", "end", "room", "note",
      "price", "discount", "paid", "symptoms",
      "diagnosis", "prescription", "payments"
    ]

    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        (apt as any)[field] = body[field]
      }
    }

    if (body.items !== undefined) {
      const resolvedIds = []
      const PricingModel = (await import("@/models/Pricing")).default
      const pricings = await PricingModel.find({})

      for (const item of body.items) {
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
      apt.items = resolvedIds
    }

    await apt.save()

    return NextResponse.json({
      message: "Cập nhật lịch khám thành công.",
      appointment: {
        id: apt.appointmentId,
        status: apt.status,
        date: apt.date,
        start: apt.start,
        end: apt.end,
        room: apt.room,
      }
    })
  } catch (error: any) {
    console.error("PATCH Appointment Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi cập nhật lịch khám." }, { status: 500 })
  }
}
