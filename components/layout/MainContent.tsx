import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { FormEvent, useState } from "react"


export const MainContent = () => {
    const messages = {
        "object": "list",
        "data": [
            {
                "id": "msg_abc123",
                "object": "thread.message",
                "created_at": 1699016383,
                "assistant_id": null,
                "thread_id": "thread_abc123",
                "run_id": null,
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": {
                            "value": "How does AI work? Explain it in simple terms.",
                            "annotations": []
                        }
                    }
                ],
                "attachments": [],
                "metadata": {}
            },
            {
                "id": "msg_abc456",
                "object": "thread.message",
                "created_at": 1699016383,
                "assistant_id": null,
                "thread_id": "thread_abc123",
                "run_id": null,
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": {
                            "value": "AI in simple terms",
                            "annotations": []
                        }
                    }
                ],
                "attachments": [],
                "metadata": {}
            }
        ],
        "first_id": "msg_abc123",
        "last_id": "msg_abc456",
        "has_more": false
    }

    return (
        <div className="w-full bg-red-100">
            {messages.data.map((message: any) => {
                if (message.role === "user") {
                    return (
                        <div key={message.id} className="flex flex-row items-center justify-end">
                            <div className="rounded-lg">
                                {message.content[0].text.value}
                            </div>
                        </div>
                    )
                }
                else {
                    return (
                        <div key={message.id} className="flex flex-row items-center">
                            <div className="rounded-lg">
                                {message.content[0].text.value}
                            </div>
                        </div>
                    )
                }
            })}
        </div>
    )
}