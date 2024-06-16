import { MainContent } from "@/components/layout/MainContent"
import { Search } from "@/components/layout/Search"
import { ChatInput } from "@/components/ui/chat-input"

const HomePage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <Search />
            </div>

            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <MainContent />
            </div>

            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <ChatInput />
            </div>
        </main>
    )
}

export default HomePage