"use client";

import React, { useRef, useState } from 'react';
import { Send } from 'lucide-react';
// Removed useChat import
import {
    PromptInput,
    PromptInputActionAddAttachments,
    PromptInputActionMenu,
    PromptInputActionMenuContent,
    PromptInputActionMenuTrigger,
    PromptInputAttachment,
    PromptInputAttachments,
    PromptInputBody,
    PromptInputButton,
    PromptInputSelect,
    PromptInputSelectContent,
    PromptInputSelectItem,
    PromptInputSelectTrigger,
    PromptInputSelectValue,
    PromptInputSpeechButton,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputTools,
} from '@/components/ai-elements/prompt-input';

const models = [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus' },
];

const MessageInput = () => {
    const [text, setText] = useState('');
    const [model, setModel] = useState(models[0].id);
    const [useWebSearch, setUseWebSearch] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Manually handle loading state
    const textareaRef = useRef(null);

    const handleSubmit = async (message) => {
        const hasText = Boolean(message.text?.trim());
        const hasAttachments = Boolean(message.files?.length);

        if (!(hasText || hasAttachments)) return;

        try {
            setIsLoading(true);

            // --- YOUR CUSTOM LOGIC HERE ---
            // Example: await chatServices.sendMessage(userId, message.text, message.files);
            console.log("Sending to your backend:", {
                content: message.text,
                files: message.files,
                settings: { model, useWebSearch }
            });

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setText(''); // Clear input
        } catch (error) {
            console.error("Failed to send:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full p-4">
            <PromptInput
                onSubmit={handleSubmit}
                className="border rounded-xl bg-background shadow-sm"
                globalDrop
                multiple
            >
                <PromptInputAttachments>
                    {(attachment) => (
                        <PromptInputAttachment key={attachment.id} data={attachment} />
                    )}
                </PromptInputAttachments>
                <PromptInputBody>
                    <PromptInputTextarea
                        placeholder="Type a message..."
                        onChange={(e) => setText(e.target.value)}
                        ref={textareaRef}
                        value={text}
                        className=" resize-none"
                    />
                </PromptInputBody>

                <PromptInputFooter>
                    <PromptInputTools>
                        <PromptInputActionMenu>
                            <PromptInputActionMenuTrigger />
                            <PromptInputActionMenuContent>
                                <PromptInputActionAddAttachments />
                            </PromptInputActionMenuContent>
                        </PromptInputActionMenu>
                        <PromptInputSpeechButton
                            onTranscriptionChange={setText}
                            textareaRef={textareaRef} />
                    </PromptInputTools>
                    <PromptInputButton
                        onClick={() => setUseWebSearch(!useWebSearch)}
                        variant={useWebSearch ? 'default' : 'ghost'}
                        className="flex items-center gap-2"
                    >
                        <Send size={16} />
                        <span className="  sm:inline">Send</span>
                    </PromptInputButton>
                </PromptInputFooter>
            </PromptInput>
        </div>
    );
};

export default MessageInput;