"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale/vi"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const startTimesMorning = ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
const startTimesAfternoon = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"]
const startTimesEvening = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"]

const endTimesMorning = ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"]
const endTimesAfternoon = ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"]
const endTimesEvening = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"]

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
    if (rescheduleStartTime >= rescheduleEndTime) {
      toast.error("Giờ kết thúc phải lớn hơn giờ bắt đầu.")
      return
    }
    if (!rescheduleRoom) {
      toast.error("Vui lòng chọn phòng khám.")
      return
    }
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
                  <SelectGroup>
                    <SelectLabel className="font-bold text-[10px] text-slate-400 bg-slate-50 px-2.5 py-1 uppercase tracking-wider">Ca Sáng (07:00 - 12:00)</SelectLabel>
                    {startTimesMorning.map(time => (
                      <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="font-bold text-[10px] text-slate-400 bg-slate-50 px-2.5 py-1 uppercase tracking-wider">Ca Chiều (12:00 - 18:00)</SelectLabel>
                    {startTimesAfternoon.map(time => (
                      <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="font-bold text-[10px] text-indigo-500 bg-indigo-50/50 px-2.5 py-1 uppercase tracking-wider">Ca Tối (18:00 - 22:00)</SelectLabel>
                    {startTimesEvening.map(time => (
                      <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                    ))}
                  </SelectGroup>
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
                  <SelectGroup>
                    <SelectLabel className="font-bold text-[10px] text-slate-400 bg-slate-50 px-2.5 py-1 uppercase tracking-wider">Ca Sáng (07:00 - 12:00)</SelectLabel>
                    {endTimesMorning.map(time => (
                      <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="font-bold text-[10px] text-slate-400 bg-slate-50 px-2.5 py-1 uppercase tracking-wider">Ca Chiều (12:00 - 18:00)</SelectLabel>
                    {endTimesAfternoon.map(time => (
                      <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="font-bold text-[10px] text-indigo-500 bg-indigo-50/50 px-2.5 py-1 uppercase tracking-wider">Ca Tối (18:00 - 22:00)</SelectLabel>
                    {endTimesEvening.map(time => (
                      <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant/60">Phòng khám</label>
            <Select value={rescheduleRoom} onValueChange={(v) => v && setRescheduleRoom(v)}>
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent">
                <SelectValue placeholder="Chọn phòng" />
              </SelectTrigger>
              <SelectContent>
                {["Phòng Khám 01", "Phòng Khám 02", "Phòng Khám 03", "Phòng Khám 04", "Phòng Khám 05", "Phòng Khám 06", "Phòng Khám 07", "Phòng Khám 08"].map(r => (
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
