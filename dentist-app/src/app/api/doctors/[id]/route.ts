import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import User from "@/models/User"
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

    const doc = await User.findOne({ _id: id, role: "doctor" })
    if (!doc) {
      return NextResponse.json({ message: "Không tìm thấy bác sĩ." }, { status: 404 })
    }

    return NextResponse.json({
      id: doc._id.toString(),
      name: doc.name,
      role: "",
      degree: doc.degree || "BS",
      specialty: doc.specialty || "Nha khoa Tổng quát",
      phone: doc.phone || "",
      email: doc.email,
      status: doc.status || "active",
      badge: "",
    })
  } catch (error: any) {
    console.error("GET Doctor Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải thông tin bác sĩ." }, { status: 500 })
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
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền cập nhật bác sĩ." }, { status: 403 })
    }

    const { id } = await params
    await dbConnect()

    const body = await req.json()
    const { degree, specialty } = body

    if (!degree || !specialty) {
      return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin bác sĩ." }, { status: 400 })
    }

    const doc = await User.findOne({ _id: id, role: "doctor" })
    if (!doc) {
      return NextResponse.json({ message: "Không tìm thấy bác sĩ để cập nhật." }, { status: 404 })
    }

    doc.degree = degree
    doc.specialty = specialty
    doc.doctorRole = undefined
    doc.badge = undefined

    await doc.save()

    return NextResponse.json({
      message: "Cập nhật hồ sơ bác sĩ thành công.",
      doctor: {
        id: doc._id.toString(),
        name: doc.name,
        role: "",
        degree: doc.degree,
        specialty: doc.specialty,
        status: doc.status,
      },
    })
  } catch (error: any) {
    console.error("PATCH Doctor Error:", error)
    return NextResponse.json({ message: error.message || "Lỗi hệ thống khi cập nhật hồ sơ bác sĩ." }, { status: 500 })
  }
}
