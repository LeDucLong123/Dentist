import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import Pricing from "@/models/Pricing"
import { verifyToken } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: "Không được phép truy cập." }, { status: 401 })
    }

    await dbConnect()
    const dbPricing = await Pricing.find({}).sort({ pricingId: -1 })

    const formattedPricing = dbPricing.map((p) => ({
      id: p.pricingId,
      dbId: p._id.toString(),
      serviceId: p.serviceId,
      serviceName: p.serviceName,
      priceType: p.priceType,
      standardPrice: p.standardPrice,
      validFrom: p.validFrom.toISOString().split("T")[0],
      validTo: p.validTo ? p.validTo.toISOString().split("T")[0] : null,
      status: p.status || "applied",
    }))

    return NextResponse.json(formattedPricing)
  } catch (error: any) {
    console.error("GET Pricing Error:", error)
    return NextResponse.json({ message: "Lỗi hệ thống khi tải danh sách bảng giá." }, { status: 500 })
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
      return NextResponse.json({ message: "Chỉ quản trị viên mới có quyền tạo bảng giá." }, { status: 403 })
    }

    await dbConnect()
    const body = await req.json()
    const { serviceId, serviceName, priceType, standardPrice, validFrom, validTo, status } = body

    if (!serviceName || !priceType || standardPrice === undefined || !validFrom) {
      return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin bảng giá." }, { status: 400 })
    }

    // Auto-generate next pricingId
    const lastPricing = await Pricing.findOne({}).sort({ pricingId: -1 })
    let nextNumber = 1
    if (lastPricing && lastPricing.pricingId) {
      const lastNum = parseInt(lastPricing.pricingId.replace("BG", ""), 10)
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1
      }
    }
    const pricingId = `BG${String(nextNumber).padStart(3, '0')}`

    const newPricing = await Pricing.create({
      pricingId,
      serviceId: serviceId || "DV_UNKNOWN",
      serviceName,
      priceType,
      standardPrice: Number(standardPrice),
      validFrom: new Date(validFrom),
      validTo: validTo ? new Date(validTo) : null,
      status: status || "applied",
    })

    return NextResponse.json({
      message: "Tạo bảng giá thành công.",
      pricing: {
        id: newPricing.pricingId,
        serviceId: newPricing.serviceId,
        serviceName: newPricing.serviceName,
        priceType: newPricing.priceType,
        standardPrice: newPricing.standardPrice,
        validFrom: newPricing.validFrom.toISOString().split("T")[0],
        validTo: newPricing.validTo ? newPricing.validTo.toISOString().split("T")[0] : null,
        status: newPricing.status,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error("POST Create Pricing Error:", error)
    return NextResponse.json({ message: error.message || "Lỗi hệ thống khi tạo bảng giá." }, { status: 500 })
  }
}
