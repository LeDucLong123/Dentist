"use client"

import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  destructive = true,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md mx-4 p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant"
        >
          <X className="size-5" />
        </button>

        <div className="p-6 text-center">
          <div
            className={cn(
              "mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center",
              destructive
                ? "bg-error-container text-on-error-container"
                : "bg-tertiary-container text-on-tertiary"
            )}
          >
            <AlertTriangle className="size-7" />
          </div>

          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
            {title}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-surface-container-high text-on-surface-variant font-bold border-0 rounded-xl py-3 h-auto"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={cn(
              "flex-1 font-bold rounded-xl py-3 h-auto shadow-lg",
              destructive
                ? "bg-error text-on-error hover:bg-error/90 shadow-error/20"
                : "bg-tertiary text-on-tertiary hover:bg-tertiary/90 shadow-tertiary/20"
            )}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
