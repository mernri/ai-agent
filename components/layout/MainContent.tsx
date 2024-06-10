"use client"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"


export const MainContent = () => {
    return (
        <div>
            {/* <ResizablePanelGroup
                direction="horizontal"
                className="min-h-[200px] max-w-md rounded-lg border"
            >
                <ResizablePanel defaultSize={25}>
                    <div className="flex h-full items-center justify-center p-6">
                        <span className="font-semibold">builder</span>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75}>
                    <div className="flex h-full items-center justify-center p-6">
                        <span className="font-semibold">result</span>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup> */}
        </div>
    )
}