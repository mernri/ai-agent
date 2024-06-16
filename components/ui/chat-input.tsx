"use client"
import { AutosizeTextarea } from "@/components/ui/autosize-text-area"
import { Button } from "@/components/ui/button"
import { FormEvent, useState } from "react"

export const ChatInput = () => {
    const [userMessage, setUserMessage] = useState("")

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault()
        console.log("Send message :", userMessage)
        setUserMessage("")
    }

    return (
        <div className="flex w-full relative">
            <AutosizeTextarea
                placeholder="Type your message here..."
                className="w-full relative bg-gray-100"
                maxHeight={200}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
            />

            <Button className="absolute bottom-2 right-2"
                onClick={(e) => handleSendMessage(e)}>
                Send
            </Button>
        </div>
    )
}