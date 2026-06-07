import mongoose from "mongoose"

const DoctorDutySchema = new mongoose.Schema(
  {
    doctorId: { type: String, required: true },
    dayOfWeek: { type: Number, required: true }, // 0 for Sunday, 1-6 for Mon-Sat
    shift: { type: String, enum: ["morning", "afternoon", "evening", "off"], default: "off" },
    room: { type: String, default: "" },
  },
  { timestamps: true }
)

// Ensure uniqueness per doctor per day of the week
DoctorDutySchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true })

export default mongoose.models.DoctorDuty || mongoose.model("DoctorDuty", DoctorDutySchema)
