"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation.jsx";

import {
  Message,
  MessageContent,
} from "@/components/ai-elements/message";

import { MessageSquareIcon, CheckCheck, CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";

import chatServices from "@/services/chat";
import { useAuth } from "@/context/AuthContext";

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], {
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
      <ConversationContent className="flex flex-col gap-4 p-4">
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
                className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
              >
                <Message
                  from={isMine ? "user" : "assistant"}
                  className="max-w-[80%] sm:max-w-[70%]"
                >
                  
                  {/* MEDIA CONTENT */}
                  <div className={`flex flex-col gap-2 ${isMine ? "items-end" : "items-start"}`}>
                    {msg.attachments?.map((file, idx) => {
                      
                      // FIX: Guard clause. 
                      // If the file object is empty or doesn't have a URL, render nothing.
                      if (!file || !file.url) return null;

                      if (file.type === "image") {
                        return (
                          <img
                            key={idx}
                            src={file.url}
                            alt="Shared image"
                            className="rounded-lg min-w-sm max-h-52 object-cover border shadow-sm"
                          />
                        );
                      }
                      
                      if (file.type === "video") {
                        return (
                          <video
                            key={idx}
                            src={file.url}
                            controls
                            className="rounded-lg border max-w-sm h-auto shadow-sm"
                          />
                        );
                      }
                      
                      // Fallback: If it has a URL but isn't Image/Video, treat as File/Link
                      return (
                        <div 
                          key={idx}
                          className={`p-2 w-fit min-w-[120px] rounded-md border ${
                            isMine
                              ? "bg-primary-foreground/10 self-end"
                              : "bg-muted self-start"
                          }`}
                        >
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-500 text-sm no-underline"
                          >
                            <span className="shrink-0">📎</span>
                            <span className="truncate">{file.name || "Open file"}</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>

                  {/* TEXT CONTENT */}
                  {msg.text && (
                    <MessageContent>
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {msg.text}
                      </p>
                    </MessageContent>
                  )}

                  {/* METADATA */}
                  <div
                    className={`mt-1 flex items-center gap-1 text-[10px] opacity-70 ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span>{time}</span>
                    {isMine && (
                      isSeen ? (
                        <CheckCheck className="h-3 w-3 text-blue-500" />
                      ) : (
                        <CheckIcon className="h-3 w-3" />
                      )
                    )}
                  </div>
                </Message>
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