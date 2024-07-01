import React, { createContext, useContext, useState, useCallback } from 'react';

type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

type ChatContextType = {
    messages: Message[];
    sendMessage: (content: string, stockData: any) => Promise<void>;
    isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);


// TODO: Embed stock data and add RAG feature instead of sending the stock data in the messages
export const ChatProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = useCallback(async (content: string, stockData: any) => {
        setIsLoading(true);
        const userMessage: Message = { role: 'user', content };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch('/api/mistral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage], stockData }),
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(5).trim();
                        if (data === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                assistantMessage += parsed.content;
                                setMessages(prev => [
                                    ...prev.slice(0, -1),
                                    { role: 'assistant', content: assistantMessage }
                                ]);
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error in Mistral chat:', error);
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: 'Sorry, an error occurred while processing your request.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    return (
        <ChatContext.Provider value={{ messages, sendMessage, isLoading }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
