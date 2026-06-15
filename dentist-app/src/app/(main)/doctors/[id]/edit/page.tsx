"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, School, Link2, Stethoscope, CheckCircle2, Activity, Users, Star, Lock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Topbar } from "@/components/topbar"
import { FormSection } from "@/components/form-section"
import { cn } from "@/lib/utils"
import { DoctorBreadcrumb } from "../../_components/doctor-breadcrumb"

const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
]

function getInitials(name: string) {
  const parts = name.replace(/^(BS\.|ThS\.BS\.|ThS\.|TS\.|GS\.|GS\.TS\.)?\s*/i, "").trim().split(" ")
  return parts.slice(-2).map((p) => p[0]).join("").toUpperCase()
}

export default function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [doctor, setDoctor] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const [degree, setDegree] = useState("")
  const [specialty, setSpecialty] = useState("")

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const parsed = JSON.parse(userStr)
        if (parsed.role === "doctor" || parsed.role === "receptionist") {
          window.location.replace("/appointments")
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/doctors/${id}`)
        if (!res.ok) throw new Error("Không thể tải thông tin bác sĩ.")
        const data = await res.json()
        setDoctor(data)
        setDegree(data.degree)
        setSpecialty(data.specialty)
      } catch (err: any) {
        toast.error(err.message || "Đã xảy ra lỗi.")
      } finally {
        setLoading(false)
      }
    }
    fetchDoctor()
  }, [id])

  const handleSave = async () => {
    if (!degree || !specialty) {
      toast.error("Vui lòng nhập đầy đủ trình độ và chuyên môn.")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          degree,
          specialty,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Cập nhật hồ sơ bác sĩ thất bại.")
      }

      toast.success("Cập nhật thành công!", {
        description: `Thông tin của ${doctor?.name || "bác sĩ"} đã được lưu.`,
      })
      router.push("/doctors")
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Topbar searchPlaceholder="Tìm kiếm bác sĩ..." />
        <div className="p-8 text-center text-on-surface-variant flex flex-col items-center justify-center min-h-[300px]">
          <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
          <p className="font-medium text-on-surface-variant">Đang tải thông tin bác sĩ...</p>
        </div>
      </>
    )
  }

  if (!doctor) {
    return (
      <>
        <Topbar searchPlaceholder="Tìm kiếm bác sĩ..." />
        <div className="p-8 text-center text-on-surface-variant">
          Không tìm thấy bác sĩ #{id}
        </div>
      </>
    )
  }

  const numericId = parseInt(doctor.id.slice(-6), 16)
  const gradientIndex = isNaN(numericId) ? 0 : numericId % AVATAR_GRADIENTS.length
  const gradient = AVATAR_GRADIENTS[gradientIndex]
  const initials = getInitials(doctor.name)

  // Demo stats based deterministically on doctor ID
  const surgeries = (numericId % 30) + 10
  const patients = (numericId % 20) + 5
  const rating = 4.5 + ((numericId % 5) / 10)

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
              <div className={`relative size-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
                <span className="text-white font-bold text-2xl tracking-wide">{initials}</span>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">{doctor.name}</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Hồ sơ bác sĩ liên kết</p>
              </div>
            </div>

            {/* Mini stats */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-4">
              <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-wider mb-3">Thống kê</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Activity, label: "Ca phẫu thuật", value: surgeries, color: "text-blue-600" },
                  { icon: Users,    label: "Bệnh nhân mới", value: patients,  color: "text-emerald-600" },
                  { icon: Star,     label: "Đánh giá",      value: rating.toFixed(1),    color: "text-amber-500" },
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
                    <p className="text-sm font-semibold text-on-surface truncate">{doctor.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{doctor.email}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant/20 shrink-0">
                    <Lock className="size-2.5" />
                    Đã liên kết
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant/60 mt-2">
                  Tài khoản liên kết chỉ được thiết lập một lần khi tạo hồ sơ và không thể thay đổi.
                </p>
              </FormSection>
            </div>

            {/* 2. Personal info – read-only */}
            <div className="bg-white rounded-2xl border border-primary/20 shadow-sm p-6 transition-all">
              <FormSection icon={User} title="Thông tin cá nhân">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Họ và tên</Label>
                    <Input
                      value={doctor.name}
                      readOnly
                      className="rounded-xl h-10 border-none bg-surface-container-low/50 font-medium cursor-not-allowed opacity-80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Số điện thoại</Label>
                    <Input
                      value={doctor.phone}
                      readOnly
                      className="rounded-xl h-10 border-none bg-surface-container-low/50 font-medium cursor-not-allowed opacity-80"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Email liên lạc</Label>
                    <Input
                      value={doctor.email}
                      readOnly
                      className="rounded-xl h-10 border-none bg-surface-container-low/50 font-medium cursor-not-allowed opacity-80"
                    />
                  </div>
                </div>
                <p className="text-xs text-primary/70 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-primary/50" />
                  Thông tin đồng bộ từ tài khoản liên kết, không thể chỉnh sửa tại đây.
                </p>
              </FormSection>
            </div>

            {/* 3. Degree & specialty */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <FormSection icon={School} title="Trình độ & Chuyên môn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Học vị <span className="text-red-500">*</span></Label>
                    <Select value={degree} onValueChange={(val) => setDegree(val || "")}>
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
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Chuyên khoa <span className="text-red-500">*</span></Label>
                    <Select value={specialty} onValueChange={(val) => setSpecialty(val || "")}>
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
