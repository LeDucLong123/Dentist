import mongoose from "mongoose"

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    start: {
      type: String, // "HH:MM"
      required: true,
    },
    end: {
      type: String, // "HH:MM"
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "scheduled", "checked_in", "examining", "rescheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    room: {
      type: String,
    },
    note: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    paid: {
      type: Number,
      default: 0,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pricing",
      }
    ],
    symptoms: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    prescription: {
      type: String,
    },
    payments: [
      {
        date: { type: String },
        amount: { type: Number },
        method: { type: String },
      }
    ],
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema)
