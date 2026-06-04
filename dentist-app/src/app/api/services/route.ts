import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import Service from "@/models/Service"
import { verifyToken } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    await dbConnect()
    const dbServices = await Service.find({}).sort({ serviceId: -1 })

    const formattedServices = dbServices.map((s) => ({
      id: s.serviceId,
      dbId: s._id.toString(), // Keep MongoDB ObjectId for lookups if needed
      name: s.name,
      category: s.category,
      description: s.description || "",
      status: s.status || "active",
    }))

    return NextResponse.json(formattedServices)
  } catch (error: any) {
    console.error("GET Services Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải danh sách dịch vụ." }, { status: 500 })
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
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền tạo dịch vụ mới." }, { status: 403 })
    }

    await dbConnect()
    const body = await req.json()
    const { name, category, description, status } = body

    if (!name || !category) {
      return NextResponse.json({ message: "Vui lòng nhập đầy đủ tên dịch vụ và chuyên khoa." }, { status: 400 })
    }

    // Auto-generate next serviceId
    const lastService = await Service.findOne({}).sort({ serviceId: -1 })
    let nextNumber = 1
    if (lastService && lastService.serviceId) {
      const lastNum = parseInt(lastService.serviceId.replace("DV", ""), 10)
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1
      }
    }
    const serviceId = `DV${String(nextNumber).padStart(3, '0')}`

    const newService = await Service.create({
      serviceId,
      name,
      category,
      description,
      status: status || "active",
    })

    return NextResponse.json({
      message: "Tạo dịch vụ thành công.",
      service: {
        id: newService.serviceId,
        name: newService.name,
        category: newService.category,
        description: newService.description,
        status: newService.status,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error("POST Create Service Error:", error)
    return NextResponse.json({ message: error.message || "Lỗi hệ thống khi tạo dịch vụ." }, { status: 500 })
  }
}
