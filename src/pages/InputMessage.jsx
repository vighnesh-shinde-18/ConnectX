"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import chatServices from "../services/chat.js";
import { useAuth } from "../context/AuthContext.jsx";

import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input.jsx";

const InputMessage = ({ selectedChat }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async ({ text: messageText }) => {
    if (!messageText?.trim()) return;
    if (!selectedChat?.id) return;

    try {
      setIsSending(true);

      await chatServices.sendMessage({
        chatId: selectedChat.id,
        senderId: user.uid,
        text: messageText,
      });

      setText("");
    } catch (error) {
      console.error("[MessageInput] Send failed:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full p-4">
      <PromptInput
        onSubmit={handleSubmit}
        className="border rounded-xl bg-background shadow-sm"
      >
        <PromptInputBody>
          <PromptInputTextarea
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!selectedChat}
            className="resize-none overflow-y-auto"
          />
        </PromptInputBody>

        <PromptInputFooter className="flex justify-end">
          <PromptInputButton
            type="submit"
            disabled={isSending || !text.trim()}
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
