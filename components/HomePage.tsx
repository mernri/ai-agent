"use client"
import { useState } from "react";
import SearchView from "@/components/SearchView";
import ChatView from "@/components/ChatView";
import { ChatProvider } from "@/context/ChatProvider";
import { AppProvider } from "@/context/AppProvider";

const HomePage: React.FC = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>("");

    return (
        <AppProvider>

            <main className="flex flex-col h-screen p-4 md:p-12 bg-gray-50">
                {!selectedSymbol ? (
                    <SearchView onSymbolSelect={setSelectedSymbol} />
                ) : (
                    <ChatProvider>
                        <ChatView selectedSymbol={selectedSymbol} onReturn={() => setSelectedSymbol("")} />
                    </ChatProvider>
                )}
            </main>
        </AppProvider>

    );
};

export default HomePage;
