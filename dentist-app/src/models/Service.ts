import mongoose from "mongoose"

const ServiceSchema = new mongoose.Schema(
  {
    serviceId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên dịch vụ"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Vui lòng chọn chuyên khoa"],
      enum: ["Răng sứ & Implant", "Chỉnh nha", "Thẩm mỹ", "Tổng quát"],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "locked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema)
