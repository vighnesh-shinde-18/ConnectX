"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation.jsx";

 
import { MessageSquareIcon, CheckCheck, CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";

import chatServices from "@/services/chat";
import { useAuth } from "@/context/AuthContext";

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ConversationPage = ({ selectedChat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([]);
    if (!selectedChat?.id) return;

    const unsubscribe = chatServices.listenChatMessages(
      selectedChat.id,
      setMessages
    );

    return () => unsubscribe();
  }, [selectedChat]);

  return (
    <Conversation className="h-full overflow-hidden bg-muted/30">
      <ConversationContent>
        {messages.length === 0 ? (
          <ConversationEmptyState
            title="Start a conversation"
            description={
              selectedChat
                ? "No messages yet"
                : "Select a chat to start messaging"
            }
            icon={<MessageSquareIcon className="size-6" />}
          />
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user.uid;
            const time = formatTime(msg.createdAt);
            const isSeen = isMine && msg.seen;

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[75%]">
                  {/* MESSAGE BUBBLE */}
                  <div
                    className={`rounded-2xl px-4 py-2 shadow-sm ${
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-background border rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {msg.text}
                    </p>
                  </div> 
                  <div
                    className={`mt-1 flex items-center gap-1 text-[11px] text-muted-foreground ${
                      isMine ? "justify-end pr-1" : "justify-start pl-1"
                    }`}
                  >
                    <span>{time}</span>
                    {isMine && ( isSeen?(
                      <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                    ):(<CheckIcon className="h-3.5 w-3.5 text-blue-500" />))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </ConversationContent>

      <ConversationScrollButton />
    </Conversation>
  );
};

export default ConversationPage;
