"use client"
import { createContext, useState, useContext } from 'react'

// Step 1 : Create the context 
const MessagesContext = createContext({})

// Step 2 : Create the context wrapper (the provider)
interface MessageType {
    content: string,
    role: string,
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<MessageType[]>([])

    return (
        <MessagesContext.Provider value={{ messages, setMessages }}>
            {children}
        </MessagesContext.Provider>
    )
}

// Step 3 : Create the custom hook I can use to access the context
export function useMessages() {
    return useContext(MessagesContext)
}