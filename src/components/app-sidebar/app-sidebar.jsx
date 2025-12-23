"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import chatServices from "@/services/chat"
import { useAuth } from "@/context/AuthContext"
import { NavUser } from "./nav-user.jsx"
import { UserPlus, CheckIcon, Mail, Inbox, Command, X, Search } from "lucide-react";
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

// Mock Data - In a real app, you'd fetch this from Firebase
const mockUsers = [
  { id: "1", name: "Vighnesh", email: "vighneshshinde80@gmail.com", initials: "V" },
  { id: "2", name: "John Doe", email: "john@example.com", initials: "JD" },
];

export function AppSidebar({ setSelectedChat, selectedChat, ...props }) {
  const [newChatOpen, setNewChatOpen] = useState(false);
  const { user } = useAuth()
  const { setOpen, isMobile, state } = useSidebar()
  const [activeItem, setActiveItem] = useState(navMain[0] || { title: "Inbox" })
  const [chats, setChats] = useState([])
  const [searchQuery, setSearchQuery] = useState("");

  const isChatSelected = (chatId) => selectedChat?.id === chatId;

  useEffect(() => {
    if (!user?.uid) return
    const unsubscribe = chatServices.listenUserChats(user.uid, (list) => setChats(list))
    return () => unsubscribe()
  }, [user])

  // --- MODAL COMPONENT ---
  const NewChatModal = () => {
    if (!newChatOpen) return null;

    const filteredUsers = mockUsers.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-[380px] rounded-xl border bg-background shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-sm font-semibold">Start New Chat</h3>
            <button onClick={() => {setNewChatOpen(false); setSearchQuery("")}} className="hover:bg-muted p-1 rounded">
              <X size={16} />
            </button>
          </div>
          
          <div className="p-3">
             <div className="relative flex items-center mb-4">
                <Search className="absolute left-3 size-4 text-muted-foreground" />
                <input 
                  className="w-full rounded-md border bg-muted/50 py-2 pl-9 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>

             <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {filteredUsers.map((u) => (
                  <div 
                    key={u.id}
                    onClick={() => {
                      setSelectedChat({ name: u.name, email: u.email, id: u.id });
                      setNewChatOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-primary hover:text-primary-foreground group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary group-hover:bg-white/20 group-hover:text-white">
                      {u.initials}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-sm font-medium leading-none">{u.name}</span>
                      <span className="text-[11px] opacity-70 truncate">{u.email}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  const ChatListContent = () => (
    <>
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-base font-medium">Inbox</div>
          <button
            onClick={() => setNewChatOpen(true)}
            className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <UserPlus size={14} />
            New Chat
          </button>
        </div>
        <SidebarInput placeholder="Search chats..." />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className='py-0 px-0'>
          <SidebarGroupContent>
            {chats.map((chat) => {
              const isSelected = isChatSelected(chat.id);
              return (
                <div
                  key={chat.id}
                  className={`
                    group flex flex-col gap-1 border-b p-4 text-sm cursor-pointer transition-all
                    ${isSelected
                      ? "bg-primary text-primary-foreground shadow-inner" 
                      : "bg-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-black"
                    }
                  `}
                  onClick={async () => {
                    setSelectedChat(chat);
                    await chatServices.markMessagesAsSeen({ chatId: chat.id, currentUid: user.uid });
                    if (isMobile) setOpen(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-medium truncate ${isSelected ? "text-white" : "text-foreground group-hover:text-black"}`}>
                      {chat.name}
                    </span>
                    <span className={`text-[10px] shrink-0 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground group-hover:text-black"}`}>
                      {chat.lastMessageAt}
                    </span>
                  </div>
                  <div className="flex row justify-between items-center">
                    <span className={`line-clamp-1 text-xs ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground group-hover:text-black"}`}>
                      {chat.lastMessage}
                    </span>
                    {chat.unreadCount > 0 && !isSelected && (
                      <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  )

  return (
    <>
      <NewChatModal />
      <Sidebar collapsible="icon" className="overflow-hidden *:data-[sidebar=sidebar]:flex-row" {...props}>
        {/* COLUMN 1 */}
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
                    <SidebarMenuButton isActive={activeItem.title === item.title} onClick={() => { setActiveItem(item); setOpen(true); }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            {isMobile && state === "expanded" && (
              <div className="border-t mt-2"> <ChatListContent /> </div>
            )}
          </SidebarContent>
          <SidebarFooter>
            {isMobile && <NavUser user={user} />}
          </SidebarFooter>
        </Sidebar>

        {/* COLUMN 2 */}
        {!isMobile && (
          <Sidebar collapsible="none" className="flex flex-1">
            <ChatListContent />
            <SidebarFooter className="border-t">
              <NavUser user={user} />
            </SidebarFooter>
          </Sidebar>
        )}
      </Sidebar>
    </>
  )
}

const navMain = [{ title: "Inbox", url: "#", icon: Inbox, isActive: true }]