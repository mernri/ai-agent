"use client"
import { createContext, useState, useContext } from 'react';
import { makeId } from '@/utils/index';
import { addMessageToThread, createThread, runAndStream } from "@/utils/api-helpers/openai"

interface Message {
    content: string,
    role: 'user' | 'assistant',
    id: string
}

interface ChatContextType {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    addUserMessage: (content: string) => void;
    addAssistantMessage: (content: string) => void;
    streamAssistantMessage: (stream: ReadableStream<Uint8Array>) => Promise<void>;
}

// Step 1 : Create the context 
const ChatContext = createContext<ChatContextType>({
    messages: [],
    setMessages: () => { },
    addUserMessage: () => { },
    addAssistantMessage: () => { },
    streamAssistantMessage: async () => { }
});

// Step 2 : Create the context wrapper (the provider)
export function ChatProvider({ children, selectedSymbol }: { children: React.ReactNode, selectedSymbol: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [threadId, setThreadId] = useState<string>('');

    const assistant_id = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID;

    const addUserMessage = async (content: string) => {
        // ADD A NEW USER MESSAGE TO THE UI (state)
        const newMessage: Message = {
            content: content,
            role: "user",
            id: makeId("usr")
        };

        setMessages(prevMessages => [...prevMessages, newMessage]);

        // CREATE A NEW THREAD IF THERE ISN'T ONE
        let currentThreadId = threadId;
        if (!currentThreadId) {
            const thread = await createThread({});
            if (thread !== null) {
                setThreadId(thread.id);
                currentThreadId = thread.id;
            }
        }

        if (currentThreadId && assistant_id) {
            // ADD THE USER MESSAGE TO THE OPENAI THREAD
            await addMessageToThread({
                threadId: currentThreadId,
                content: content,
                role: 'user'
            });


            // STREAM THE ASSISTANT RESPONSE
            const stream = await runAndStream({
                threadId: currentThreadId,
                assistant_id: assistant_id,
            });

            if (stream) {
                await streamAssistantMessage(stream);
            }
        } else {
            console.error("\n Failed to create a new thread.");
        }
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
        <ChatContext.Provider value={{
            messages,
            setMessages,
            addUserMessage,
            addAssistantMessage,
            streamAssistantMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
}

// Step 3 : Create the custom hook I can use to access the context (the consumer)
export function useChatContext() {
    return useContext(ChatContext);
}
