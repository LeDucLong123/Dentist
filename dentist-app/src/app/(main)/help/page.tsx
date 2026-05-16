"use client"

import { useState } from "react"
import { Topbar } from "@/components/topbar"
import { Search, Mail, Phone, MessageCircle, FileText, ChevronDown, ChevronUp, ExternalLink, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    category: "Lịch khám",
    items: [
      { q: "Làm thế nào để đổi lịch khám cho bệnh nhân?", a: "Bạn có thể vào mục Lịch khám, chọn bệnh nhân cần đổi lịch, sau đó bấm vào nút 'Đổi lịch' và chọn thời gian mới. Hệ thống sẽ tự động gửi thông báo cho bác sĩ và bệnh nhân." },
      { q: "Cách xử lý khi bệnh nhân không đến (No-show)?", a: "Vào chi tiết lịch khám của bệnh nhân đó, chọn trạng thái 'Đã hủy' và ghi chú lý do là 'Bệnh nhân không đến'. Lịch này sẽ không được tính vào doanh thu dự kiến." },
      { q: "Tôi có thể xem lịch trình của tất cả bác sĩ trong tuần không?", a: "Có, ở màn hình Lịch khám, bạn có thể chuyển chế độ xem từ 'Danh sách' sang 'Lịch (Calendar)' để xem tổng quan lịch của tất cả bác sĩ." },
    ]
  },
  {
    category: "Bảng giá & Dịch vụ",
    items: [
      { q: "Bảng giá đã 'Đóng băng' có thể sửa được không?", a: "Không. Bảng giá sau khi đã lưu sẽ bị đóng băng để đảm bảo tính minh bạch của dữ liệu lịch sử. Nếu muốn thay đổi giá, bạn cần tạo bảng giá mới và ngừng áp dụng bảng giá cũ." },
      { q: "Làm sao để thêm dịch vụ mới?", a: "Vào mục Dịch vụ, chọn 'Thêm dịch vụ mới'. Điền đầy đủ thông tin tên, mã dịch vụ, nhóm và mô tả sau đó lưu lại." },
    ]
  },
  {
    category: "Tài khoản & Phân quyền",
    items: [
      { q: "Quên mật khẩu đăng nhập phải làm sao?", a: "Ở màn hình Đăng nhập, bấm vào 'Quên mật khẩu'. Nhập email đăng ký của bạn để hệ thống gửi liên kết đặt lại mật khẩu." },
      { q: "Lễ tân có thể xem được báo cáo doanh thu không?", a: "Mặc định tài khoản Lễ tân không có quyền truy cập vào Thống kê doanh thu. Chỉ có Quản trị viên (Admin) và Kế toán mới xem được." },
    ]
  }
]

function FaqItem({ q, a }: { q: string, a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white transition-all hover:border-primary/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
      >
        <span className="font-semibold text-slate-800 pr-4">{q}</span>
        {open ? <ChevronUp className="size-5 text-slate-400 shrink-0" /> : <ChevronDown className="size-5 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-50">
          <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [search, setSearch] = useState("")

  return (
    <>
      <Topbar title="Trung tâm hỗ trợ" variant="simple" />
      <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-10">

        {/* Header Section */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Xin chào, chúng tôi có thể giúp gì cho bạn?</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm câu hỏi, hướng dẫn, từ khóa..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all text-base"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="size-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="size-6" />
            </div>
            <h3 className="font-bold text-slate-900">Tài liệu hướng dẫn</h3>
            <p className="text-xs text-slate-500 text-center mt-1">Đọc hướng dẫn sử dụng chi tiết từng chức năng.</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:primary/30 transition-all group">
            <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlayCircle className="size-6" />
            </div>
            <h3 className="font-bold text-slate-900">Video Tutorials</h3>
            <p className="text-xs text-slate-500 text-center mt-1">Xem video hướng dẫn thao tác trực quan.</p>
          </button>

          <button className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="size-6" />
            </div>
            <h3 className="font-bold text-slate-900">Cộng đồng</h3>
            <p className="text-xs text-slate-500 text-center mt-1">Tham gia nhóm hỗ trợ người dùng trên Zalo.</p>
          </button>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">Câu hỏi thường gặp (FAQ)</h2>
          
          <div className="space-y-8">
            {FAQS.map((category, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.items.map((item, i) => (
                    <FaqItem key={i} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between shadow-xl">
          <div className="max-w-xl text-white">
            <h2 className="text-2xl font-bold mb-2">Vẫn cần thêm sự trợ giúp?</h2>
            <p className="text-slate-300 text-sm mb-6 sm:mb-0">
              Đội ngũ hỗ trợ kỹ thuật của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn từ 08:00 đến 18:00 (Thứ 2 - Thứ 7).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button className="flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
              <Phone className="size-4" />
              1900 1234
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
              <Mail className="size-4" />
              Gửi email hỗ trợ
            </button>
          </div>
        </div>

      </div>
    </>
  )
}
