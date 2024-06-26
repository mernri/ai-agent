"use client"
import { useState, useEffect } from "react";
import { Chat } from "@/components/layout/Chat";
import { Search } from "@/components/layout/Search";
import { RetrievedFiles } from "@/components/layout/RetrievedFiles";
import { ChatInput } from "@/components/ui/chat-input";
import { MessagesProvider } from "@/context/MessagesProvider";
import { OpenaiProvider } from "@/context/OpenaiProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const HomePage = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>("");
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768); // Adjust this breakpoint as needed
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    return (
        <OpenaiProvider>
            <main className="flex flex-col h-screen p-4 md:p-12 bg-gray-50">
                <div className="flex-none mb-4">
                    <Search onSymbolSelect={setSelectedSymbol} />
                </div>

                <MessagesProvider>
                    <div className="flex-grow overflow-hidden">
                        {!isMobile && selectedSymbol ? (
                            <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
                                <ResizablePanel defaultSize={50} minSize={30}>
                                    <ScrollArea className="h-full pr-4">
                                        <Chat />
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
                                <Chat />
                            </ScrollArea>
                        )}
                    </div>

                    <div className="flex-none mt-4">
                        <ChatInput />
                    </div>
                </MessagesProvider>
            </main>
        </OpenaiProvider>
    );
}

export default HomePage;