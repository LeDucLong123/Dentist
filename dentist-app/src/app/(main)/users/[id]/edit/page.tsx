"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ChevronRight, User, Lock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { PasswordInput } from "@/components/password-input"
import { AvatarUpload } from "@/components/avatar-upload"
import { FormSection } from "@/components/form-section"
import { toast } from "sonner"
import { FormError } from "../../_components/form-error"
import { ROLES } from "../../_constants"

interface FormState {
  name: string
  phone: string
  email: string
  role: string
  specialty: string
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  confirmPassword?: string
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string

  const [form, setForm] = useState<FormState>({
    name: "BS. Julian Pierce",
    phone: "0123 456 789",
    email: "julian.p@clinicalserenity.com",
    role: "Bác sĩ",
    specialty: "tiến sĩ",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field as keyof FormErrors]) setErrors((p) => ({ ...p, [field]: undefined }))
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
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitting(false)
    toast.success("Cập nhật thông tin người dùng thành công!")
  }

  const inputClass = (field: keyof FormErrors) =>
    `bg-surface-container-low border-none rounded-lg py-3 px-4 h-auto focus:bg-surface focus:ring-2 transition-all ${
      errors[field] ? "ring-2 ring-error/50" : "focus:ring-primary/20"
    }`

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-8 py-4 flex justify-between items-center shadow-[0_10px_40px_rgba(25,28,29,0.05)]">
        <h2 className="font-headline font-bold text-xl tracking-tight text-blue-800">Chỉnh sửa người dùng</h2>
      </header>

      <section className="p-8 max-w-5xl mx-auto w-full">
        <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-6 opacity-60">
          <span>Hệ thống</span>
          <ChevronRight className="size-3" />
          <Link href="/users" className="hover:text-primary">Quản lý người dùng</Link>
          <ChevronRight className="size-3" />
          <span className="text-primary font-bold">Chỉnh sửa #{userId}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left sidebar profile */}
          <div className="lg:col-span-4">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_40px_rgba(25,28,29,0.05)] sticky top-24">
              <div className="flex flex-col items-center text-center">
                <AvatarUpload
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEHG091QDfw97DH4viyp-BfU79_JfMCRrbVMWTT0cAdeVaHBgGhJwWoBw_DJX52IRQGxoEZ1TK70hI7up4ZZIMW5K-WEFW11x0KDKaiDiv1Iv1L-DupGpPmZCQiadE4-JU5zEVs5XTR91417hK7kv_ZIaoNR7qj2YVJQeYdrus98jWUB8o1kOUfMFiOK1NscsHSg5sdjnLu9eyvdiyHnOLpomqa5lERlh-pmUehP4_mMUhGyla62VyxXNc-eXFKvFIdbptg9jswg"
                  initials="JP"
                  className="mb-4"
                />
                <h3 className="font-headline font-bold text-xl text-on-surface">{form.name}</h3>
                <p className="text-secondary font-medium text-sm mb-4">
                  {ROLES.find(r => r.value === form.role)?.label}
                  {form.role === "Bác sĩ" && form.specialty ? ` - ${form.specialty.charAt(0).toUpperCase() + form.specialty.slice(1)}` : ""}
                </p>
                <div className="flex gap-2 mb-6">
                  <StatusBadge status="active" />
                  <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold">
                    ID: DS-772
                  </span>
                </div>
                <div className="w-full space-y-3 pt-4 border-t border-surface-container opacity-80">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Lần cuối đăng nhập:</span>
                    <span className="font-semibold">Hôm nay, 08:30</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Ngày tham gia:</span>
                    <span className="font-semibold">12 Th04, 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="lg:col-span-8">
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_40px_rgba(25,28,29,0.05)]">
              <form onSubmit={handleSubmit} noValidate className="space-y-8">
                <FormSection icon={User} title="Thông tin cơ bản">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-secondary">
                        Họ tên <span className="text-error">*</span>
                      </Label>
                      <Input
                        className={inputClass("name")}
                        value={form.name}
                        onChange={set("name")}
                      />
                      <FormError msg={errors.name || ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-secondary">
                        Số điện thoại <span className="text-error">*</span>
                      </Label>
                      <Input
                        type="tel"
                        className={inputClass("phone")}
                        value={form.phone}
                        onChange={set("phone")}
                      />
                      <FormError msg={errors.phone || ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-secondary">
                        Email <span className="text-error">*</span>
                      </Label>
                      <Input
                        type="email"
                        className={inputClass("email")}
                        value={form.email}
                        onChange={set("email")}
                      />
                      <FormError msg={errors.email || ""} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-secondary">Vai trò</Label>
                      <Select value={form.role} onValueChange={(v) => v && setForm((p) => ({ ...p, role: v }))}>
                        <SelectTrigger className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 h-auto focus:ring-2 focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {form.role === "Bác sĩ" && (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-secondary">Trình độ chuyên môn</Label>
                        <Select value={form.specialty} onValueChange={(v) => v && setForm((p) => ({ ...p, specialty: v }))}>
                          <SelectTrigger className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 h-auto focus:ring-2 focus:ring-primary/20">
                            <SelectValue />
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
                </FormSection>

                <FormSection icon={Lock} title="Bảo mật tài khoản" className="pt-6 border-t border-surface-container">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-secondary">Mật khẩu mới</Label>
                      <PasswordInput
                        placeholder="Nhập mật khẩu mới"
                        value={form.newPassword}
                        onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-secondary">Xác nhận mật khẩu</Label>
                      <PasswordInput
                        placeholder="Xác nhận mật khẩu"
                        value={form.confirmPassword}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                          if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }))
                        }}
                        className={errors.confirmPassword ? "ring-2 ring-error/50 rounded-lg" : ""}
                      />
                      <FormError msg={errors.confirmPassword || ""} />
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant italic opacity-70 ml-1">
                    Để trống nếu bạn không muốn thay đổi mật khẩu hiện tại.
                  </p>
                </FormSection>

                <div className="flex items-center justify-end gap-4 pt-6 border-t border-surface-container">
                  <Link href="/users">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-6 py-2.5 rounded-lg font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-dim border-0"
                    >
                      Hủy
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-2.5 rounded-lg font-bold text-on-primary bg-primary shadow-md hover:shadow-lg transition-all disabled:opacity-70 gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
