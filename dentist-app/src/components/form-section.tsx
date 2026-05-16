import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormSectionProps {
  icon?: LucideIcon
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
  headerClassName?: string
}

export function FormSection({
  icon: Icon,
  title,
  description,
  className,
  children,
  headerClassName,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <h4
        className={cn(
          "font-headline font-bold text-secondary flex items-center gap-2 text-lg",
          headerClassName
        )}
      >
        {Icon && <Icon className="size-5" />}
        {title}
        {description && (
          <span className="text-xs text-on-surface-variant font-normal italic opacity-70 ml-2">
            {description}
          </span>
        )}
      </h4>
      {children}
    </div>
  )
}
