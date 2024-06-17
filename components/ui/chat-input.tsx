"use client"
import { AutosizeTextarea } from "@/components/ui/autosize-text-area"
import { Button } from "@/components/ui/button"
import { FormEvent, useState } from "react"
import { PaperAirplaneIcon } from "@heroicons/react/20/solid"
import { useMessagesContext } from "@/context/MessagesProvider"
import { addMessageToThread, listThreadMessages, runThread, runAndStream } from "@/utils/api-helpers/openai"
import { useOpenaiContext } from "@/context/OpenaiProvider";

export const ChatInput = () => {
    const [inputValue, setInputValue] = useState("")
    const { addUserMessage, streamAssistantMessage } = useMessagesContext();
    const { threadId } = useOpenaiContext();


    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault()
        if (inputValue.trim() === "") return

        // Add the user message to the context
        addUserMessage(inputValue)
        setInputValue("")

        // Add the user message to the thread
        addMessageToThread({
            threadId,
            content: inputValue,
            role: 'user'
        })

        const threadMessages = await listThreadMessages(threadId)

        const stream = await runAndStream({
            threadId: threadId,
            assistant_id: "asst_kzpY41zzrEYrEL0NU4OCJLZn",
        });

        if (stream) {
            await streamAssistantMessage(stream);
        }

    }

    return (
        <div className="flex w-full relative">
            <AutosizeTextarea
                placeholder="Type your message here..."
                className="w-full relative bg-gray-100"
                maxHeight={200}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault(); // Prevents adding a new line in the textarea
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