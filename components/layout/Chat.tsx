"use client"
import * as React from "react";
import { useMessagesContext } from "@/context/MessagesProvider";

export const Chat = () => {
    const { messages } = useMessagesContext();
    const endOfMessagesRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="flex flex-col w-full justify-between h-full px-2">
            <div className="flex flex-col gap-4 overflow-auto">
                {messages.map((message, index) => (
                    <div key={index} className="flex flex-row justify-end w-full">
                        <div className="rounded-lg text-right bg-gray-100 p-4 text-xs">
                            {message.content}
                        </div>
                    </div>
                ))}
                {/* Élément invisible à la fin de la liste pour servir de cible au scroll */}
                <div ref={endOfMessagesRef} />
            </div>
        </div>
    );
};

export default Chat;
