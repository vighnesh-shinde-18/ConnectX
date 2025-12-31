"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import chatServices from "../services/chat.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputButton,
  PromptInputHeader,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionAddAttachments,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputActionMenu
} from "@/components/ai-elements/prompt-input.jsx";

import { setTyping } from "@/lib/firebasePresence.js";

const InputMessage = ({ selectedChat }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async ({ text: messageText, files = [] }) => {
    if (!selectedChat?.id) return;
    if (!messageText?.trim() && files.length === 0) return;

    let toastId;
    try {
      setIsSending(true);

      // 🔔 Show "uploading…" toast if files exist
      if (files.length > 0) {
        toastId = toast.loading("Uploading file(s)…");
      } else {
        toastId = toast.loading("Sending message…");
      }

      await chatServices.sendMessage({
        chatId: selectedChat.id,
        senderId: user.uid,
        text: messageText,
        files
      });

      // stop typing indicator
      setTyping(selectedChat.id, user.uid, false);

      // 🟢 success toast
      toast.success(files.length > 0 ? "File sent 🎉" : "Message sent", {
        id: toastId
      });

      setText("");
    } catch (error) {
      console.error("[MessageInput] Send failed:", error);
      toast.error("Failed to send message ❌", { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (!selectedChat?.id) return;
    setTyping(selectedChat.id, user.uid, true);

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setTyping(selectedChat.id, user.uid, false);
    }, 1200);
  };

  return (
    <div className="w-full p-4">
      <PromptInput
        onSubmit={handleSubmit}
        multiple
        className="border rounded-xl bg-background shadow-sm"
      >
        <PromptInputBody>
          <PromptInputTextarea
            placeholder="Type a message..."
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping(); }}
            disabled={!selectedChat}
            className="resize-none overflow-y-auto"
          />
        </PromptInputBody>

        <PromptInputFooter className="flex justify-end">
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>

          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>

          <PromptInputButton
            type="submit"
            disabled={isSending}
            className="flex items-center gap-2"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Send</span>
          </PromptInputButton>
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
};

export default InputMessage;
