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

        // Auto-seed default doctors if no doctor exists or check and insert missing ones
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
            status: "active",
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

        for (const doc of defaultDoctors) {
          const exists = await User.findOne({ email: doc.email })
          if (!exists) {
            await User.create(doc)
          }
        }
        console.log("Verified default doctors seeding.")

        // Auto-seed default patients
        const defaultPatients = [
          {
            name: "Nguyễn Văn An",
            email: "nva@email.com",
            phone: "0912 345 678",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1990-03-15",
            address: "123 Lê Lợi, Q.1, TP.HCM",
          },
          {
            name: "Trần Thị Bích",
            email: "ttb@email.com",
            phone: "0987 654 321",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1995-07-22",
            address: "45 Nguyễn Huệ, Q.1, TP.HCM",
          },
          {
            name: "Lê Hoàng Cường",
            email: "lvc@email.com",
            phone: "0909 111 222",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1988-11-03",
            address: "78 Trần Hưng Đạo, Q.5, TP.HCM",
          },
          {
            name: "Phạm Thị Dung",
            email: "ptd@email.com",
            phone: "0934 567 890",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1985-02-28",
            address: "56 Võ Văn Tần, Q.3, TP.HCM",
          },
          {
            name: "Đỗ Văn Minh",
            email: "dvm@email.com",
            phone: "0965 444 555",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1993-09-12",
            address: "89 Nguyễn Đình Chiểu, Q.3, TP.HCM",
          },
          {
            name: "Hoàng Minh Đức",
            email: "hme@email.com",
            phone: "0912 888 999",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1991-04-05",
            address: "34 Đinh Tiên Hoàng, Q.BT, TP.HCM",
          },
          {
            name: "Vũ Thị Thảo",
            email: "vtf@email.com",
            phone: "0987 111 333",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1994-12-20",
            address: "67 Lý Thường Kiệt, Q.10, TP.HCM",
          },
          {
            name: "Đặng Văn Hùng",
            email: "dvg@email.com",
            phone: "0909 777 888",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1987-08-15",
            address: "23 Cách Mạng Tháng 8, Q.TB, TP.HCM",
          },
          {
            name: "Bùi Thị Lan",
            email: "bth@email.com",
            phone: "0934 222 111",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1989-01-30",
            address: "101 Nguyễn Văn Cừ, Q.5, TP.HCM",
          },
          {
            name: "Lý Văn Nam",
            email: "lvx@email.com",
            phone: "0999 888 777",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1998-05-12",
            address: "123 Nguyễn Văn Hưởng, Q.2, TP.HCM",
          },
          {
            name: "Phan Văn Nam",
            email: "pvn@email.com",
            phone: "0912 888 999",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1987-08-15",
            address: "23 Cách Mạng Tháng 8, Q.TB, TP.HCM",
          },
          {
            name: "Trần Văn Hùng",
            email: "tvh@email.com",
            phone: "0987 111 333",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1994-12-20",
            address: "67 Lý Thường Kiệt, Q.10, TP.HCM",
          },
          {
            name: "Nguyễn Thị Thủy",
            email: "ntt@email.com",
            phone: "0909 777 888",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1991-04-05",
            address: "34 Đinh Tiên Hoàng, Q.BT, TP.HCM",
          },
          {
            name: "Lê Văn Tám",
            email: "lvt@email.com",
            phone: "0934 222 111",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1989-01-30",
            address: "101 Nguyễn Văn Cừ, Q.5, TP.HCM",
          },
          {
            name: "Nguyễn Thị Mai",
            email: "ntm@email.com",
            phone: "0912 345 678",
            role: "patient",
            status: "active",
            password: "patient123",
            dob: "1990-03-15",
            address: "123 Lê Lợi, Q.1, TP.HCM",
          }
        ]

        for (const pat of defaultPatients) {
          const exists = await User.findOne({ email: pat.email })
          if (!exists) {
            await User.create(pat)
          }
        }
        console.log("Verified default patients seeding.")

        // Auto-seed default services
        const ServiceModel = (await import("@/models/Service")).default
        const PricingModel = (await import("@/models/Pricing")).default

        const hasKhamTongQuat = await ServiceModel.findOne({ name: "Khám tổng quát" })
        if (!hasKhamTongQuat) {
          console.log("Missing new services. Dropping services and pricings collections to re-seed...")
          await ServiceModel.deleteMany({})
          await PricingModel.deleteMany({})
        }

        const serviceExists = await ServiceModel.findOne({})
        if (!serviceExists) {
          const defaultServices = [
            {
              serviceId: "DV001",
              name: "Cấy ghép Implant",
              category: "Răng sứ & Implant",
              status: "active",
              description: "Giải pháp phục hồi răng đã mất hiệu quả nhất hiện nay.",
            },
            {
              serviceId: "DV002",
              name: "Chỉnh nha mắc cài kim loại",
              category: "Chỉnh nha",
              status: "active",
              description: "Cải thiện khớp cắn và thẩm mỹ nụ cười.",
            },
            {
              serviceId: "DV003",
              name: "Tẩy trắng răng Laser",
              category: "Thẩm mỹ",
              status: "active",
              description: "Công nghệ làm trắng răng nhanh chóng, không ê buốt.",
            },
            {
              serviceId: "DV004",
              name: "Nhổ răng khôn",
              category: "Tổng quát",
              status: "active",
              description: "Nhổ răng khôn mọc lệch, mọc ngầm bằng công nghệ siêu âm Piezotome.",
            },
            {
              serviceId: "DV005",
              name: "Bọc răng sứ Zirconia",
              category: "Răng sứ & Implant",
              status: "active",
              description: "Phục hình thẩm mỹ với vật liệu sứ Zirconia cao cấp.",
            },
            {
              serviceId: "DV006",
              name: "Khám tổng quát",
              category: "Tổng quát",
              status: "active",
              description: "Khám định kỳ, tư vấn và kiểm tra răng miệng.",
            },
            {
              serviceId: "DV007",
              name: "Chụp phim X-quang",
              category: "Tổng quát",
              status: "active",
              description: "Chụp X-quang quanh chóp, X-quang toàn cảnh khảo sát cấu trúc xương hàm.",
            }
          ]
          await ServiceModel.create(defaultServices)
          console.log("Auto-seeded default services successfully.")
        }

        // Auto-seed default pricing
        const pricingExists = await PricingModel.findOne({})
        if (!pricingExists) {
          const defaultPricing = [
            {
              pricingId: "BG001",
              serviceId: "DV001",
              serviceName: "Cấy ghép Implant",
              priceType: "VIP",
              standardPrice: 18000000,
              validFrom: new Date("2026-05-01"),
              validTo: new Date("2026-12-31"),
              status: "applied",
            },
            {
              pricingId: "BG002",
              serviceId: "DV001",
              serviceName: "Cấy ghép Implant",
              priceType: "Thường",
              standardPrice: 15000000,
              validFrom: new Date("2026-01-01"),
              validTo: new Date("2026-12-31"),
              status: "applied",
            },
            {
              pricingId: "BG003",
              serviceId: "DV002",
              serviceName: "Chỉnh nha mắc cài kim loại",
              priceType: "Khuyến mãi",
              standardPrice: 40000000,
              validFrom: new Date("2026-05-15"),
              validTo: new Date("2026-06-15"),
              status: "applied",
            },
            {
              pricingId: "BG004",
              serviceId: "DV003",
              serviceName: "Tẩy trắng răng Laser",
              priceType: "Thường",
              standardPrice: 2500000,
              validFrom: new Date("2026-01-01"),
              validTo: new Date("2026-12-31"),
              status: "applied",
            },
            {
              pricingId: "BG005",
              serviceId: "DV004",
              serviceName: "Nhổ răng khôn",
              priceType: "Thường",
              standardPrice: 1500000,
              validFrom: new Date("2026-01-01"),
              validTo: new Date("2026-12-31"),
              status: "applied",
            },
            {
              pricingId: "BG006",
              serviceId: "DV005",
              serviceName: "Bọc răng sứ Zirconia",
              priceType: "Thường",
              standardPrice: 4000000,
              validFrom: new Date("2026-01-01"),
              validTo: new Date("2026-12-31"),
              status: "applied",
            },
            {
              pricingId: "BG007",
              serviceId: "DV006",
              serviceName: "Khám tổng quát",
              priceType: "Thường",
              standardPrice: 300000,
              validFrom: new Date("2026-01-01"),
              validTo: new Date("2026-12-31"),
              status: "applied",
            },
            {
              pricingId: "BG008",
              serviceId: "DV007",
              serviceName: "Chụp phim X-quang",
              priceType: "Thường",
              standardPrice: 200000,
              validFrom: new Date("2026-01-01"),
              validTo: new Date("2026-12-31"),
              status: "applied",
            }
          ]
          await PricingModel.create(defaultPricing)
          console.log("Auto-seeded default pricing successfully.")
        }

        // Auto-seed default appointments if no appointments exist
        const AppointmentModel = (await import("@/models/Appointment")).default

        // Auto-detect old string-based patientId schema or missing references and reset collection
        const sampleApt = await AppointmentModel.findOne({})
        const needsReset = sampleApt && (
          !sampleApt.patientId ||
          !mongoose.Types.ObjectId.isValid(sampleApt.patientId.toString()) ||
          !sampleApt.doctorId ||
          !mongoose.Types.ObjectId.isValid(sampleApt.doctorId.toString()) ||
          (sampleApt as any).patient !== undefined ||
          sampleApt.items === undefined ||
          (sampleApt.items && sampleApt.items.length === 0)
        )

        if (needsReset) {
          console.log("Detected old/incomplete schema format in DB. Resetting appointments collection...")
          await AppointmentModel.deleteMany({})
        }

        const appointmentExists = await AppointmentModel.findOne({})
        if (!appointmentExists) {
          const { APPOINTMENTS, getAppointmentDetail } = await import("@/lib/appointments-data")

          const patients = await User.find({ role: "patient" })
          const doctors = await User.find({ role: "doctor" })
          const pricings = await PricingModel.find({})

          const matchDoc = (name: string) => {
            if (name.includes("Phạm Thành Nam")) return "nam.pham@serenity.vn"
            if (name.includes("Nguyễn Minh Thư")) return "thu.nguyen@serenity.vn"
            if (name.includes("Lê Hoàng Vũ")) return "vu.le@serenity.vn"
            if (name.includes("Trần Mai Anh")) return "maianh.tran@serenity.vn"
            if (name.includes("Đỗ Quang Khải")) return "khai.do@serenity.vn"
            
            if (name.toLowerCase().includes("julian pierce")) return "nam.pham@serenity.vn"
            if (name.toLowerCase().includes("emily thorne")) return "thu.nguyen@serenity.vn"
            if (name.toLowerCase().includes("phạm quốc dũng")) return "vu.le@serenity.vn"
            if (name.toLowerCase().includes("nguyễn thị lan")) return "maianh.tran@serenity.vn"
            return name
          }

          const defaultAppointments = []
          for (const apt of APPOINTMENTS) {
            const detail = getAppointmentDetail(apt.id)
            
            const docEmail = matchDoc(detail.doctor)
            let matchedDoc = doctors.find(d => d.email === docEmail || d.name.toLowerCase().includes(detail.doctor.toLowerCase()))
            if (!matchedDoc) matchedDoc = doctors[0]

            let matchedPat = patients.find(p => detail.patient.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(detail.patient.toLowerCase()))
            if (!matchedPat) matchedPat = patients[0]

            const matchedItemIds = []
            if (detail.items && detail.items.length > 0) {
              for (const item of detail.items) {
                // Try exact match on pricing serviceName
                let matchedPricing = pricings.find(pr => pr.serviceName.toLowerCase() === item.name.toLowerCase())
                
                // If not found, try substring match on item name
                if (!matchedPricing) {
                  matchedPricing = pricings.find(pr => 
                    item.name.toLowerCase().includes(pr.serviceName.toLowerCase()) ||
                    pr.serviceName.toLowerCase().includes(item.name.toLowerCase())
                  )
                }

                // If still not found, try matching by the appointment's base service name
                if (!matchedPricing && apt.service) {
                  matchedPricing = pricings.find(pr => 
                    apt.service.toLowerCase().includes(pr.serviceName.toLowerCase()) ||
                    pr.serviceName.toLowerCase().includes(apt.service.toLowerCase())
                  )
                }

                if (matchedPricing) {
                  matchedItemIds.push(matchedPricing._id)
                }
              }
            }

            // Fallback: match base service directly
            if (matchedItemIds.length === 0 && apt.service) {
              const matchedPricing = pricings.find(pr => 
                apt.service.toLowerCase().includes(pr.serviceName.toLowerCase()) ||
                pr.serviceName.toLowerCase().includes(apt.service.toLowerCase())
              )
              if (matchedPricing) {
                matchedItemIds.push(matchedPricing._id)
              }
            }

            defaultAppointments.push({
              appointmentId: apt.id,
              patientId: matchedPat._id,
              doctorId: matchedDoc._id,
              date: detail.date,
              start: detail.start,
              end: detail.end,
              status: detail.status,
              room: detail.room,
              note: detail.note,
              price: detail.price,
              discount: detail.discount,
              paid: detail.paid,
              items: matchedItemIds,
              symptoms: detail.symptoms,
              diagnosis: detail.diagnosis,
              prescription: detail.prescription,
              payments: detail.payments,
            })
          }
          await AppointmentModel.create(defaultAppointments)
          console.log("Auto-seeded default appointments successfully.")
        }
      } catch (err) {
        (global as any).adminSeeded = false
        console.error("Auto-seeding admin/doctors/services/appointments failed:", err)
      }
    }
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect
