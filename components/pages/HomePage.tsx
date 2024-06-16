"use client"
import { Chat } from "@/components/layout/Chat";
import { Search } from "@/components/layout/Search";
import { ChatInput } from "@/components/ui/chat-input";
import { MessagesProvider } from "@/context/MessagesProvider";
import { ScrollArea } from "@/components/ui/scroll-area";

const HomePage = () => {
    return (
        <main className="flex flex-col h-screen p-12 px-4">
            <div className="flex-none">
                <Search />
            </div>

            <MessagesProvider>
                <div className="flex flex-col flex-grow overflow-hidden">
                    <ScrollArea className="flex-auto overflow-auto mb-8 mr-4" withScrollDownButton>
                        <Chat />
                    </ScrollArea>

                    <div className="flex-none absolute bottom-4 left-1 px-4 w-full">
                        <ChatInput />
                    </div>
                </div>
            </MessagesProvider>
        </main>
    );
}

export default HomePage;
