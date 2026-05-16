"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Stethoscope, Info, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Topbar } from "@/components/topbar"
import { AvatarUpload } from "@/components/avatar-upload"
import { FormSection } from "@/components/form-section"

export default function NewServicePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [bookable, setBookable] = useState(true)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      toast.success("Thêm dịch vụ thành công!", { description: "Dịch vụ mới đã được tạo trong hệ thống." })
      router.push("/services")
    }, 600)
  }

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm dịch vụ..." />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50 mb-6">
            <span>Hệ thống</span>
            <span className="size-3 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3"><path d="m9 18 6-6-6-6" /></svg></span>
            <Link href="/services" className="hover:text-primary transition-colors">Dịch vụ</Link>
            <span className="size-3 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3"><path d="m9 18 6-6-6-6" /></svg></span>
            <span className="text-primary font-semibold">Thêm mới</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Stethoscope className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Thêm dịch vụ mới</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Nhập thông tin chi tiết để thêm dịch vụ vào hệ thống.
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
                <h4 className="font-bold text-blue-900 text-sm">Hình ảnh minh họa</h4>
                <p className="text-xs text-on-surface-variant mt-1">JPG, PNG · Tối đa 2MB</p>
              </div>
            </div>

            {/* Status toggle */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5 space-y-3">
              <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider">Trạng thái</p>
              <button
                onClick={() => setBookable(!bookable)}
                className={`w-full p-3.5 rounded-xl flex items-center justify-between transition-all ${bookable ? "bg-emerald-50 border border-emerald-200" : "bg-surface-container-low border border-outline-variant/20"}`}
              >
                <div className="text-left">
                  <p className={`text-sm font-bold ${bookable ? "text-emerald-700" : "text-on-surface-variant"}`}>Cho phép đặt lịch</p>
                  <p className="text-xs text-on-surface-variant/70 mt-0.5">Bệnh nhân có thể thấy dịch vụ</p>
                </div>
                <div className={`size-5 rounded-full flex items-center justify-center ${bookable ? "bg-emerald-500" : "bg-outline-variant/30"}`}>
                  {bookable && <CheckCircle2 className="size-3.5 text-white" />}
                </div>
              </button>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Lưu ý</p>
              <ul className="space-y-1.5">
                {[
                  "Tên dịch vụ sẽ hiển thị cho bệnh nhân trên ứng dụng.",
                  "Quy trình giúp bệnh nhân hiểu các bước điều trị.",
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
            {/* Basic info */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <FormSection icon={Info} title="Thông tin cơ bản">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tên dịch vụ <span className="text-red-500">*</span></Label>
                    <Input placeholder="VD: Cấy ghép Implant Osstem" className="bg-surface-container-low border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Chuyên khoa <span className="text-red-500">*</span></Label>
                    <Select>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue placeholder="Chọn chuyên khoa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Răng sứ & Implant">Răng sứ & Implant</SelectItem>
                        <SelectItem value="Chỉnh nha">Chỉnh nha</SelectItem>
                        <SelectItem value="Thẩm mỹ">Thẩm mỹ</SelectItem>
                        <SelectItem value="Tổng quát">Tổng quát</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Mô tả dịch vụ</Label>
                    <Textarea
                      placeholder="Mô tả chi tiết về dịch vụ..."
                      className="min-h-[100px] bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>
              </FormSection>
            </div>


            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Link href="/services">
                <Button variant="outline" disabled={isSaving} className="px-6 rounded-xl font-semibold border-outline-variant/30 text-on-surface-variant">
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
                  <><Stethoscope className="size-4" /> Lưu dịch vụ</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
