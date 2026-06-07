import mongoose from "mongoose"

const PayrollPeriodSchema = new mongoose.Schema(
  {
    periodId: { type: String, required: true, unique: true }, // e.g. "2026-05"
    name: { type: String, required: true }, // e.g. "Tháng 05/2026"
    startDate: { type: String, required: true }, // "YYYY-MM-DD"
    endDate: { type: String, required: true }, // "YYYY-MM-DD"
    status: { type: String, enum: ["draft", "closed"], default: "draft" },
    closedAt: { type: Date },
    closedBy: { type: String },
    config: {
      hourlyRate: { type: Number, required: true, default: 150000 },
      weekendCoef: { type: Number, required: true, default: 1.5 },
      nightCoef: { type: Number, required: true, default: 1.5 },
      coefDegree: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          "Đại học": 1.3,
          "Thạc sĩ": 1.5,
          "BSCK I": 1.5,
          "BSCK II": 1.7,
          "Tiến sĩ": 1.7,
          "Phó Giáo sư": 2.0,
          "Giáo sư": 2.5
        }
      },
      baseSalaries: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          "Trưởng khoa": 0,
          "BS Chính": 0,
          "BS Phụ": 0,
          "Bác sĩ": 0
        }
      }
    },
    items: { type: mongoose.Schema.Types.Mixed } // Array of DoctorPayrollItem when closed
  },
  { timestamps: true }
)

export default mongoose.models.PayrollPeriod || mongoose.model("PayrollPeriod", PayrollPeriodSchema)
