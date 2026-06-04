import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

const ROLE_TO_DB: Record<string, string> = {
  "Quản trị": "admin",
  "Bác sĩ": "doctor",
  "Bệnh nhân": "patient",
  "Lễ tân": "receptionist",
}

const ROLE_FROM_DB: Record<string, string> = {
  "admin": "Quản trị",
  "doctor": "Bác sĩ",
  "patient": "Bệnh nhân",
  "receptionist": "Lễ tân",
}

function formatJoinDate(dateStr: string | Date): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day} Th${month}, ${year}`
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    await dbConnect()
    const dbUsers = await User.find({}).sort({ createdAt: -1 })

    const formattedUsers = dbUsers.map((user) => {
      const uiRole = ROLE_FROM_DB[user.role] || "Bệnh nhân"
      const joinDate = formatJoinDate(user.createdAt)
      const lastActive = "Hôm nay, " + new Date(user.updatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: uiRole,
        status: user.status || "active",
        avatar: "",
        lastActive,
        joinDate,
      }
    })

    return NextResponse.json(formattedUsers)
  } catch (error: any) {
    console.error("GET Users Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải danh sách người dùng." }, { status: 500 })
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
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền tạo người dùng." }, { status: 403 })
    }

    await dbConnect()
    const body = await req.json()
    const { name, email, phone, role, specialty, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu." }, { status: 400 })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ message: "Email này đã được sử dụng." }, { status: 400 })
    }

    const dbRole = ROLE_TO_DB[role] || "patient"

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      role: dbRole,
      specialty: dbRole === "doctor" ? (specialty || "cử nhân") : undefined,
      password,
      status: "active",
    })

    return NextResponse.json({
      message: "Tạo người dùng thành công.",
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: ROLE_FROM_DB[newUser.role] || "Bệnh nhân",
        status: newUser.status,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error("POST Create User Error:", error)
    return NextResponse.json({ message: error.message || "Lỗi hệ thống khi tạo người dùng." }, { status: 500 })
  }
}
