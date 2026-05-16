"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, ArrowRight, Stethoscope, Check } from "lucide-react"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")

  const passwordStrength = (() => {
    if (!password) return { score: 0, label: "", color: "" }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    const map = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Yếu", color: "bg-red-400" },
      { score: 2, label: "Trung bình", color: "bg-amber-400" },
      { score: 3, label: "Khá", color: "bg-blue-400" },
      { score: 4, label: "Mạnh", color: "bg-emerald-500" },
    ]
    return map[score]
  })()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0059bb] via-[#0070ea] to-[#00b4d8] flex-col justify-between p-12 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 -left-24 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-12 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Stethoscope className="size-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Clinical Serenity</span>
          </div>
          <p className="text-white/60 text-sm ml-[52px]">Hệ thống quản lý nha khoa</p>
        </div>

        {/* Feature list */}
        <div className="relative z-10">
          <h2 className="text-white text-2xl font-bold mb-6 leading-snug">
            Tham gia cùng hàng trăm phòng khám tin tưởng chúng tôi
          </h2>
          <div className="space-y-4">
            {[
              "Quản lý lịch khám thông minh, không bỏ sót",
              "Hồ sơ bệnh nhân số hóa, bảo mật tuyệt đối",
              "Báo cáo doanh thu & thống kê tức thời",
              "Hỗ trợ đa bác sĩ, đa phòng khám",
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div className="size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3 text-white" />
                </div>
                <p className="text-white/80 text-sm">{f}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { value: "1,200+", label: "Bệnh nhân" },
            { value: "24", label: "Bác sĩ" },
            { value: "98%", label: "Hài lòng" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl px-4 py-4 text-center backdrop-blur-sm">
              <p className="text-white text-2xl font-extrabold">{s.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="size-4 text-primary" />
            </div>
            <span className="font-bold text-lg text-primary">Clinical Serenity</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Tạo tài khoản</h1>
          <p className="text-slate-500 text-sm mb-8">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
              Đăng nhập ngay
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Họ</label>
                <input
                  type="text"
                  placeholder="Lê"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tên</label>
                <input
                  type="text"
                  placeholder="Đức Long"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@clinicserenity.vn"
                className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Số điện thoại</label>
              <div className="flex">
                <div className="flex items-center gap-1.5 px-3 h-12 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm font-semibold text-slate-600 shrink-0">
                  <span>🇻🇳</span>
                  <span>+84</span>
                </div>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="0912 345 678"
                  className="flex-1 h-12 px-4 rounded-r-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= passwordStrength.score ? passwordStrength.color : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Độ mạnh: <span className="font-semibold">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                className="size-4 rounded border-slate-300 accent-primary cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer select-none leading-snug">
                Tôi đồng ý với{" "}
                <a href="#" className="text-primary font-semibold hover:underline">Điều khoản sử dụng</a>{" "}
                và{" "}
                <a href="#" className="text-primary font-semibold hover:underline">Chính sách bảo mật</a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <svg className="animate-spin size-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <>Tạo tài khoản <ArrowRight className="size-4" /></>
              )}
            </button>
          </form>

          {/* OAuth */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">hoặc đăng ký với</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Google",
                logo: (
                  <svg viewBox="0 0 24 24" className="size-4">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ),
              },
              {
                label: "Microsoft",
                logo: (
                  <svg viewBox="0 0 21 21" className="size-4">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                ),
              },
            ].map((p) => (
              <button key={p.label} type="button"
                className="h-11 flex items-center justify-center gap-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                {p.logo}
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
