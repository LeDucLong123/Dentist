"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Banknote, Info, Calendar, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Topbar } from "@/components/topbar"
import { FormSection } from "@/components/form-section"

export default function NewPricingPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [services, setServices] = useState<any[]>([])

  const [serviceId, setServiceId] = useState("")
  const [serviceName, setServiceName] = useState("")
  const [priceType, setPriceType] = useState("")
  const [standardPrice, setStandardPrice] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [isForever, setIsForever] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services")
        if (!res.ok) throw new Error("Không thể tải danh sách dịch vụ.")
        const data = await res.json()
        setServices(data.filter((s: any) => s.status === "active"))
      } catch (err: any) {
        toast.error(err.message || "Đã xảy ra lỗi khi tải danh mục dịch vụ.")
      }
    }
    fetchServices()
  }, [])

  const handleSave = async () => {
    if (!serviceName || !priceType || !standardPrice || !validFrom || (!isForever && !validTo)) {
      toast.error("Vui lòng nhập đầy đủ thông tin bảng giá.")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          serviceName,
          priceType,
          standardPrice: Number(standardPrice),
          validFrom,
          validTo: isForever ? null : validTo,
          status: "applied",
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Tạo bảng giá thất bại.")

      toast.success("Thêm bảng giá thành công!", { description: "Bảng giá mới đã được tạo trong hệ thống." })
      router.push("/pricing")
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.")
    } finally {
      setIsSaving(false)
    }
  }

  // Format pricing preview
  const formatPrice = (price: string) => {
    const num = Number(price)
    if (isNaN(num) || !price) return "0"
    return new Intl.NumberFormat("vi-VN").format(num)
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
            <span className="text-primary font-semibold">Thêm mới</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Banknote className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Thêm bảng giá mới</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Thiết lập mức giá mới cho dịch vụ nha khoa.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Preview */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6 text-center space-y-3">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-md">
                <Banknote className="size-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm truncate max-w-[200px] mx-auto">{serviceName || "Bảng giá mới"}</h4>
                <p className="text-lg font-extrabold text-primary mt-1">{formatPrice(standardPrice)} ₫</p>
                {priceType && <p className="text-xs text-on-surface-variant mt-1">Loại: {priceType}</p>}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Lưu ý</p>
              <ul className="space-y-1.5">
                {[
                  "Giá niêm yết là mức giá gốc trước giảm giá.",
                  "Thời gian áp dụng xác định khoảng hiệu lực.",
                  "Bảng giá sẽ tự động ngừng khi hết hạn.",
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
                    <Select value={serviceName} onValueChange={(val) => {
                      setServiceName(val || "")
                      const found = services.find(s => s.name === val)
                      if (found) setServiceId(found.id)
                    }}>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue placeholder="Chọn dịch vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Loại giá <span className="text-red-500">*</span></Label>
                    <Select value={priceType} onValueChange={(val) => setPriceType(val || "")}>
                      <SelectTrigger className="w-full bg-surface-container-low border-none rounded-xl h-10">
                        <SelectValue placeholder="Chọn loại giá" />
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
                    <Input type="number" value={standardPrice} onChange={(e) => setStandardPrice(e.target.value)} placeholder="VD: 15000000" className="bg-surface-container-low border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Date range */}
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <FormSection icon={Calendar} title="Thời gian áp dụng">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForever(!isForever)
                        if (!isForever) setValidTo("")
                      }}
                      className={`px-4 py-2.5 rounded-xl border flex items-center justify-between transition-all w-full text-left ${
                        isForever ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">Thời hạn áp dụng</p>
                        <p className="text-xs opacity-85 mt-0.5">{isForever ? "Áp dụng vô thời hạn (mãi mãi)" : "Áp dụng trong khoảng thời gian xác định"}</p>
                      </div>
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-all shrink-0 ${isForever ? "bg-blue-500 flex justify-end" : "bg-slate-300 flex justify-start"}`}>
                        <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                      </div>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ngày bắt đầu <span className="text-red-500">*</span></Label>
                    <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="bg-surface-container-low border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20" />
                  </div>
                  
                  {!isForever && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Ngày kết thúc <span className="text-red-500">*</span></Label>
                      <Input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className="bg-surface-container-low border-none rounded-xl h-10 focus:ring-2 focus:ring-primary/20" />
                    </div>
                  )}
                </div>
              </FormSection>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Link href="/pricing">
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
                  <><Banknote className="size-4" /> Lưu bảng giá</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
