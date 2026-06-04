import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()
    
    const body = await req.json()
    const { name, email, password, role } = body
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu." },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu phải chứa ít nhất 6 ký tự." },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng." },
        { status: 400 }
      )
    }

    // Create user - register is always patient
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "patient",
    })

    return NextResponse.json(
      {
        message: "Đăng ký tài khoản thành công.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Register Error:", error)
    return NextResponse.json(
      { message: "Đã xảy ra lỗi hệ thống khi đăng ký." },
      { status: 500 }
    )
  }
}
