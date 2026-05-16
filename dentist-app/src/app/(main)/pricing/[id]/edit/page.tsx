"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Banknote, Info, Calendar, CheckCircle2, Lock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Topbar } from "@/components/topbar"
import { FormSection } from "@/components/form-section"

const MOCK_SERVICES = [
  "Cấy ghép Implant Osstem",
  "Cấy ghép Implant Straumann",
  "Chỉnh nha mắc cài kim loại",
  "Chỉnh nha mắc cài sứ",
  "Tẩy trắng răng Laser",
  "Nhổ răng khôn",
  "Bọc răng sứ Zirconia",
]

const MOCK_PRICING = {
  id: "BG001",
  serviceName: "Cấy ghép Implant Osstem",
  priceType: "VIP",
  standardPrice: 18000000,
  validFrom: "2026-05-01",
  validTo: "2026-12-31",
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price)
}

export default function EditPricingPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      toast.success("Cập nhật thành công!", { description: `Bảng giá "${MOCK_PRICING.priceType}" – ${MOCK_PRICING.serviceName} đã được lưu.` })
      router.push("/pricing")
    }, 600)
  }

  return (
    <>
      <Topbar searchPlaceholder="Tìm kiếm bảng giá..." />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50 mb-6">
            <span>Cấu hình</span>
            <span className="size-3 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3"><path d="m9 18 6-6-6-6" /></svg></span>
            <Link href="/pricing" className="hover:text-primary transition-colors">Bảng giá</Link>
            <span className="size-3 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3"><path d="m9 18 6-6-6-6" /></svg></span>
            <span className="text-primary font-semibold">Chỉnh sửa</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Banknote className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Chỉnh sửa bảng giá</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Cập nhật thông tin cho bảng giá <span className="font-semibold text-on-surface">{MOCK_PRICING.priceType}</span> – {MOCK_PRICING.serviceName}.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Preview card */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6 text-center space-y-3">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-md">
                <Banknote className="size-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">{MOCK_PRICING.serviceName}</h4>
                <p className="text-lg font-extrabold text-primary mt-1">{formatPrice(MOCK_PRICING.standardPrice)} ₫</p>
              </div>
            </div>

            {/* ID – read only */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5">
              <div className="flex items-center gap-3 bg-surface-container-low/60 rounded-xl px-4 py-3">
                <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Lock className="size-4 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-on-surface-variant/60 font-medium">Mã bảng giá</p>
                  <p className="text-sm font-bold text-on-surface font-mono">{MOCK_PRICING.id}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant/20 shrink-0">
                  <Lock className="size-2.5" />
                  Cố định
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Lưu ý</p>
              <ul className="space-y-1.5">
                {[
                  "Mã bảng giá không thể thay đổi sau khi tạo.",
                  "Thay đổi thời gian áp dụng sẽ ảnh hưởng ngay lập tức.",
                  "Bảng giá hết hạn sẽ tự động ngừng áp dụng.",
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
            {/* Service & type */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <FormSection icon={Info} title="Thông tin bảng giá">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Dịch vụ áp dụng <span className="text-red-500">*</span></Label>
                    <Select defaultValue={MOCK_PRICING.serviceName}>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Loại giá <span className="text-red-500">*</span></Label>
                    <Select defaultValue={MOCK_PRICING.priceType}>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Thường">Thường</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="Khuyến mãi">Khuyến mãi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Giá niêm yết (VNĐ) <span className="text-red-500">*</span></Label>
                    <Input type="number" defaultValue={MOCK_PRICING.standardPrice} className="bg-surface-container-low border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Date range */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <FormSection icon={Calendar} title="Thời gian áp dụng">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ngày bắt đầu <span className="text-red-500">*</span></Label>
                    <Input type="date" defaultValue={MOCK_PRICING.validFrom} className="bg-surface-container-low border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ngày kết thúc <span className="text-red-500">*</span></Label>
                    <Input type="date" defaultValue={MOCK_PRICING.validTo} className="bg-surface-container-low border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Link href="/pricing">
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
                  <><Banknote className="size-4" /> Lưu thay đổi</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
