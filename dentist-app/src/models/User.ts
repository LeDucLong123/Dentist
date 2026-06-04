import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên đầy đủ"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: [6, "Mật khẩu phải từ 6 ký tự trở lên"],
    },
    role: {
      type: String,
      enum: ["admin", "patient", "receptionist", "doctor"],
      default: "patient",
    },
    phone: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "locked"],
      default: "active",
    },
    specialty: {
      type: String,
    },
    degree: {
      type: String,
    },
    doctorRole: {
      type: String,
    },
    badge: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Pre-save hook to hash password
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return
  }
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error: any) {
    throw error;
  }
})

export default mongoose.models.User || mongoose.model("User", UserSchema)
