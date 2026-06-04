import mongoose from "mongoose"

const PricingSchema = new mongoose.Schema(
  {
    pricingId: {
      type: String,
      required: true,
      unique: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    priceType: {
      type: String,
      required: true,
      enum: ["Thường", "VIP", "Khuyến mãi"],
    },
    standardPrice: {
      type: Number,
      required: [true, "Vui lòng nhập giá niêm yết"],
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["applied", "not_applied"],
      default: "applied",
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Pricing || mongoose.model("Pricing", PricingSchema)
