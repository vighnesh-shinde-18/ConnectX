"use client"

import * as React from "react"
import { Inbox, Command } from "lucide-react"
import chatServices from "@/services/chat"
import { useAuth } from "@/context/AuthContext"
import { NavUser } from "./nav-user.jsx"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { useEffect } from "react"

const navMain = [{ title: "Inbox", url: "#", icon: Inbox, isActive: true }]

export function AppSidebar({ setSelectedChat, ...props }) {

  const { user } = useAuth()
  const { setOpen, isMobile, state } = useSidebar()
  const [activeItem, setActiveItem] = React.useState(navMain[0])
  const [chats, setChats] = React.useState([])

  useEffect(() => {
    if (!user?.uid) return
    const unsubscribe = chatServices.listenUserChats(user.uid, (list) => setChats(list))

    return () => unsubscribe()
  }, [user])

  
  const ChatListContent = () => (
    <>
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-base font-medium">{activeItem.title}</div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Unreads</span>
            <Switch className="scale-75" />
          </Label>
        </div>
        <SidebarInput placeholder="Search chats..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="hover:bg-sidebar-accent flex flex-col gap-1 border-b p-4 text-sm cursor-pointer"
                onClick={() => {
                  setSelectedChat({
                    name: chat.name,
                    email: chat?.email || "",
                    id:chat?.id
                  })
                  if (isMobile) setOpen(false)
                }}

              >
                <div className="flex justify-between">
                  <span className="font-medium truncate">{chat.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{chat.lastMessageAt}</span>
                </div>
                <span className="line-clamp-1 text-xs text-muted-foreground">{chat.lastMessage}</span>
              </div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  )

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* COLUMN 1: NAV ICONS */}
      <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#"><Command className="size-4" /></a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeItem.title === item.title}
                    onClick={() => { setActiveItem(item); setOpen(true); }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* MOBILE ONLY: Chat list appears here when sidebar is open on small screens */}
          {isMobile && state === "expanded" && (
            <div className="border-t mt-2">
              <ChatListContent />
            </div>
          )}
        </SidebarContent>
        <SidebarFooter>
          {/* NavUser shows only on mobile in Column 1, or remains here if preferred */}
          {isMobile && <NavUser user={user} />}
        </SidebarFooter>
      </Sidebar>

      {/* COLUMN 2: DESKTOP CHAT LIST */}
      {/* This column is hidden on mobile entirely */}
      {!isMobile && (
        <Sidebar collapsible="none" className="flex flex-1">
          <ChatListContent />
          <SidebarFooter className="border-t">
            <NavUser user={user} />
          </SidebarFooter>
        </Sidebar>
      )}
    </Sidebar>
  )
}