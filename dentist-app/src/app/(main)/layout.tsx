import { Sidebar, SidebarProvider } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  )
}
