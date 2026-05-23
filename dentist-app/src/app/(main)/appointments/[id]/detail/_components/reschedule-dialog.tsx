"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale/vi"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

interface RescheduleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialDate: string
  initialStart: string
  initialEnd: string
  initialRoom: string
  onConfirm: (date: Date | undefined, startTime: string, endTime: string, room: string) => void
}

export function RescheduleDialog({
  isOpen,
  onOpenChange,
  initialDate,
  initialStart,
  initialEnd,
  initialRoom,
  onConfirm,
}: RescheduleDialogProps) {
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined
  )
  const [rescheduleStartTime, setRescheduleStartTime] = useState(initialStart)
  const [rescheduleEndTime, setRescheduleEndTime] = useState(initialEnd)
  const [rescheduleRoom, setRescheduleRoom] = useState(initialRoom)

  const handleConfirm = () => {
    onConfirm(rescheduleDate, rescheduleStartTime, rescheduleEndTime, rescheduleRoom)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đổi lịch khám</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant/60">Ngày khám mới</label>
            <Popover>
              <PopoverTrigger 
                render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "h-10 w-full justify-start text-left font-medium rounded-xl bg-slate-50 border-transparent focus-visible:ring-primary/20",
                      !rescheduleDate && "text-on-surface-variant/40"
                    )}
                  />
                }
              >
                <CalendarDays className="mr-2 size-4" />
                {rescheduleDate ? format(rescheduleDate, "dd/MM/yyyy") : <span>Chọn ngày khám</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={rescheduleDate}
                  onSelect={(d) => d && setRescheduleDate(d)}
                  locale={vi}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/60">Giờ bắt đầu</label>
              <Select value={rescheduleStartTime} onValueChange={(v) => v && setRescheduleStartTime(v)}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent">
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent>
                  {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/60">Giờ kết thúc</label>
              <Select value={rescheduleEndTime} onValueChange={(v) => v && setRescheduleEndTime(v)}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent">
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent>
                  {["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant/60">Phòng (Tuỳ chọn)</label>
            <Select value={rescheduleRoom} onValueChange={(v) => v && setRescheduleRoom(v)}>
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent">
                <SelectValue placeholder="Chọn phòng" />
              </SelectTrigger>
              <SelectContent>
                {["P.01", "P.02", "P.03", "P.04", "Phòng Phẫu Thuật"].map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
          <Button onClick={handleConfirm} className="rounded-xl bg-primary text-white hover:bg-primary/90">Xác nhận đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
