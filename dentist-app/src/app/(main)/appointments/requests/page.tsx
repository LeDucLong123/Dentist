"use client"

import { useState } from "react"
import { Topbar } from "@/components/topbar"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const requests = [
  {
    id: "YC001",
    patient: "Trần Văn G",
    doctor: "BS. Julian Pierce",
    service: "Lấy cao răng",
    originalTime: { date: "2026-05-18", time: "09:00 - 10:00" },
    proposedTime: { date: "2026-05-19", time: "14:00 - 15:00" },
    reason: "Bận việc đột xuất",
    status: "rescheduled",
  },
  {
    id: "YC002",
    patient: "Nguyễn Thị H",
    doctor: "BS. Emily Thorne",
    service: "Chỉnh nha",
    originalTime: { date: "2026-05-18", time: "15:30 - 16:30" },
    proposedTime: { date: "2026-05-20", time: "10:30 - 11:30" },
    reason: "Muốn đổi sang khung giờ sáng",
    status: "rescheduled",
  },
]

export default function RescheduleRequestsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const handleApprove = (req: any) => {
    setSelectedRequest(req)
    setConfirmOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Topbar title="Yêu cầu Đổi lịch" />

      <main className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex items-center gap-6">
          <div className="size-16 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
            <Info className="size-8" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-1">Quản lý Yêu cầu Đổi lịch</h2>
            <p className="text-on-surface-variant/60">Xem và phê duyệt các yêu cầu thay đổi thời gian khám từ bệnh nhân hoặc bác sĩ.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/90 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="h-14 px-8 font-bold text-on-surface-variant/70 uppercase tracking-wider text-[11px]">
                  Bệnh nhân & Dịch vụ
                </TableHead>
                <TableHead className="h-14 px-8 font-bold text-on-surface-variant/70 uppercase tracking-wider text-[11px] text-center">
                  Lịch gốc
                </TableHead>
                <TableHead className="h-14 px-8 w-16"></TableHead>
                <TableHead className="h-14 px-8 font-bold text-tertiary uppercase tracking-wider text-[11px] text-center bg-tertiary/5">
                  Lịch đề xuất
                </TableHead>
                <TableHead className="h-14 px-8 font-bold text-on-surface-variant/70 uppercase tracking-wider text-[11px]">
                  Lý do
                </TableHead>
                <TableHead className="h-14 px-8 w-16 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id} className="group hover:bg-slate-50/80 transition-colors border-slate-100 last:border-0">
                  <TableCell className="py-6 px-8">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-on-surface text-[14px] leading-tight">
                        {req.patient}
                      </span>
                      <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">
                        {req.service}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-6 px-8">
                    <div className="flex flex-col items-center gap-0.5 opacity-60">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-on-surface">
                        <Calendar className="size-3" />
                        {new Date(req.originalTime.date).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-on-surface-variant">
                        <Clock className="size-3" />
                        {req.originalTime.time}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-6 px-8">
                    <div className="flex items-center justify-center">
                      <ArrowRight className="size-5 text-on-surface-variant/30" />
                    </div>
                  </TableCell>

                  <TableCell className="py-6 px-8 bg-tertiary/[0.02]">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-tertiary">
                        <Calendar className="size-3" />
                        {new Date(req.proposedTime.date).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-tertiary/70">
                        <Clock className="size-3" />
                        {req.proposedTime.time}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-6 px-8">
                    <p className="text-xs text-on-surface-variant leading-relaxed max-w-[200px]">
                      {req.reason}
                    </p>
                  </TableCell>

                  <TableCell className="py-6 px-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleApprove(req)}
                        className="size-10 rounded-xl hover:bg-green-50 text-green-600"
                      >
                        <CheckCircle2 className="size-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 rounded-xl hover:bg-error-container/10 text-error"
                      >
                        <XCircle className="size-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-slate-200/50">
          <p className="text-sm font-medium text-on-surface-variant">
            Hiển thị <span className="font-bold text-on-surface">2</span> yêu cầu
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="size-10 rounded-xl bg-white border-slate-200">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-10 rounded-xl bg-white border-slate-200">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        title="Phê duyệt Đổi lịch?"
        description={`Bạn có chắc chắn muốn phê duyệt đổi lịch cho bệnh nhân "${selectedRequest?.patient}" sang ngày ${selectedRequest?.proposedTime.date} lúc ${selectedRequest?.proposedTime.time}?`}
        confirmText="Phê duyệt"
        destructive={false}
      />
    </div>
  )
}
