import { Shield, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SecurityCardProps {
  title?: string
  description?: string
  items?: { text: string }[]
  className?: string
  variant?: "default" | "permissions"
  children?: React.ReactNode
  icon?: LucideIcon
}

export function SecurityCard({
  title = "Bảo mật hệ thống",
  description,
  items,
  className,
  variant = "default",
  children,
  icon: Icon = Shield,
}: SecurityCardProps) {
  if (variant === "permissions") {
    return (
      <div className={cn("bg-primary-container/10 p-6 rounded-xl", className)}>
        <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
          <Icon className="size-4" />
          {title}
        </h4>
        <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
          {description}
        </p>
        {children}
      </div>
    )
  }

  return (
    <div className={cn("bg-primary/5 p-6 rounded-xl border border-primary/10", className)}>
      <h4 className="font-headline font-bold text-primary mb-3 flex items-center gap-2">
        <Icon className="size-5" />
        {title}
      </h4>
      {description && (
        <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
          {description}
        </p>
      )}
      {items && items.length > 0 && (
        <ul className="text-xs text-on-surface-variant space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-green-600 shrink-0 mt-0.5">✓</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  )
}
