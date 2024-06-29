"use client"
import * as React from "react";
import { useChatContext } from "@/context/ChatProvider";
import he from 'he';

export const Messages = () => {
    const { messages } = useChatContext();
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
                                <div className="text-justify py-3 text-sm">
                                    <pre className="whitespace-pre-wrap text-justify">{he.decode(message.content)}</pre>
                                </div>
                            </div>
                        )
                    }
                    else {
                        return (
                            <div key={index} className="flex flex-row justify-end w-full py-1">
                                <div className="rounded-lg text-right bg-gray-100 p-4 text-sm">
                                    {message.content}
                                </div>
                            </div>
                        )
                    }

                })}
                <div ref={endOfMessagesRef} className="pb-6" />
            </div>

        </div>
    );
};

export default Messages;
