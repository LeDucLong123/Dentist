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
    
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy người dùng." }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: ROLE_FROM_DB[user.role] || "Bệnh nhân",
      status: user.status || "active",
      specialty: user.specialty || "cử nhân",
      joinDate: formatJoinDate(user.createdAt),
      lastActive: "Hôm nay, " + new Date(user.updatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      dob: user.dob || "",
      address: user.address || "",
    })
  } catch (error: any) {
    console.error("GET User Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải thông tin người dùng." }, { status: 500 })
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
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền cập nhật người dùng." }, { status: 403 })
    }

    const { id } = await params
    await dbConnect()
    
    const body = await req.json()
    const { status, name, email, phone, role, specialty, password, dob, address } = body

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy người dùng." }, { status: 404 })
    }

    // Update status if provided
    if (status !== undefined) {
      if (!["active", "locked"].includes(status)) {
        return NextResponse.json({ message: "Trạng thái không hợp lệ." }, { status: 400 })
      }
      // Do not allow locking oneself
      if (user._id.toString() === decoded.id && status === "locked") {
        return NextResponse.json({ message: "Bạn không thể tự khóa tài khoản của chính mình." }, { status: 400 })
      }
      user.status = status
    }

    // Update name if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ message: "Họ và tên là bắt buộc." }, { status: 400 })
      }
      user.name = name
    }

    // Update email if provided
    if (email !== undefined) {
      if (!email.trim()) {
        return NextResponse.json({ message: "Email là bắt buộc." }, { status: 400 })
      }
      if (email.toLowerCase() !== user.email) {
        const existing = await User.findOne({ email: email.toLowerCase() })
        if (existing) {
          return NextResponse.json({ message: "Email này đã được sử dụng." }, { status: 400 })
        }
      }
      user.email = email.toLowerCase()
    }

    // Update phone if provided
    if (phone !== undefined) {
      user.phone = phone
    }

    // Update role if provided
    if (role !== undefined) {
      const dbRole = ROLE_TO_DB[role] || "patient"
      user.role = dbRole
      if (dbRole === "doctor") {
        user.specialty = specialty || "cử nhân"
      } else {
        user.specialty = undefined
      }
    } else if (specialty !== undefined && user.role === "doctor") {
      user.specialty = specialty
    }

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ message: "Mật khẩu phải từ 6 ký tự trở lên." }, { status: 400 })
      }
      user.password = password
    }

    if (dob !== undefined) {
      user.dob = dob
    }
    if (address !== undefined) {
      user.address = address
    }

    await user.save()

    return NextResponse.json({
      message: "Cập nhật người dùng thành công.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: ROLE_FROM_DB[user.role] || "Bệnh nhân",
        status: user.status,
        specialty: user.specialty || "",
      },
    })
  } catch (error: any) {
    console.error("PATCH User Error:", error)
    return NextResponse.json({ message: error.message || "Lỗi hệ thống khi cập nhật người dùng." }, { status: 500 })
  }
}
