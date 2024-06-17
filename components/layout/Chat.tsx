"use client"
import * as React from "react";
import { useMessagesContext } from "@/context/MessagesProvider";

export const Chat = () => {
    const { messages } = useMessagesContext();
    const endOfMessagesRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView();
        }

    }, [messages]);

    return (
        <div className="flex flex-col w-full justify-between h-full px-2">
            <div className="flex flex-col overflow-auto">
                {messages.map((message, index) => {
                    if (message.role === 'assistant') {
                        return (
                            <div key={index} className="flex flex-row justify-start w-full">
                                <div className="text-justify py-4 text-base">
                                    {message.content}
                                </div>
                            </div>
                        )
                    }
                    else {
                        return (
                            <div key={index} className="flex flex-row justify-end w-full">
                                <div className="rounded-lg text-right bg-gray-100 p-4 text-base	">
                                    {message.content}
                                </div>
                            </div>
                        )
                    }

                })}
                {/* invisible element : scroll target ref */}
                <div ref={endOfMessagesRef} className="pb-6" />
            </div>
        </div>
    );
};

export default Chat;
