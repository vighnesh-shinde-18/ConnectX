"use client";

import { AppSidebar } from "@/components/app-sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { useEffect, useState } from "react";
// Ensure you have this import for the hook used below
import { useAuth } from "@/context/AuthContext"; 
import { listenUserStatus, listenTyping } from "../lib/firebasePresence.js"

export default function Layout({ children, selectedChat, setSelectedChat }) {
  const [status, setStatus] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Get the target user ID safely
    const targetUid = selectedChat?.otherUserId;

    // 2. Fix: Check for targetUid, not 'uid' (which might not exist on the chat object)
    if (!selectedChat?.id || !targetUid) {
      setStatus(null); 
      setIsTyping(false);
      return;
    }

    console.log("Header Listener watching UID:", targetUid);

    // 3. Listen to Status (Online/Offline)
    const unsubscribeStatus = listenUserStatus(targetUid, (data) => {
      setStatus(data);
    });

    // 4. Listen to Typing Status
    const unsubscribeTyping = listenTyping(
      selectedChat.id,
      targetUid,
      setIsTyping
    );

    return () => { 
      unsubscribeStatus(); 
      unsubscribeTyping(); 
    };
  }, [selectedChat?.id, selectedChat?.otherUserId]); // ✅ Dependency fixed

  const isOnline = status?.isOnline;

  // Format the last seen time
  const lastSeenTime = status?.lastSeen
    ? new Date(status.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <SidebarProvider style={{ "--sidebar-width": "350px" }}>
      <AppSidebar setSelectedChat={setSelectedChat} selectedChat={selectedChat} />

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />

          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold">
              {selectedChat?.name || "Select a chat"}
            </span>

            {/* STATUS LOGIC */}
            {selectedChat?.otherUserId && (
              <span className="text-xs flex items-center gap-1.5 h-4">
                
                {/* PRIORITY 1: TYPING */}
                {isTyping ? (
                  <span className="text-green-600 font-medium animate-pulse transition-all">
                    Typing...
                  </span>
                ) : isOnline ? (
                  /* PRIORITY 2: ONLINE */
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-600 font-medium">Online</span>
                  </>
                ) : (
                  /* PRIORITY 3: LAST SEEN */
                  <span className="text-muted-foreground transition-opacity duration-300">
                    {lastSeenTime ? `Last seen: ${lastSeenTime}` : "Offline"}
                  </span>
                )}
                
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}