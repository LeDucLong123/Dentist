"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PasswordInputProps {
  id?: string
  placeholder?: string
  defaultValue?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  inputClassName?: string
}

export function PasswordInput({
  id,
  placeholder = "Nhập mật khẩu",
  defaultValue,
  value,
  onChange,
  className,
  inputClassName,
}: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        type={show ? "text" : "password"}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "bg-surface-container-low border-none rounded-lg py-3 px-4 h-auto focus:bg-surface focus:ring-2 focus:ring-primary/20 pr-10",
          inputClassName
        )}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
