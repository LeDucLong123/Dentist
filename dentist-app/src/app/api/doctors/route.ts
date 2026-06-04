import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    await dbConnect()
    const dbDoctors = await User.find({ role: "doctor" }).sort({ createdAt: -1 })

    const formattedDoctors = dbDoctors.map((doc) => {
      return {
        id: doc._id.toString(),
        name: doc.name,
        role: "",
        degree: doc.degree || "BS",
        specialty: doc.specialty || "Nha khoa Tổng quát",
        phone: doc.phone || "",
        email: doc.email,
        status: doc.status || "active",
        badge: "",
      }
    })

    return NextResponse.json(formattedDoctors)
  } catch (error: any) {
    console.error("GET Doctors Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải danh sách bác sĩ." }, { status: 500 })
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
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền cập nhật bác sĩ." }, { status: 403 })
    }

    await dbConnect()
    const body = await req.json()
    const { userId, degree, specialty } = body

    if (!userId || !degree || !specialty) {
      return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin bác sĩ." }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy người dùng để liên kết." }, { status: 404 })
    }

    user.role = "doctor"
    user.doctorRole = undefined
    user.degree = degree
    user.specialty = specialty
    user.badge = undefined

    await user.save()

    return NextResponse.json({
      message: "Tạo hồ sơ bác sĩ thành công.",
      doctor: {
        id: user._id.toString(),
        name: user.name,
        role: "",
        degree: user.degree,
        specialty: user.specialty,
        status: user.status,
      },
    })
  } catch (error: any) {
    console.error("POST Doctor Error:", error)
    return NextResponse.json({ message: error.message || "Lỗi hệ thống khi lưu hồ sơ bác sĩ." }, { status: 500 })
  }
}
