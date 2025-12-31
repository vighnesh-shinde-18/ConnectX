"use client"

import * as React from "react"
import { useEffect, useState } from "react"
// ✅ Import listenTyping
import { listenUserStatus, listenTyping } from "@/lib/firebasePresence"

export default function ChatListItem({ chat, isSelected }) {
  // 1. Destructure
  const { id: chatId, otherUserId, name, lastMessage, lastMessageAt, unreadCount } = chat;
  const [status, setStatus] = useState(null);
  const [isTyping, setIsTyping] = useState(false); // ✅ New State

  // 2. Listen for Online Status
  useEffect(() => {
    if (!otherUserId) return;
    if (!chatId || !otherUserId) return;

    const unsubscribeStatus = listenUserStatus(otherUserId, (data) => {
      setStatus(data);
    });

    const unsubscribeTyping = listenTyping(chatId, otherUserId, setIsTyping);

    return () => { unsubscribeStatus(); unsubscribeTyping() };
  }, [chatId, otherUserId]);

  const isOnline = status?.isOnline;

  // Formatting logic
  const formatFullTimestamp = (timestamp) => {
    if (!timestamp) return { time: "", date: "" };
    const dateObj = new Date(timestamp);
    const time = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
    return { time, date };
  };

  const { time, date } = formatFullTimestamp(lastMessageAt);

  return (
    <div className={`group flex flex-col gap-1 border-b p-4 text-sm cursor-pointer transition-all ${isSelected ? "bg-primary text-primary-foreground shadow-inner" : "bg-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-black"
      }`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Status Indicator Dot */}
          <span className={`h-2.5 w-2.5 rounded-full shrink-0 transition-colors ${
            // ✅ If typing, show Green. If Online, show Green. Else Grey.
            (isTyping || isOnline) ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-slate-400"
            } ${isOnline ? "animate-pulse" : ""} `} />

          <span className={`font-semibold truncate ${isSelected ? "text-white" : "text-foreground group-hover:text-black"}`}>
            {name}
          </span>
        </div>

        <div className="flex flex-col items-end shrink-0 ml-2 leading-none gap-1">
          <span className={`text-[10px] font-bold ${isSelected ? "text-white" : "text-foreground group-hover:text-black"}`}>{time}</span>
          <span className={`text-[9px] font-medium ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground group-hover:text-black"}`}>{date}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-1">
        <span className={`line-clamp-1 text-xs flex-1 ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground group-hover:text-black"}`}>

          {/* ✅ PRIORITY: Show "Typing..." in green if true, otherwise show Last Message */}
          {lastMessage || "No messages yet"}

        </span>

        {unreadCount > 0 && !isSelected && (
          <span className="ml-2 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className={`text-[9px] font-bold uppercase tracking-wider ${
          // ✅ Highlight text if Online OR Typing
          (isOnline || isTyping) ? "text-green-600" : "text-slate-400"
          }`}>
          {/* ✅ Logic: Typing > Online > Offline */}
          {isTyping ? "Typing..." : (isOnline ? "● Online" : "Offline")}
        </span>
      </div>
    </div>
  );
}