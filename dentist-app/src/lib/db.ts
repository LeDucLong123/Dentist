import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = (global as any).mongoose as MongooseCache

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      return mongooseInstance
    })
  }

  try {
    cached.conn = await cached.promise
    
    // Auto-seed default admin user if no admin exists
    if (cached.conn && !(global as any).adminSeeded) {
      (global as any).adminSeeded = true
      try {
        const User = (await import("@/models/User")).default
        const adminExists = await User.findOne({ role: "admin" })
        if (!adminExists) {
          await User.create({
            name: "Admin System",
            email: "admin@clinicserenity.vn",
            password: "admin123",
            role: "admin",
          })
          console.log("Auto-seeded default admin user successfully.")
        }

        // Auto-seed default doctors if no doctor exists
        const doctorExists = await User.findOne({ role: "doctor" })
        if (!doctorExists) {
          const defaultDoctors = [
            {
              name: "BS. Phạm Thành Nam",
              email: "nam.pham@serenity.vn",
              phone: "0901 234 567",
              role: "doctor",
              degree: "Tiến sĩ",
              specialty: "Cấy ghép Implant",
              status: "active",
              password: "doctor123",
            },
            {
              name: "ThS.BS. Nguyễn Minh Thư",
              email: "thu.nguyen@serenity.vn",
              phone: "0932 888 999",
              role: "doctor",
              degree: "Thạc sĩ",
              specialty: "Chỉnh nha (Niềng răng)",
              status: "active",
              password: "doctor123",
            },
            {
              name: "BS. Lê Hoàng Vũ",
              email: "vu.le@serenity.vn",
              phone: "0977 111 222",
              role: "doctor",
              degree: "BSCK I",
              specialty: "Nha khoa Tổng quát",
              status: "locked",
              password: "doctor123",
            },
            {
              name: "BS. Trần Mai Anh",
              email: "maianh.tran@serenity.vn",
              phone: "0988 333 444",
              role: "doctor",
              degree: "BSCK II",
              specialty: "Nha khoa Thẩm mỹ",
              status: "active",
              password: "doctor123",
            },
            {
              name: "BS. Đỗ Quang Khải",
              email: "khai.do@serenity.vn",
              phone: "0912 555 666",
              role: "doctor",
              degree: "Thạc sĩ",
              specialty: "Nha khoa Trẻ em",
              status: "active",
              password: "doctor123",
            }
          ]
          await User.create(defaultDoctors)
          console.log("Auto-seeded default doctors successfully.")
        }
      } catch (err) {
        (global as any).adminSeeded = false
        console.error("Auto-seeding admin/doctors failed:", err)
      }
    }
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect
