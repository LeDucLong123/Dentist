"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, School, Link2, Stethoscope, CheckCircle2, Activity, Users, Star, Lock, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Topbar } from "@/components/topbar"
import { AvatarUpload } from "@/components/avatar-upload"
import { FormSection } from "@/components/form-section"
import { cn } from "@/lib/utils"
import { DoctorBreadcrumb } from "../../_components/doctor-breadcrumb"

// Mock data – simulating fetched doctor for id
const MOCK_DOCTOR = {
  id: "1",
  name: "BS. Phạm Thành Nam",
  phone: "0901 234 567",
  email: "nam.pham@serenity.vn",
  role: "Trưởng khoa",
  degree: "Tiến sĩ",
  specialty: "Cấy ghép Implant",
  linkedUserId: "user_linked",
  linkedUserName: "Phạm Thành Nam",
  linkedUserEmail: "nam.pham@serenity.vn",
  stats: { surgeries: 24, patients: 12, rating: 4.9 },
}

const MOCK_USERS = [
  { value: "user_1", name: "Nguyễn Văn A", phone: "0901 111 222", email: "nguyen.van.a@serenity.vn" },
  { value: "user_2", name: "Trần Thị Bích", phone: "0932 333 444", email: "tran.thi.bich@serenity.vn" },
  { value: "user_3", name: "Lê Văn Cường", phone: "0977 555 666", email: "le.van.cuong@serenity.vn" },
  { value: "user_4", name: "Phạm Minh Đức", phone: "0988 777 888", email: "pham.minh.duc@serenity.vn" },
  // Pre-linked user
  { value: "user_linked", name: MOCK_DOCTOR.linkedUserName, phone: MOCK_DOCTOR.phone, email: MOCK_DOCTOR.linkedUserEmail },
]

type MockUser = typeof MOCK_USERS[number]

export default function EditDoctorPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  // Linked user is fixed after creation — cannot be changed
  const linkedUser = MOCK_USERS.find((u) => u.value === MOCK_DOCTOR.linkedUserId) ?? null

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      toast.success("Cập nhật thành công!", {
        description: `Thông tin của ${linkedUser?.name ?? "bác sĩ"} đã được lưu.`,
      })
      router.push("/doctors")
    }, 600)
  }

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm bác sĩ..." />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <DoctorBreadcrumb items={[{ label: "Chỉnh sửa" }]} />
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Stethoscope className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Chỉnh sửa hồ sơ bác sĩ</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Cập nhật thông tin chuyên môn và tài khoản liên kết.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6 flex flex-col items-center text-center gap-3">
              <AvatarUpload
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaEJO3iKuJ7JnTkIuTLS_KwpMjJR9h9JMsrffZhPRvn3TCc2uV2IF8v4YhGVA8Q4F3sSMNpBUI5R-MQRDhzjCHN_KZM0taeXYtFVa-P7B6SER39KefixVwoknJI4fiAp19DWdlUdjiRpKkR3TaybFxI4SjJ9Z-Hb9U_5SBNhscQRiANZrZ_MlXkTyf82Xsd8Dmb7Nzp5DOyG3ScooKuWSerTJQOnrlqu6S67VZLziuqymxzHMRyTbYzvhI9kC3lh02ztT19kO_jg"
                initials="PN"
              />
              <div>
                <h4 className="font-bold text-blue-900 text-sm">{MOCK_DOCTOR.name}</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Ảnh chân dung · Nhấn để đổi</p>
              </div>
            </div>

            {/* Mini stats */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-4">
              <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-wider mb-3">Thống kê</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Activity, label: "Ca phẫu thuật", value: MOCK_DOCTOR.stats.surgeries, color: "text-blue-600" },
                  { icon: Users,    label: "Bệnh nhân mới", value: MOCK_DOCTOR.stats.patients,  color: "text-emerald-600" },
                  { icon: Star,     label: "Đánh giá",      value: MOCK_DOCTOR.stats.rating,    color: "text-amber-500" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low/60">
                    <Icon className={`size-4 mb-1 ${color}`} />
                    <span className={`text-base font-bold ${color}`}>{value}</span>
                    <span className="text-[10px] text-on-surface-variant leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Lưu ý</p>
              <ul className="space-y-1.5">
                {[
                  "Thông tin cá nhân được đồng bộ từ tài khoản liên kết.",
                  "Thay đổi tài khoản liên kết sẽ cập nhật thông tin cá nhân theo.",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-1.5 text-xs text-blue-700/80">
                    <CheckCircle2 className="size-3.5 text-blue-400 mt-0.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right – form */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* 1. Linked account – read-only */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <FormSection icon={Link2} title="Tài khoản liên kết">
                <div className="flex items-center gap-3 bg-surface-container-low/60 rounded-xl px-4 py-3">
                  <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Lock className="size-4 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{linkedUser?.name ?? "Chưa liên kết"}</p>
                    <p className="text-xs text-on-surface-variant truncate">{linkedUser?.email ?? ""}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant/20 shrink-0">
                    <Lock className="size-2.5" />
                    Đã khóa
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant/60 mt-2">
                  Tài khoản liên kết chỉ được thiết lập một lần khi tạo hồ sơ và không thể thay đổi.
                </p>
              </FormSection>
            </div>

            {/* 2. Personal info – read-only when linked */}
            <div className={cn(
              "bg-white rounded-2xl border shadow-sm p-6 transition-all",
              linkedUser ? "border-primary/20" : "border-outline-variant/10"
            )}>
              <FormSection icon={User} title="Thông tin cá nhân">
                {!linkedUser && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
                    <UserCheck className="size-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">
                      Liên kết tài khoản để đồng bộ thông tin cá nhân.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Họ và tên</Label>
                    <Input
                      value={linkedUser?.name ?? ""}
                      readOnly={!!linkedUser}
                      placeholder="Tự động điền khi liên kết"
                      className={cn(
                        "rounded-xl h-10 border-none",
                        linkedUser ? "bg-surface-container-low/50 font-medium cursor-not-allowed opacity-80" : "bg-surface-container-low italic placeholder:text-outline-variant/50"
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Số điện thoại</Label>
                    <Input
                      value={linkedUser?.phone ?? ""}
                      readOnly={!!linkedUser}
                      placeholder="Tự động điền khi liên kết"
                      className={cn(
                        "rounded-xl h-10 border-none",
                        linkedUser ? "bg-surface-container-low/50 font-medium cursor-not-allowed opacity-80" : "bg-surface-container-low italic placeholder:text-outline-variant/50"
                      )}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Email liên lạc</Label>
                    <Input
                      value={linkedUser?.email ?? ""}
                      readOnly={!!linkedUser}
                      placeholder="Tự động điền khi liên kết"
                      className={cn(
                        "rounded-xl h-10 border-none",
                        linkedUser ? "bg-surface-container-low/50 font-medium cursor-not-allowed opacity-80" : "bg-surface-container-low italic placeholder:text-outline-variant/50"
                      )}
                    />
                  </div>
                </div>
                {linkedUser && (
                  <p className="text-xs text-primary/70 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-primary/50" />
                    Thông tin đồng bộ từ tài khoản liên kết, không thể chỉnh sửa tại đây.
                  </p>
                )}
              </FormSection>
            </div>

            {/* 3. Degree & specialty */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <FormSection icon={School} title="Trình độ & Chuyên môn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Chức vụ / Vai trò <span className="text-red-500">*</span></Label>
                    <Select defaultValue={MOCK_DOCTOR.role}>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Trưởng khoa">Trưởng khoa</SelectItem>
                        <SelectItem value="BS. Chính">BS. Chính</SelectItem>
                        <SelectItem value="BS. Phụ">BS. Phụ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Học vị <span className="text-red-500">*</span></Label>
                    <Select defaultValue={MOCK_DOCTOR.degree}>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tốt nghiệp đại học">Tốt nghiệp đại học</SelectItem>
                        <SelectItem value="BSCK I">BSCK I</SelectItem>
                        <SelectItem value="BSCK II">BSCK II</SelectItem>
                        <SelectItem value="Thạc sĩ">Thạc sĩ</SelectItem>
                        <SelectItem value="Tiến sĩ">Tiến sĩ</SelectItem>
                        <SelectItem value="Phó giáo sư">Phó giáo sư</SelectItem>
                        <SelectItem value="Giáo sư">Giáo sư</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Chuyên khoa <span className="text-red-500">*</span></Label>
                    <Select defaultValue={MOCK_DOCTOR.specialty}>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cấy ghép Implant">Cấy ghép Implant</SelectItem>
                        <SelectItem value="Chỉnh nha (Niềng răng)">Chỉnh nha (Niềng răng)</SelectItem>
                        <SelectItem value="Nha khoa Tổng quát">Nha khoa Tổng quát</SelectItem>
                        <SelectItem value="Nha khoa Thẩm mỹ">Nha khoa Thẩm mỹ</SelectItem>
                        <SelectItem value="Nha khoa Trẻ em">Nha khoa Trẻ em</SelectItem>
                        <SelectItem value="Phẫu thuật hàm mặt">Phẫu thuật hàm mặt</SelectItem>
                        <SelectItem value="Nội nha">Nội nha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Link href="/doctors">
                <Button variant="outline" disabled={isSaving} className="px-6 rounded-xl font-semibold border-outline-variant/30 text-on-surface-variant">
                  Hủy thay đổi
                </Button>
              </Link>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 rounded-xl font-semibold bg-primary text-on-primary shadow-md shadow-primary/25 hover:brightness-105 transition-all gap-2 disabled:opacity-70"
              >
                {isSaving ? (
                  <><span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang lưu...</>
                ) : (
                  <><Stethoscope className="size-4" /> Lưu thay đổi</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
