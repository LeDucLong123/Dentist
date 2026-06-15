import { Sidebar, SidebarProvider } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  const decoded = token ? verifyToken(token) : null

  if (!decoded || !["admin", "doctor", "receptionist"].includes(decoded.role)) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  )
}
