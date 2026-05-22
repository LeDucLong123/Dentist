"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Save, CheckCircle2,
  Lock, LockKeyhole, UserRound, BadgeCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PasswordInput } from "@/components/password-input"
import { AvatarUpload } from "@/components/avatar-upload"
import { SecurityCard } from "@/components/security-card"
import { cn } from "@/lib/utils"
import { FormError } from "../_components/form-error"
import { ROLES, Role } from "../_constants"

interface FormState {
  name: string
  email: string
  phone: string
  role: Role
  specialty: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
}


export default function AddUserPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    role: "Bệnh nhân",
    specialty: "cử nhân",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!form.name.trim()) newErrors.name = "Họ và tên là bắt buộc."
    if (!form.email.trim()) {
      newErrors.email = "Email là bắt buộc."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không hợp lệ."
    }
    if (!form.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc."
    if (!form.password) {
      newErrors.password = "Mật khẩu là bắt buộc."
    } else if (form.password.length < 6) {
      newErrors.password = "Mật khẩu phải ít nhất 6 ký tự."
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu."
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp."
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitting(false)
    setSuccess(true)
    setTimeout(() => router.push("/users"), 1500)
  }

  const inputClass = (field: keyof FormErrors) =>
    cn(
      "bg-surface-container-low border-none rounded-xl py-3 px-4 h-auto focus:bg-surface focus:ring-2 transition-all placeholder:text-outline-variant text-sm",
      errors[field] ? "ring-2 ring-error/50 bg-error-container/10" : "focus:ring-primary/20"
    )

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/60 to-teal-50/40">
        <div className="text-center animate-in zoom-in duration-300 bg-white rounded-3xl p-12 shadow-2xl shadow-blue-100 max-w-xs mx-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mb-5 shadow-lg shadow-green-200">
            <CheckCircle2 className="size-10 text-white" />
          </div>
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Tạo thành công!</h3>
          <p className="text-sm text-on-surface-variant">Đang chuyển về danh sách người dùng...</p>
        </div>
      </div>
    )
  }

  const selectedRole = ROLES.find((r) => r.value === form.role)!

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <Link
            href="/users"
            className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="p-1.5 rounded-lg bg-surface-container-low group-hover:bg-primary/10 transition-colors">
              <ArrowLeft className="size-4" />
            </span>
          </Link>
          <div className="w-px h-5 bg-outline-variant/40" />
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Quản lý người dùng</p>
            <h1 className="text-sm font-headline font-bold text-blue-900 leading-tight">Thêm người dùng mới</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/users">
            <Button variant="outline" className="text-sm font-semibold text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-low rounded-xl px-5">
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            form="add-user-form"
            disabled={submitting}
            className="bg-primary text-on-primary rounded-xl px-6 py-2.5 font-bold shadow-md shadow-blue-200 hover:opacity-90 transition-all gap-2 disabled:opacity-60 text-sm"
          >
            {submitting ? (
              <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</>
            ) : (
              <><Save className="size-4" /> Lưu thông tin</>
            )}
          </Button>
        </div>
      </header>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <form id="add-user-form" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-12 gap-6">

            {/* ─── MAIN COLUMN ─── */}
            <div className="col-span-12 lg:col-span-8 space-y-5">

              {/* ROLE PICKER */}
              <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden">
                <div className="px-6 pt-5 pb-4 border-b border-surface-container">
                  <h2 className="font-headline font-bold text-base text-blue-900 flex items-center gap-2">
                    <span className="p-1.5 bg-primary/10 rounded-lg"><BadgeCheck className="size-4 text-primary" /></span>
                    Loại tài khoản
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1 ml-9">Chọn vai trò phù hợp với người dùng</p>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ROLES.map((r) => {
                    const Icon = r.icon
                    const active = form.role === r.value
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                        className={cn(
                          "relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 text-left w-full cursor-pointer",
                          active
                            ? `${r.activeBg} ${r.border} shadow-sm`
                            : "border-outline-variant/20 bg-surface-container-low/40 hover:border-outline-variant/50 hover:bg-surface-container-low"
                        )}
                      >
                        {active && (
                          <span className={cn("absolute top-2.5 right-2.5 w-2 h-2 rounded-full", r.accent.replace("text-", "bg-"))} />
                        )}
                        <span className={cn("p-2.5 rounded-xl", active ? r.iconBg : "bg-surface-container")}>
                          <Icon className={cn("size-5", active ? r.accent : "text-on-surface-variant")} />
                        </span>
                        <div className="text-center">
                          <p className={cn("text-sm font-bold", active ? r.accent : "text-on-surface")}>{r.label}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">{r.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* BASIC INFO */}
              <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden">
                <div className="px-6 pt-5 pb-4 border-b border-surface-container">
                  <h2 className="font-headline font-bold text-base text-blue-900 flex items-center gap-2">
                    <span className="p-1.5 bg-secondary/10 rounded-lg"><UserRound className="size-4 text-secondary" /></span>
                    Thông tin cá nhân
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1 ml-9">Họ tên, email và số liên lạc</p>
                </div>
                <div className="p-6 space-y-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
                      Họ và tên <span className="text-error normal-case">*</span>
                    </Label>
                    <Input
                      className={inputClass("name")}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={form.name}
                      onChange={set("name")}
                    />
                    <FormError msg={errors.name || ""} />
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
                        Email <span className="text-error normal-case">*</span>
                      </Label>
                      <Input
                        type="email"
                        className={inputClass("email")}
                        placeholder="example@clinic.vn"
                        value={form.email}
                        onChange={set("email")}
                      />
                      <FormError msg={errors.email || ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
                        Số điện thoại <span className="text-error normal-case">*</span>
                      </Label>
                      <Input
                        type="tel"
                        className={inputClass("phone")}
                        placeholder="09xx xxx xxx"
                        value={form.phone}
                        onChange={set("phone")}
                      />
                      <FormError msg={errors.phone || ""} />
                    </div>
                  </div>

                  {form.role === "Bác sĩ" && (
                    <div className="space-y-1.5 pt-2">
                      <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Trình độ chuyên môn</Label>
                      <Select value={form.specialty} onValueChange={(v) => v && setForm((p) => ({ ...p, specialty: v }))}>
                        <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 h-auto focus:ring-2 focus:ring-primary/20 text-sm">
                          <SelectValue placeholder="Chọn trình độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cử nhân">Cử nhân / Đại học</SelectItem>
                          <SelectItem value="thạc sĩ">Thạc sĩ</SelectItem>
                          <SelectItem value="tiến sĩ">Tiến sĩ</SelectItem>
                          <SelectItem value="phó giáo sư">Phó giáo sư</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* PASSWORD */}
              <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden">
                <div className="px-6 pt-5 pb-4 border-b border-surface-container">
                  <h2 className="font-headline font-bold text-base text-blue-900 flex items-center gap-2">
                    <span className="p-1.5 bg-amber-100 rounded-lg"><Lock className="size-4 text-amber-600" /></span>
                    Bảo mật tài khoản
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1 ml-9">Đặt mật khẩu đăng nhập lần đầu</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide flex items-center gap-1">
                        <Lock className="size-3" /> Mật khẩu <span className="text-error normal-case">*</span>
                      </Label>
                      <PasswordInput
                        placeholder="Tối thiểu 6 ký tự"
                        value={form.password}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, password: e.target.value }))
                          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                        }}
                        inputClassName={cn(
                          "border-none rounded-xl text-sm",
                          errors.password ? "ring-2 ring-error/50 bg-error-container/10" : "bg-surface-container-low focus:ring-2 focus:ring-primary/20 focus:bg-surface"
                        )}
                      />
                      <FormError msg={errors.password || ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide flex items-center gap-1">
                        <LockKeyhole className="size-3" /> Xác nhận <span className="text-error normal-case">*</span>
                      </Label>
                      <PasswordInput
                        placeholder="Nhập lại mật khẩu"
                        value={form.confirmPassword}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                        }}
                        inputClassName={cn(
                          "border-none rounded-xl text-sm",
                          errors.confirmPassword ? "ring-2 ring-error/50 bg-error-container/10" : "bg-surface-container-low focus:ring-2 focus:ring-primary/20 focus:bg-surface"
                        )}
                      />
                      <FormError msg={errors.confirmPassword || ""} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ─── SIDEBAR ─── */}
            <div className="col-span-12 lg:col-span-4 space-y-5">

              {/* Avatar */}
              <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/15 p-6 text-center">
                <AvatarUpload size="default" className="mb-4 mx-auto" />
                <h4 className="font-headline font-bold text-sm text-blue-800">Ảnh đại diện</h4>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  Định dạng JPG, PNG hoặc GIF.<br />Dung lượng không quá 5MB.
                </p>
              </div>

              {/* Role info banner */}
              <div className={cn(
                "rounded-2xl p-5 border",
                selectedRole.activeBg,
                selectedRole.border.replace("border-", "border-") + "/40"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={cn("p-2 rounded-xl", selectedRole.iconBg)}>
                    <selectedRole.icon className={cn("size-4", selectedRole.accent)} />
                  </span>
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Vai trò đã chọn</p>
                    <p className={cn("font-headline font-bold text-sm", selectedRole.accent)}>{selectedRole.label}</p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{selectedRole.desc}</p>
              </div>

              {/* Security card */}
              <SecurityCard
                items={[
                  { text: "Tài khoản yêu cầu đổi mật khẩu sau lần đăng nhập đầu tiên." },
                  { text: "Quyền hạn được giới hạn theo vai trò công việc." },
                ]}
              />

              {/* Action buttons */}
              <div className="flex flex-col gap-3 pt-1">
                <Button
                  type="submit"
                  form="add-user-form"
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary py-6 rounded-xl font-headline font-bold shadow-lg shadow-blue-200 hover:opacity-90 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-60"
                >
                  {submitting ? (
                    <><div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</>
                  ) : (
                    <><Save className="size-5" /> Lưu thông tin</>
                  )}
                </Button>
                <Link href="/users" className="w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-6 rounded-xl font-headline font-bold border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors text-sm"
                  >
                    Hủy bỏ
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </form>
      </div>
    </>
  )
}
