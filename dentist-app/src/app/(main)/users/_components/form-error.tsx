import { AlertCircle } from "lucide-react"

export function FormError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-error font-medium mt-1">
      <AlertCircle className="size-3 shrink-0" /> {msg}
    </p>
  )
}
