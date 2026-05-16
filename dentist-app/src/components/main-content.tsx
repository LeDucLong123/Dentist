"use client"

import { useSidebar } from "@/components/sidebar"

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  return (
    <main
      className={`flex-1 relative flex flex-col min-h-screen transition-[margin-left] duration-300 ease-in-out ${collapsed ? "ml-[68px]" : "ml-72"}`}
    >
      {children}
    </main>
  )
}
