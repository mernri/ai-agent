"use client"
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Messages } from "@/components/Messages";
import { SearchBar } from "@/components/SearchBar";
import { RetrievedFiles } from "@/components/RetrievedFiles";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatProvider } from "@/context/ChatProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import useIsMobile from "@/hooks/useIsMobile";

const HomePage = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>("");
    const isMobile = useIsMobile();

    const StockSearchView = () => (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold mb-6">Investment memo Generator</h1>
            <p className="text-xl mb-8 text-center">
                Select a stock symbol to start analyzing and discussing financial data.
            </p>
            <div className="w-full max-w-md">
                <SearchBar onSymbolSelect={setSelectedSymbol} />
            </div>
        </div>
    );

    const StockAnalysisView = () => (
        <ChatProvider selectedSymbol={selectedSymbol}>
            <div className="flex flex-col h-full">
                <div className="flex-none mb-4 flex items-center">
                    <Button
                        onClick={() => setSelectedSymbol("")}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft size={20} />
                        <span>Return to Search</span>
                    </Button>
                    <h2 className="text-2xl font-bold mx-auto">{selectedSymbol}</h2>
                </div>
                <div className="flex-grow overflow-hidden">
                    {!isMobile ? (
                        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
                            <ResizablePanel defaultSize={50} minSize={30}>
                                <ScrollArea className="h-full pr-4">
                                    <Messages />
                                </ScrollArea>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={50} minSize={30}>
                                <ScrollArea className="h-full pr-4">
                                    <RetrievedFiles symbol={selectedSymbol} />
                                </ScrollArea>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <Messages />
                            <RetrievedFiles symbol={selectedSymbol} />
                        </ScrollArea>
                    )}
                </div>
                <div className="flex-none mt-4">
                    <ChatInput />
                </div>
            </div>
        </ChatProvider>
    );

    return (
        <main className="flex flex-col h-screen p-4 md:p-12 bg-gray-50">
            {!selectedSymbol ? <StockSearchView /> : <StockAnalysisView />}
        </main>
    );
}

export default HomePage;