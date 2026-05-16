import type { Metadata } from "next"
import { Manrope, Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Clinical Serenity",
  description: "Quản lý nha khoa",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${manrope.variable} ${inter.variable} light`}>
      <body className="min-h-screen bg-surface text-on-surface font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
