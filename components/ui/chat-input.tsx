"use client"
import { AutosizeTextarea } from "@/components/ui/autosize-text-area"
import { Button } from "@/components/ui/button"
import { FormEvent, useState } from "react"
import { PaperAirplaneIcon } from "@heroicons/react/20/solid"
import { useChatContext } from "@/context/ChatProvider"

type ChatInputProps = {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [inputMessage, setInputMessage] = useState("")
    const { isLoading: isChatLoading } = useChatContext()

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault()
        if (inputMessage.trim() && !isLoading && !isChatLoading) {
            onSendMessage(inputMessage)
            setInputMessage('')
        }
    }

    return (
        <div className="flex w-full relative">
            <AutosizeTextarea
                placeholder="Type your message here..."
                className="w-full relative bg-gray-100"
                maxHeight={200}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                }}
            />

            <Button className="absolute bottom-2 right-2"
                onClick={(e) => handleSendMessage(e)}
            >
                <span className="hidden lg:inline mr-2">Send</span>
                <PaperAirplaneIcon className="w-5 h-5" />
            </Button>
        </div>
    )
}