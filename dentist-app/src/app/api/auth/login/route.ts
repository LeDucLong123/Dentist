import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { signToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    await dbConnect()
    
    const body = await req.json()
    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng cung cấp cả email và mật khẩu." },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      )
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      )
    }

    // Verify if user is admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Chỉ quản trị viên (role admin) mới có quyền truy cập hệ thống." },
        { status: 403 }
      )
    }

    // Generate JWT access token
    const accessToken = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      message: "Đăng nhập thành công.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    })
  } catch (error: any) {
    console.error("Login Error:", error)
    return NextResponse.json(
      { message: "Đã xảy ra lỗi hệ thống khi đăng nhập." },
      { status: 500 }
    )
  }
}
