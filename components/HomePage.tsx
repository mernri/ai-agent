"use client"
import { useState } from "react";
import SearchView from "@/components/SearchView";
import ChatView from "@/components/ChatView";
import { ChatProvider } from "@/context/ChatProvider";

const HomePage: React.FC = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>("");

    return (
        <main className="flex flex-col h-screen p-4 md:p-12 bg-gray-50">
            {!selectedSymbol ? (
                <SearchView onSymbolSelect={setSelectedSymbol} />
            ) : (
                <ChatProvider>
                    <ChatView selectedSymbol={selectedSymbol} onReturn={() => setSelectedSymbol("")} />
                </ChatProvider>
            )}
        </main>
    );
};

export default HomePage;
