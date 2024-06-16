import { Chat } from "@/components/layout/Chat"
import { Search } from "@/components/layout/Search"
import { ChatInput } from "@/components/ui/chat-input"
import { MessagesProvider } from "@/context/MessagesProvider"

const HomePage = () => {
    return (
        <main className="flex flex-col p-12 h-full w-auto justify-between">
            <div className="w-full items-center justify-between font-mono text-sm">
                <Search />
            </div>

            <MessagesProvider>
                <div className="w-full items-center justify-between font-mono text-sm">
                    <Chat />
                </div>

                <div className="w-full items-center justify-between font-mono text-sm absolute bottom-4 left-1 px-4">
                    <ChatInput />
                </div>
            </MessagesProvider>

        </main>
    )
}

export default HomePage