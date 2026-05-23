"use client"

import { FileText } from "lucide-react"

interface ClinicalExamFormProps {
  status: string
  symptoms: string
  setSymptoms: (v: string) => void
  diagnosis: string
  setDiagnosis: (v: string) => void
  prescription: string
  setPrescription: (v: string) => void
  note: string
  setNote: (v: string) => void
}

export function ClinicalExamForm({
  status,
  symptoms,
  setSymptoms,
  diagnosis,
  setDiagnosis,
  prescription,
  setPrescription,
  note,
  setNote,
}: ClinicalExamFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex items-center gap-2">
        <FileText className="size-4 text-primary" />
        <h2 className="font-bold text-sm text-on-surface">Ghi chú lâm sàng & Điều trị</h2>
      </div>
      <div className="p-6 space-y-4">
        {status === "examining" ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/70">Triệu chứng lâm sàng</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Nhập triệu chứng của bệnh nhân..."
                className="min-h-[60px] w-full rounded-xl bg-slate-50 border border-outline-variant/20 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/70">Chẩn đoán của Bác sĩ</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Nhập chẩn đoán bệnh..."
                className="min-h-[60px] w-full rounded-xl bg-slate-50 border border-outline-variant/20 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/70">Kê đơn thuốc & Lời dặn</label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Kê đơn thuốc (tên thuốc, liều dùng, số lượng) và dặn dò bệnh nhân..."
                className="min-h-[80px] w-full rounded-xl bg-slate-50 border border-outline-variant/20 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant/70">Ghi chú thêm</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú nội bộ..."
                className="min-h-[60px] w-full rounded-xl bg-slate-50 border border-outline-variant/20 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase block mb-1">Triệu chứng lâm sàng</span>
                <p className="text-sm text-on-surface leading-relaxed">
                  {symptoms || <span className="text-on-surface-variant/40 italic font-normal">Chưa ghi nhận</span>}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase block mb-1">Chẩn đoán</span>
                <p className="text-sm text-on-surface leading-relaxed">
                  {diagnosis || <span className="text-on-surface-variant/40 italic font-normal">Chưa ghi nhận</span>}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase block mb-1">Đơn thuốc & Lời dặn</span>
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {prescription || <span className="text-on-surface-variant/40 italic font-normal">Chưa kê đơn</span>}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
              <span className="text-[10px] font-bold text-amber-800/60 uppercase block mb-1">Ghi chú chung</span>
              <p className="text-sm text-amber-900 leading-relaxed font-medium">
                {note || <span className="text-amber-850/40 italic font-normal">Không có ghi chú</span>}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
