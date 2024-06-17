"use client"
import { createContext, useState, useContext } from 'react';
import { makeId } from '@/utils/index';

interface Message {
    content: string,
    role: 'user' | 'assistant',
    id: string
}

interface MessagesContextType {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    addUserMessage: (content: string) => void;
    addAssistantMessage: (content: string) => void;
    streamAssistantMessage: (stream: ReadableStream<Uint8Array>) => Promise<void>;
}

// Step 1 : Create the context 
const MessagesContext = createContext<MessagesContextType>({
    messages: [],
    setMessages: () => { },
    addUserMessage: () => { },
    addAssistantMessage: () => { },
    streamAssistantMessage: async () => { }
});

// Step 2 : Create the context wrapper (the provider)
export function MessagesProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);

    const addUserMessage = (content: string) => {
        const newMessage: Message = {
            content: content,
            role: "user",
            id: makeId("usr")
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const addAssistantMessage = (content: string) => {
        const newMessage: Message = {
            content: content,
            role: "assistant",
            id: makeId("asst")
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const streamAssistantMessage = async (stream: ReadableStream<Uint8Array>) => {
        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");
        let completeMessage = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            completeMessage += chunk;
            setMessages(prevMessages => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                    return [...prevMessages.slice(0, -1), { ...lastMessage, content: completeMessage }];
                } else {
                    return [...prevMessages, { content: completeMessage, role: 'assistant', id: makeId("asst") }];
                }
            });
        }
    };

    return (
        <MessagesContext.Provider value={{
            messages,
            setMessages,
            addUserMessage,
            addAssistantMessage,
            streamAssistantMessage
        }}>
            {children}
        </MessagesContext.Provider>
    );
}

// Step 3 : Create the custom hook I can use to access the context (the consumer)
export function useMessagesContext() {
    return useContext(MessagesContext);
}
