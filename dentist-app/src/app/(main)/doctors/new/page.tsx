"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, School, Link2, Search, Stethoscope, CheckCircle2, X, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Topbar } from "@/components/topbar"
import { AvatarUpload } from "@/components/avatar-upload"
import { FormSection } from "@/components/form-section"
import { cn } from "@/lib/utils"
import { DoctorBreadcrumb } from "../_components/doctor-breadcrumb"

const MOCK_USERS = [
  { value: "user_1", name: "Nguyễn Văn A", phone: "0901 111 222", email: "nguyen.van.a@serenity.vn" },
  { value: "user_2", name: "Trần Thị Bích", phone: "0932 333 444", email: "tran.thi.bich@serenity.vn" },
  { value: "user_3", name: "Lê Văn Cường", phone: "0977 555 666", email: "le.van.cuong@serenity.vn" },
  { value: "user_4", name: "Phạm Minh Đức", phone: "0988 777 888", email: "pham.minh.duc@serenity.vn" },
]

type MockUser = typeof MOCK_USERS[number]

export default function AddDoctorPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [linkedUser, setLinkedUser] = useState<MockUser | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    // Simulate async save
    setTimeout(() => {
      toast.success("Thêm bác sĩ thành công!", {
        description: linkedUser ? `Hồ sơ của ${linkedUser.name} đã được tạo.` : "Hồ sơ bác sĩ đã được lưu.",
      })
      router.push("/doctors")
    }, 600)
  }

  const filteredUsers = MOCK_USERS.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectUser = (user: MockUser) => {
    setLinkedUser(user)
    setSearchQuery("")
    setDropdownOpen(false)
  }

  const handleClearUser = () => {
    setLinkedUser(null)
    setSearchQuery("")
  }

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm bác sĩ..." />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <DoctorBreadcrumb items={[{ label: "Thêm mới" }]} />
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Stethoscope className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Thêm bác sĩ mới</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Liên kết tài khoản người dùng và nhập thông tin chuyên môn.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6 flex flex-col items-center text-center gap-3">
              <AvatarUpload size="default" />
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Ảnh chân dung</h4>
                <p className="text-xs text-on-surface-variant mt-1">JPG, PNG · Tối đa 2MB</p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Lưu ý</p>
              <ul className="space-y-1.5">
                {[
                  "Liên kết tài khoản trước để thông tin cá nhân tự động điền.",
                  "Hồ sơ cần xác minh chứng chỉ hành nghề trước khi kê đơn điện tử.",
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

            {/* 1. Link account – FIRST */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <FormSection icon={Link2} title="Liên kết tài khoản">
                {linkedUser ? (
                  /* Selected state */
                  <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UserCheck className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">{linkedUser.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{linkedUser.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearUser}
                      className="size-7 rounded-full hover:bg-red-50 hover:text-red-500 text-on-surface-variant/50 flex items-center justify-center transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Search state */
                  <div className="relative">
                    <div className={cn(
                      "flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-2.5 transition-all",
                      dropdownOpen && "ring-2 ring-primary/20"
                    )}>
                      <Search className="size-4 text-outline shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setDropdownOpen(true)
                        }}
                        onFocus={() => setDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                        placeholder="Tìm kiếm tài khoản để liên kết..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-outline-variant"
                      />
                      {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery("")} className="text-outline-variant hover:text-on-surface">
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>

                    {dropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-outline-variant/15 z-20 overflow-hidden">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((u) => (
                            <button
                              key={u.value}
                              type="button"
                              onMouseDown={() => handleSelectUser(u)}
                              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 last:border-0"
                            >
                              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                                {u.name.split(" ").slice(-1)[0][0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-on-surface truncate">{u.name}</p>
                                <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-sm text-on-surface-variant text-center">
                            Không tìm thấy tài khoản phù hợp.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-on-surface-variant/60 mt-2">
                  Liên kết tài khoản để bác sĩ đăng nhập và quản lý lịch khám trên hệ thống.
                </p>
              </FormSection>
            </div>

            {/* 2. Personal info – auto-filled & read-only when linked */}
            <div className={cn(
              "bg-white rounded-2xl border shadow-sm p-6 transition-all",
              linkedUser ? "border-primary/20" : "border-outline-variant/10"
            )}>
              <FormSection icon={User} title="Thông tin cá nhân">
                {!linkedUser && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
                    <UserCheck className="size-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">
                      Liên kết tài khoản để tự động điền thông tin cá nhân.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={linkedUser?.name ?? ""}
                      readOnly={!!linkedUser}
                      placeholder={linkedUser ? "" : "Tự động điền khi liên kết"}
                      className={cn(
                        "rounded-xl h-10 border-none",
                        linkedUser
                          ? "bg-surface-container-low/50 text-on-surface font-medium cursor-not-allowed opacity-80"
                          : "bg-surface-container-low placeholder:text-outline-variant/50 italic"
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Số điện thoại</Label>
                    <Input
                      value={linkedUser?.phone ?? ""}
                      readOnly={!!linkedUser}
                      placeholder={linkedUser ? "" : "Tự động điền khi liên kết"}
                      className={cn(
                        "rounded-xl h-10 border-none",
                        linkedUser
                          ? "bg-surface-container-low/50 text-on-surface font-medium cursor-not-allowed opacity-80"
                          : "bg-surface-container-low placeholder:text-outline-variant/50 italic"
                      )}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                      Email liên lạc <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={linkedUser?.email ?? ""}
                      readOnly={!!linkedUser}
                      placeholder={linkedUser ? "" : "Tự động điền khi liên kết"}
                      className={cn(
                        "rounded-xl h-10 border-none",
                        linkedUser
                          ? "bg-surface-container-low/50 text-on-surface font-medium cursor-not-allowed opacity-80"
                          : "bg-surface-container-low placeholder:text-outline-variant/50 italic"
                      )}
                    />
                  </div>
                </div>

                {linkedUser && (
                  <p className="text-xs text-primary/70 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-primary/50" />
                    Thông tin được lấy từ tài khoản liên kết, không thể chỉnh sửa tại đây.
                  </p>
                )}
              </FormSection>
            </div>

            {/* 3. Degree & specialty */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <FormSection icon={School} title="Trình độ & Chuyên môn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                      Chức vụ / Vai trò <span className="text-red-500">*</span>
                    </Label>
                    <Select>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue placeholder="Chọn chức vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Trưởng khoa">Trưởng khoa</SelectItem>
                        <SelectItem value="BS. Chính">BS. Chính</SelectItem>
                        <SelectItem value="BS. Phụ">BS. Phụ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                      Học vị <span className="text-red-500">*</span>
                    </Label>
                    <Select>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue placeholder="Chọn học vị" />
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
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                      Chuyên khoa <span className="text-red-500">*</span>
                    </Label>
                    <Select>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue placeholder="Chọn chuyên khoa" />
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
                <Button variant="outline" className="px-6 rounded-xl font-semibold border-outline-variant/30 text-on-surface-variant" disabled={isSaving}>
                  Hủy bỏ
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
                  <><Stethoscope className="size-4" /> Lưu thông tin bác sĩ</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
