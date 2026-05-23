"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddServiceDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (item: { name: string; qty: number; unit: string; price: number; type: "vip" | "thuong" | "khuyenmai" }) => void
}

export function AddServiceDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: AddServiceDialogProps) {
  const [newServiceName, setNewServiceName] = useState("Nhổ răng khôn thường")
  const [newServiceQty, setNewServiceQty] = useState(1)
  const [newServiceUnit, setNewServiceUnit] = useState("răng")
  const [newServicePrice, setNewServicePrice] = useState(1500000)
  const [newServiceType, setNewServiceType] = useState<"vip" | "thuong" | "khuyenmai">("thuong")

  const handleServiceTypeChange = (name: string | null) => {
    if (!name) return
    setNewServiceName(name)
    switch (name) {
      case "Nhổ răng khôn thường":
        setNewServicePrice(1500000)
        setNewServiceUnit("răng")
        break
      case "Nhổ răng khôn phẫu thuật":
        setNewServicePrice(2500005)
        setNewServicePrice(2500000)
        setNewServiceUnit("răng")
        break
      case "Cạo vôi răng":
        setNewServicePrice(300000)
        setNewServiceUnit("lần")
        break
      case "Trám răng Composite":
        setNewServicePrice(400000)
        setNewServiceUnit("răng")
        break
      case "Chữa tủy răng":
        setNewServicePrice(2000000)
        setNewServiceUnit("răng")
        break
      case "Tẩy trắng răng Laser":
        setNewServicePrice(3500000)
        setNewServiceUnit("ca")
        break
      case "Bọc răng sứ E-max":
        setNewServicePrice(4000000)
        setNewServiceUnit("cái")
        break
    }
  }

  const handleConfirm = () => {
    onConfirm({
      name: newServiceName,
      qty: newServiceQty,
      unit: newServiceUnit,
      price: newServicePrice,
      type: newServiceType,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉ định dịch vụ / Vật tư</DialogTitle>
          <DialogDescription>Chọn dịch vụ hoặc thủ thuật điều trị y tế để bổ sung vào hồ sơ bệnh nhân.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant/60">Tên dịch vụ / Thủ thuật</label>
            <Select value={newServiceName} onValueChange={handleServiceTypeChange}>
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent">
                <SelectValue placeholder="Chọn dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Nhổ răng khôn thường",
                  "Nhổ răng khôn phẫu thuật",
                  "Cạo vôi răng",
                  "Trám răng Composite",
                  "Chữa tủy răng",
                  "Tẩy trắng răng Laser",
                  "Bọc răng sứ E-max"
                ].map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/60">Số lượng</label>
              <input
                type="number"
                min="1"
                value={newServiceQty}
                onChange={(e) => setNewServiceQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-outline-variant/10 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/60">Đơn vị</label>
              <input
                type="text"
                value={newServiceUnit}
                onChange={(e) => setNewServiceUnit(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-outline-variant/10 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/60">Đơn giá (VND)</label>
              <input
                type="number"
                min="0"
                step="50000"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-outline-variant/10 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/60">Phân loại</label>
              <Select value={newServiceType} onValueChange={(v) => setNewServiceType(v as any)}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent">
                  <SelectValue placeholder="Phân loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thuong">Thường</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="khuyenmai">Khuyến mãi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-transparent">Hủy</Button>
          <Button onClick={handleConfirm} className="rounded-xl bg-primary text-white hover:bg-primary/90 border-transparent">Xác nhận thêm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
