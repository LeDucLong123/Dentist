import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import mongoose from "mongoose"
import dbConnect from "@/lib/db"
import Pricing from "@/models/Pricing"
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

    let pricing = await Pricing.findOne({ pricingId: id })
    if (!pricing && mongoose.Types.ObjectId.isValid(id)) {
      pricing = await Pricing.findById(id)
    }

    if (!pricing) {
      return NextResponse.json({ message: "Không tìm thấy bảng giá." }, { status: 404 })
    }

    return NextResponse.json({
      id: pricing.pricingId,
      dbId: pricing._id.toString(),
      serviceId: pricing.serviceId,
      serviceName: pricing.serviceName,
      priceType: pricing.priceType,
      standardPrice: pricing.standardPrice,
      validFrom: pricing.validFrom.toISOString().split("T")[0],
      validTo: pricing.validTo ? pricing.validTo.toISOString().split("T")[0] : null,
      status: pricing.status || "applied",
    })
  } catch (error: any) {
    console.error("GET Pricing Detail Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải chi tiết bảng giá." }, { status: 500 })
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
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền cập nhật bảng giá." }, { status: 403 })
    }

    const { id } = await params
    await dbConnect()

    let pricing = await Pricing.findOne({ pricingId: id })
    if (!pricing && mongoose.Types.ObjectId.isValid(id)) {
      pricing = await Pricing.findById(id)
    }

    if (!pricing) {
      return NextResponse.json({ message: "Không tìm thấy bảng giá để cập nhật." }, { status: 404 })
    }

    const body = await req.json()
    const { serviceId, serviceName, priceType, standardPrice, validFrom, validTo, status } = body

    if (serviceId !== undefined) pricing.serviceId = serviceId
    if (serviceName !== undefined) {
      if (!serviceName.trim()) return NextResponse.json({ message: "Tên dịch vụ là bắt buộc." }, { status: 400 })
      pricing.serviceName = serviceName
    }
    if (priceType !== undefined) {
      if (!["Thường", "VIP", "Khuyến mãi"].includes(priceType)) {
        return NextResponse.json({ message: "Loại giá không hợp lệ." }, { status: 400 })
      }
      pricing.priceType = priceType
    }
    if (standardPrice !== undefined) {
      const parsedPrice = Number(standardPrice)
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ message: "Giá niêm yết không hợp lệ." }, { status: 400 })
      }
      pricing.standardPrice = parsedPrice
    }
    if (validFrom !== undefined) pricing.validFrom = new Date(validFrom)
    if (validTo !== undefined) pricing.validTo = validTo ? new Date(validTo) : null
    if (status !== undefined) {
      if (!["applied", "not_applied"].includes(status)) {
        return NextResponse.json({ message: "Trạng thái không hợp lệ." }, { status: 400 })
      }
      pricing.status = status
    }

    await pricing.save()

    return NextResponse.json({
      message: "Cập nhật bảng giá thành công.",
      pricing: {
        id: pricing.pricingId,
        serviceId: pricing.serviceId,
        serviceName: pricing.serviceName,
        priceType: pricing.priceType,
        standardPrice: pricing.standardPrice,
        validFrom: pricing.validFrom.toISOString().split("T")[0],
        validTo: pricing.validTo ? pricing.validTo.toISOString().split("T")[0] : null,
        status: pricing.status,
      },
    })
  } catch (error: any) {
    console.error("PATCH Update Pricing Error:", error)
    return NextResponse.json({ message: error.message || "Lỗi hệ thống khi cập nhật bảng giá." }, { status: 500 })
  }
}
