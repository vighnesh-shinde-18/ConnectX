"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react" // Added useRef
import chatServices from "@/services/chat"
import { useAuth } from "@/context/AuthContext"
import { NavUser } from "./nav-user.jsx"
import { UserPlus, CheckIcon, Mail, Inbox, Command, X, Search } from "lucide-react";
import { toast } from "sonner" // Import toast (Ensure 'sonner' is installed)
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
import ChatListItem from "../chat/ChatListItem.jsx"
import NewChatModal from "../chat/NewChatModel.jsx"

export function AppSidebar({ setSelectedChat, selectedChat, ...props }) {
  const [newChatOpen, setNewChatOpen] = useState(false);
  const { user } = useAuth()
  const { setOpen, isMobile, state } = useSidebar()
  const [activeItem, setActiveItem] = useState(navMain[0] || { title: "Inbox" })
  const [chats, setChats] = useState([])
  const [searchQuery, setSearchQuery] = useState("");
 
  
  // Ref to track previous unread counts to prevent spamming toasts on reload
  const prevUnreadCounts = useRef({});
  const isFirstLoad = useRef(true);

  const isChatSelected = (chatId) => selectedChat?.id === chatId;

  


  useEffect(() => {
    if (!user?.uid) return
    const unsubscribe = chatServices.listenUserChats(user.uid, (list) => {
      setChats(list);

      // --- NEW FEATURE: Unread Message Notification ---
      list.forEach(chat => {
        const currentUnread = chat.unreadCount || 0; // Ensure your chat object has unreadCount
        const prevUnread = prevUnreadCounts.current[chat.id] || 0;
        const senderName = chat.userInfo?.displayName || "User";

        // Logic: specific check if unread > 0 AND unread count has INCREASED
        // isFirstLoad.current prevents toasts when you first open the app and load existing unread messages
        const isMyMessage = chat.lastMessageSender === user.uid;

        if (
          !isFirstLoad.current &&
          currentUnread > 0 &&
          currentUnread > prevUnread &&
          !isMyMessage
        ) {

 


          toast(`New Message`, {
            description: `${currentUnread} new messages from ${senderName}`,
            action: {
              label: "View",
              onClick: () => setSelectedChat(chat),
            },
          });
        }

        // Update the ref for next comparison
        prevUnreadCounts.current[chat.id] = currentUnread;
      });

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      }
      // -----------------------------------------------
    })
    return () => unsubscribe()
  }, [user, setSelectedChat]) // Added setSelectedChat dependency


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
              const isSelected = selectedChat?.id === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={async () => {
                    setSelectedChat(chat);
                    // Mark as seen when clicked
                    await chatServices.markMessagesAsSeen({
                      chatId: chat.id,
                      currentUid: user.uid
                    });
                    if (isMobile) setOpen(false);
                  }}
                >
                  <ChatListItem
                    chat={chat}
                    isSelected={isSelected}
                  />
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
      <NewChatModal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        currentChats={chats}
        onChatCreated={(chat, user) => {
          setSelectedChat({
            id: chat.id,
            name: user.displayName,
            email: user.email,
            uid: user.uid
          });
        }}
      />
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