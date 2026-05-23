"use client"

import { useState, useRef, useMemo } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ComboItem {
  id: string
  name: string
  sub?: string
}

interface SearchComboboxProps {
  items: ComboItem[]
  value: ComboItem | null
  onSelect: (item: ComboItem) => void
  placeholder: string
  icon: React.ElementType
  renderItem?: (item: ComboItem) => React.ReactNode
  containerClassName?: string
  iconClassName?: string
  inputClassName?: string
}

export function SearchCombobox({
  items,
  value,
  onSelect,
  placeholder,
  icon: Icon,
  renderItem,
  containerClassName = "h-12 text-sm",
  iconClassName = "left-4 size-4",
  inputClassName = "pl-11 pr-10",
}: SearchComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(
    () =>
      items.filter(
        (it) =>
          it.name.toLowerCase().includes(query.toLowerCase()) ||
          (it.sub ?? "").toLowerCase().includes(query.toLowerCase()) ||
          it.id.toLowerCase().includes(query.toLowerCase())
      ),
    [items, query]
  )

  const handleSelect = (item: ComboItem) => {
    onSelect(item)
    setQuery("")
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(null as unknown as ComboItem)
    setQuery("")
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setQuery("")
      }}
    >
      <PopoverTrigger
        nativeButton={false}
        render={
          <div className={cn("relative bg-slate-50 rounded-xl border border-transparent focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 overflow-visible transition-all", containerClassName)} />
        }
      >
        <Icon className={cn("absolute top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none z-10", iconClassName)} />

        {/* Selected item display */}
        {value && !open ? (
          <div className={cn("absolute inset-0 flex items-center", inputClassName)}>
            <span className="text-sm font-semibold text-on-surface truncate">{value.name}</span>
            {value.sub && (
              <span className="ml-2 text-xs text-on-surface-variant/60 truncate shrink-0">{value.sub}</span>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            value={query}
            onClick={(e) => { e.stopPropagation(); setOpen(true) }}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder={value ? value.name : placeholder}
            className={cn(
              "absolute inset-0 bg-transparent font-medium outline-none",
              inputClassName,
              value ? "placeholder:text-on-surface placeholder:font-semibold" : "placeholder:text-on-surface-variant/40"
            )}
          />
        )}

        {/* Clear buttons */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-on-surface/10 hover:bg-on-surface/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="size-3 text-on-surface-variant" />
          </button>
        )}
        {!value && query && (
          <button
            onClick={(e) => { e.stopPropagation(); setQuery(""); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-on-surface/10 hover:bg-on-surface/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="size-3 text-on-surface-variant" />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-1.5 rounded-xl shadow-lg border border-outline-variant/15 bg-white"
        align="start"
        sideOffset={6}
      >
        {/* Inline search input */}
        {value && (
          <div className="relative mb-1.5 px-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm khác..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-lg text-xs font-medium outline-none border border-transparent focus:border-primary/30"
            />
          </div>
        )}

        <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider px-2 py-1">
          Kết quả
        </div>

        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {suggestions.length === 0 ? (
            <div className="px-2 py-3 text-xs text-on-surface-variant/50 italic text-center">
              Không tìm thấy kết quả
            </div>
          ) : (
            suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors text-sm",
                  value?.id === item.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-slate-50 text-on-surface"
                )}
              >
                {renderItem ? renderItem(item) : (
                  <span className="font-medium">{item.name}</span>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
