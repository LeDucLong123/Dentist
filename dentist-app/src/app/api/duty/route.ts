import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import DoctorDuty from "@/models/DoctorDuty"
import { verifyToken } from "@/lib/auth"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    await dbConnect()
    const duties = await DoctorDuty.find({})

    const formatted: Record<string, Record<number, { shift: string; room: string }>> = {}

    if (duties.length === 0) {
      return NextResponse.json({})
    }

    // Populate formatted object
    duties.forEach((d) => {
      if (!formatted[d.doctorId]) {
        formatted[d.doctorId] = {}
      }
      formatted[d.doctorId][d.dayOfWeek] = {
        shift: d.shift,
        room: d.room
      }
    })

    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error("GET Duty Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải lịch trực." }, { status: 500 })
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
    const { weeklyDuty } = await req.json()

    if (!weeklyDuty) {
      return NextResponse.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 })
    }

    const promises = []
    for (const [docId, days] of Object.entries(weeklyDuty)) {
      for (const [dayStr, item] of Object.entries(days as any)) {
        const dayOfWeek = parseInt(dayStr)
        const typedItem = item as { shift: string; room: string }
        promises.push(
          DoctorDuty.findOneAndUpdate(
            { doctorId: docId, dayOfWeek },
            { shift: typedItem.shift, room: typedItem.room },
            { upsert: true, new: true }
          )
        )
      }
    }

    await Promise.all(promises)
    return NextResponse.json({ message: "Lưu lịch trực thành công." })
  } catch (error: any) {
    console.error("POST Duty Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi lưu lịch trực." }, { status: 500 })
  }
}
