import { ArrowRight, type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SummaryCardProps {
  number?: string
  title: string
  description?: string
  variant?: "default" | "highlighted"
  actionText?: string
  children?: React.ReactNode
  className?: string
  icon?: LucideIcon
  value?: string | number
  trend?: {
    value: number
    label: string
    isUp: boolean
  }
}

export function SummaryCard({
  number,
  title,
  description,
  variant = "default",
  actionText,
  children,
  className,
  icon: Icon,
  value,
  trend,
}: SummaryCardProps) {
  if (variant === "highlighted") {
    return (
      <div
        className={cn(
          "bg-secondary-fixed p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-48 md:scale-105 shadow-xl shadow-secondary/10",
          className
        )}
      >
        <div className="z-10">
          <h4 className="font-headline font-bold text-on-secondary-fixed-variant text-lg mb-1">
            {title}
          </h4>
          {description && <p className="text-sm text-on-secondary-fixed-variant/80">{description}</p>}
          {value && <p className="text-3xl font-black text-on-secondary-fixed mt-2">{value}</p>}
        </div>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-surface-container-low p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px]",
        className
      )}
    >
      <div className="z-10">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-headline font-bold text-blue-900 text-lg leading-tight">{title}</h4>
          {Icon && (
            <div className="p-2 bg-white/50 rounded-xl">
              <Icon className="size-5 text-primary" />
            </div>
          )}
        </div>
        
        {value && (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-on-surface tracking-tight">{value}</span>
            {trend && (
              <div className={cn(
                "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                trend.isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {trend.isUp ? <TrendingUp className="size-3 mr-0.5" /> : <TrendingDown className="size-3 mr-0.5" />}
                {trend.value}%
              </div>
            )}
          </div>
        )}
        
        {description && <p className="text-xs text-on-surface-variant mt-1">{description}</p>}
        {trend && <p className="text-[10px] text-on-surface-variant mt-0.5">{trend.label}</p>}
      </div>

      {actionText && (
        <div className="flex items-center gap-2 text-primary font-bold text-sm mt-4">
          <span>{actionText}</span>
          <ArrowRight className="size-4" />
        </div>
      )}
      {children}
    </div>
  )
}
