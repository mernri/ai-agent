"use client"
import { createContext, useState, useContext } from 'react'


interface Message {
    content: string,
    role: 'user' | 'assistant',
}

interface MessagesContextType {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    addUserMessage: (content: string) => void;
}

// Step 1 : Create the context 
const MessagesContext = createContext<MessagesContextType>({
    messages: [],
    setMessages: () => { },
    addUserMessage: () => { }
});


// Step 2 : Create the context wrapper (the provider)
export function MessagesProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            content: "Hello! How can I help you today?",
            role: "assistant"
        }, { content: "I need help with my order", role: "user" }
    ])

    const addUserMessage = (content: string) => {
        const newMessage: Message = {
            content: content,
            role: "user"
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const addAssistantMessage = (content: string) => {
        const newMessage: Message = {
            content: content,
            role: "assistant"
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    return (
        <MessagesContext.Provider value={{ messages, setMessages, addUserMessage }}>
            {children}
        </MessagesContext.Provider>
    )
}

// Step 3 : Create the custom hook I can use to access the context (the consumer)
export function useMessagesContext() {
    return useContext(MessagesContext)
}