"use client";

import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import chatServices from "@/services/chat";
import { useAuth } from "@/context/AuthContext";

const NewChatModal = ({
  open,
  onClose,
  currentChats,
  onChatCreated,
}) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open || !user?.uid) return;

    chatServices
      .getUnchattedUsers({
        currentUid: user.uid,
        currentChats,
      })
      .then(setUsers);
  }, [open, user, currentChats]);

  if (!open) return null;

  const filtered = users.filter(
    u =>
      u.displayName?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="w-[380px] rounded-xl bg-background border shadow-xl">
        <header className="flex justify-between p-4 border-b">
          <h3 className="text-sm font-semibold">Start New Chat</h3>
          <button onClick={onClose}><X size={16} /></button>
        </header>

        <div className="p-3">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 py-2 text-sm border rounded-md"
              placeholder="Search users..."
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {filtered.map(targetUser => (
              <div
                key={targetUser.id}
                onClick={async () => {
                  const chat = await chatServices.createChat({
                    currentUid: user.uid,
                    otherUserId: targetUser.id,
                  });

                  onChatCreated(chat, targetUser);
                  onClose();
                }}
                className="p-3 rounded-md cursor-pointer hover:bg-primary hover:text-white"
              >
                <div className="text-sm font-medium">{targetUser.displayName}</div>
                <div className="text-xs opacity-70">{targetUser.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
