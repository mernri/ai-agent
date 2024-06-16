"use client"
import { useMessagesContext } from "@/context/MessagesProvider"

export const Chat = () => {
    const { messages } = useMessagesContext();

    return (
        <div className="flex flex-col w-full justify-between h-full px-2">
            <div className=" flex flex-col gap-2">
                {messages.map((message: any) => {
                    if (message.role === "user") {
                        return (
                            <div key={message.id} className="flex flex-row justify-end w-full">
                                <div className="rounded-lg text-right bg-gray-100 p-4 text-xs">
                                    {message.content}
                                </div>
                            </div>
                        )
                    }
                    else {
                        return (
                            <div key={message.id} className="flex flex-row items-center">
                                <div className="text-xs">
                                    {message.content}
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
        </div>
    )
}