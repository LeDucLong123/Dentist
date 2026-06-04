import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import mongoose from "mongoose"
import dbConnect from "@/lib/db"
import Service from "@/models/Service"
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

    let service = await Service.findOne({ serviceId: id })
    if (!service && mongoose.Types.ObjectId.isValid(id)) {
      service = await Service.findById(id)
    }

    if (!service) {
      return NextResponse.json({ message: "Không tìm thấy dịch vụ." }, { status: 404 })
    }

    return NextResponse.json({
      id: service.serviceId,
      dbId: service._id.toString(),
      name: service.name,
      category: service.category,
      description: service.description || "",
      status: service.status || "active",
    })
  } catch (error: any) {
    console.error("GET Service Detail Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải chi tiết dịch vụ." }, { status: 500 })
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
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền cập nhật dịch vụ." }, { status: 403 })
    }

    const { id } = await params
    await dbConnect()

    let service = await Service.findOne({ serviceId: id })
    if (!service && mongoose.Types.ObjectId.isValid(id)) {
      service = await Service.findById(id)
    }

    if (!service) {
      return NextResponse.json({ message: "Không tìm thấy dịch vụ để cập nhật." }, { status: 404 })
    }

    const body = await req.json()
    const { name, category, description, status } = body

    if (name !== undefined) {
      if (!name.trim()) return NextResponse.json({ message: "Tên dịch vụ là bắt buộc." }, { status: 400 })
      service.name = name
    }

    if (category !== undefined) {
      if (!["Răng sứ & Implant", "Chỉnh nha", "Thẩm mỹ", "Tổng quát"].includes(category)) {
        return NextResponse.json({ message: "Chuyên khoa không hợp lệ." }, { status: 400 })
      }
      service.category = category
    }

    if (description !== undefined) {
      service.description = description
    }

    if (status !== undefined) {
      if (!["active", "locked"].includes(status)) {
        return NextResponse.json({ message: "Trạng thái không hợp lệ." }, { status: 400 })
      }
      service.status = status
    }

    await service.save()

    return NextResponse.json({
      message: "Cập nhật dịch vụ thành công.",
      service: {
        id: service.serviceId,
        name: service.name,
        category: service.category,
        description: service.description,
        status: service.status,
      },
    })
  } catch (error: any) {
    console.error("PATCH Update Service Error:", error)
    return NextResponse.json({ message: error.message || "Lỗi hệ thống khi cập nhật dịch vụ." }, { status: 500 })
  }
}
