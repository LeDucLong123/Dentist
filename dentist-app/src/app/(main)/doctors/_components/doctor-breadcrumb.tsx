import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DoctorBreadcrumbProps {
  items?: BreadcrumbItem[]
}

export function DoctorBreadcrumb({ items = [] }: DoctorBreadcrumbProps) {
  const allItems: BreadcrumbItem[] = [
    { label: "Hệ thống" },
    { label: "Bác sĩ", href: "/doctors" },
    ...items,
  ]

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/50 mb-6">
      {allItems.map((item, idx) => {
        const isLast = idx === allItems.length - 1
        return (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight className="size-3" />}
            {isLast ? (
              <span className="text-primary font-semibold">{item.label}</span>
            ) : item.href ? (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
