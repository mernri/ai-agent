import { useAggregatedStockData } from "@/hooks/useStockData";
import { useChatContext } from "@/context/ChatProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ChatInterface } from "@/components/ChatInterface";
import { StockFiles } from "@/components/StockFiles";
import { ChatInput } from "@/components/ui/chat-input";
import useIsMobile from "@/hooks/useIsMobile";

type ChatViewProps = {
    selectedSymbol: string;
    onReturn: () => void;
};

const ChatView: React.FC<ChatViewProps> = ({ selectedSymbol, onReturn }) => {
    const { data: stockData, isLoading: isLoadingStock, isError } = useAggregatedStockData(selectedSymbol);
    const { sendMessage, isLoading: isChatLoading } = useChatContext();
    const isMobile = useIsMobile();

    if (isError) return <div>Error loading stock data</div>;

    const handleSendMessage = (message: string) => {
        if (stockData) {
            sendMessage(message, stockData);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-none mb-4 flex items-center">
                <Button onClick={onReturn} className="flex items-center space-x-2">
                    <ArrowLeft size={20} />
                    <span>Return to Search</span>
                </Button>
                <h2 className="text-2xl font-bold mx-auto">{selectedSymbol}</h2>
            </div>
            <div className="flex-grow overflow-hidden">
                {!isMobile ? (
                    <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
                        <ResizablePanel defaultSize={60} minSize={30}>
                            <ScrollArea className="h-full pr-4">
                                <ChatInterface />
                            </ScrollArea>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        <ResizablePanel minSize={20}>
                            <ScrollArea className="h-full pr-4">
                                <StockFiles symbol={selectedSymbol} />
                            </ScrollArea>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                ) : (
                    <ScrollArea className="h-full pr-4">
                        <StockFiles symbol={selectedSymbol} />
                        <ChatInterface />
                    </ScrollArea>
                )}
            </div>
            <div className="flex-none mt-4">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoadingStock || isChatLoading} />
            </div>
        </div>
    );
};

export default ChatView;
