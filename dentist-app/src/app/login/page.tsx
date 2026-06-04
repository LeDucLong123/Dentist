"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, Stethoscope } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại.")
      }

      // Store token in cookie (so server-side layout can check it)
      document.cookie = `token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`
      
      // Also store in localStorage if frontend code needs it
      localStorage.setItem("token", data.accessToken)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/dashboard")
      router.refresh() // Refresh layout to trigger server-side auth validation
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0059bb] via-[#0070ea] to-[#00b4d8] flex-col justify-between p-12 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 -left-24 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-12 w-40 h-40 bg-white/5 rounded-full" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Stethoscope className="size-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Clinical Serenity</span>
          </div>
          <p className="text-white/60 text-sm ml-[52px]">Hệ thống quản lý nha khoa</p>
        </div>

        {/* Center quote */}
        <div className="relative z-10">
          <blockquote className="text-white text-2xl font-bold leading-relaxed mb-4">
            "Chăm sóc nụ cười của bạn là sứ mệnh của chúng tôi."
          </blockquote>
          <p className="text-white/60 text-sm">— Clinical Serenity Team</p>
        </div>

        {/* Stats row */}
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
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="size-4 text-primary" />
            </div>
            <span className="font-bold text-lg text-primary">Clinical Serenity</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Đăng nhập</h1>
          <p className="text-slate-500 text-sm mb-8">
            Chào mừng trở lại!{" "}
            <Link href="/signup" className="text-primary font-semibold hover:text-primary/80 transition-colors">
              Chưa có tài khoản?
            </Link>
          </p>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@clinicserenity.vn"
                className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mật khẩu</label>
                <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                className="size-4 rounded border-slate-300 text-primary accent-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
                Ghi nhớ đăng nhập
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
                <>Đăng nhập <ArrowRight className="size-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">hoặc tiếp tục với</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* OAuth buttons */}
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
              <button
                key={p.label}
                type="button"
                className="h-11 flex items-center justify-center gap-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                {p.logo}
                {p.label}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <a href="#" className="underline hover:text-slate-600">Điều khoản sử dụng</a>{" "}
            và{" "}
            <a href="#" className="underline hover:text-slate-600">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  )
}
