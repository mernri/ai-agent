"use client"
import { AutosizeTextarea } from "@/components/ui/autosize-text-area"
import { Button } from "@/components/ui/button"
import { FormEvent, useState } from "react"
import { PaperAirplaneIcon } from "@heroicons/react/20/solid"
import { useMessagesContext } from "@/context/MessagesProvider"

export const ChatInput = () => {
    const [inputValue, setInputValue] = useState("")
    const { addUserMessage, addAssistantMessage } = useMessagesContext();


    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault()
        if (inputValue.trim() === "") return

        // Add the user message to the context
        addUserMessage(inputValue)
        setInputValue("")

        // Generate Assistant response
        // const assistantResponse = generateAssistantResponse(inputValue)

        // Add the assistant response to the context
        // addAssistantMessage(assistantResponse)
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