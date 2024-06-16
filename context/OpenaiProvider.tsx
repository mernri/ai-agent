
import { createContext, useContext, useState, ReactNode } from 'react';

interface OpenaiContextType {
    threadId: string;
    setThreadId: React.Dispatch<React.SetStateAction<string>>;
}

const OpenaiContext = createContext<OpenaiContextType>({
    threadId: '',
    setThreadId: () => { },
});

export function OpenaiProvider({ children }: { children: ReactNode }) {
    const [threadId, setThreadId] = useState('');

    return (
        <OpenaiContext.Provider value={{ threadId, setThreadId }}>
            {children}
        </OpenaiContext.Provider>
    );
}

export function useOpenaiContext() {
    return useContext(OpenaiContext);
}
