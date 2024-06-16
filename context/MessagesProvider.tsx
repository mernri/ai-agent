"use client"
import { createContext, useState, useContext } from 'react'


interface MessageType {
    content: string,
    role: string, // user or assistant
}

type MessagesType = MessageType[]

interface MessagesContextType {
    messages: MessagesType;
    setMessages: React.Dispatch<React.SetStateAction<MessagesType>>;
}

// Step 1 : Create the context 
const MessagesContext = createContext<MessagesContextType>({
    messages: [],
    setMessages: () => { }
});


// Step 2 : Create the context wrapper (the provider)
export function MessagesProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<MessageType[]>([])

    return (
        <MessagesContext.Provider value={{ messages, setMessages }}>
            {children}
        </MessagesContext.Provider>
    )
}

// Step 3 : Create the custom hook I can use to access the context (the consumer)
export function useMessagesContext() {
    return useContext(MessagesContext)
}