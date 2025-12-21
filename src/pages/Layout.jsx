import { AppSidebar } from "@/components/app-sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Layout({ children, selectedChat,setSelectedChat }) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "350px" }}>
      <AppSidebar setSelectedChat={setSelectedChat} />

      {/* SidebarInset is the main container */}
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* HEADER - Fixed at top */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />

          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold">
              {selectedChat?.name || "Select a chat"}
            </span>
            <span className="text-sm text-muted-foreground">
              {selectedChat?.email || ""}
            </span>
          </div>
        </header>

        {/* CONTENT AREA - Now a flex container for chat + input */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}