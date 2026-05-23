"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fmtCurrency } from "@/lib/date-utils"

interface PaymentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  total: number
  paid: number
  remaining: number
  onConfirm: (amount: number, method: string) => void
}

export function PaymentDialog({
  isOpen,
  onOpenChange,
  total,
  paid,
  remaining,
  onConfirm,
}: PaymentDialogProps) {
  const [paymentAmount, setPaymentAmount] = useState(remaining)
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt")

  useEffect(() => {
    if (isOpen) {
      setPaymentAmount(remaining)
    }
  }, [isOpen, remaining])

  const handleConfirm = () => {
    onConfirm(paymentAmount, paymentMethod)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thanh toán chi phí điều trị</DialogTitle>
          <DialogDescription>Ghi nhận giao dịch đóng tiền viện phí của bệnh nhân.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs text-on-surface-variant/60">
              <span>Tổng chi phí điều trị:</span>
              <span className="font-semibold text-on-surface">{fmtCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant/60">
              <span>Đã đóng trước đó:</span>
              <span className="font-semibold text-emerald-600">{fmtCurrency(paid)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-outline-variant/10 pt-2 text-red-600">
              <span>Còn nợ:</span>
              <span>{fmtCurrency(remaining)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant/60">Số tiền đóng lần này (VND)</label>
            <input
              type="number"
              min="1000"
              max={remaining}
              step="50000"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Math.min(remaining, Math.max(0, parseInt(e.target.value) || 0)))}
              className="h-10 px-3 rounded-xl bg-slate-50 border border-outline-variant/10 focus:outline-none focus:ring-1 focus:ring-primary text-sm font-bold text-primary"
            />
            <span className="text-[10px] text-on-surface-variant/40 italic">Mặc định là toàn bộ số tiền còn nợ.</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant/60">Phương thức thanh toán</label>
            <Select value={paymentMethod} onValueChange={(val) => val && setPaymentMethod(val)}>
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent">
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                {["Tiền mặt", "Chuyển khoản QR", "Quẹt thẻ"].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-transparent">Hủy</Button>
          <Button onClick={handleConfirm} className="rounded-xl bg-primary text-white hover:bg-primary/90 border-transparent">Xác nhận thanh toán</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
