import OpenAI from "openai";

export const createAssistant = async (params: OpenAI.Beta.AssistantCreateParams): Promise<OpenAI.Beta.Assistant | null> => {
    try {
        const response = await fetch('/api/openai/create-assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: OpenAI.Beta.Assistant = await response.json();
        return data;
    } catch (error) {
        console.error(`\n❌ Failed to create an assistant: ${error}`);
        return null;
    }
};
export const createThread = async (params: Partial<OpenAI.Beta.Threads.ThreadCreateParams>): Promise<OpenAI.Beta.Threads.Thread | null> => {
    try {
        const response = await fetch('/api/openai/create-thread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: OpenAI.Beta.Threads.Thread = await response.json();
        return data;
    } catch (error) {
        console.error(`\n❌ Failed to create a thread: ${error}`);
        return null;
    }
};

export const addMessageToThread = async (params: {
    threadId: string;
    content: string;
    role: 'assistant' | 'user';
    attachment?: OpenAI.Beta.Threads.MessageCreateParams.Attachment;
}): Promise<OpenAI.Beta.Threads.Message | null> => {
    try {
        const response = await fetch('/api/openai/add-message-to-thread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: OpenAI.Beta.Threads.Message = await response.json();
        return data;
    } catch (error) {
        console.error(`\n❌ Failed to add message to thread: ${error}`);
        return null;
    }
};

export const fetchThread = async (threadId: string): Promise<OpenAI.Beta.Threads.Thread | null> => {
    try {
        const response = await fetch(`/api/openai/fetch-thread?threadId=${threadId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: OpenAI.Beta.Threads.Thread = await response.json();
        return data;
    } catch (error) {
        console.error(`\n❌ Failed to retrieve the thread: ${error}`);
        return null;
    }
};

export const listThreadMessages = async (threadId: string): Promise<OpenAI.Beta.Threads.Message[] | null> => {
    try {
        const response = await fetch(`/api/openai/list-thread-messages?threadId=${threadId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: OpenAI.Beta.Threads.Message[] = await response.json();
        return data;
    } catch (error) {
        console.error(`\n❌ Failed to fetch the list of messages associated to the thread: ${error}`);
        return null;
    }
};


export const runThread = async (params: {
    threadId: string,
    assistant_id: string,
    model?: string,
    instructions?: string | null,
    additional_instructions?: string | null,
    additional_messages?: any[] | null,
    tools?: any[] | null,
    metadata?: Record<string, any>,
    temperature?: number | null,
    top_p?: number | null,
    stream?: boolean | null,
    max_prompt_tokens?: number | null,
    max_completion_tokens?: number | null,
    truncation_strategy?: any,
    tool_choice?: string | any,
    parallel_tool_calls?: boolean,
    response_format?: string | any
}): Promise<any> => {
    try {
        const response = await fetch('/api/openai/run-thread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`\n❌ Failed to create a run: ${error}`);
        return null;
    }
};


export const runAndStream = async (params: {
    threadId: string,
    assistant_id: string,
    model?: string,
    instructions?: string | null,
    additional_instructions?: string | null,
    additional_messages?: any[] | null,
    tools?: any[] | null,
    metadata?: Record<string, any>,
    temperature?: number | null,
    top_p?: number | null,
    max_prompt_tokens?: number | null,
    max_completion_tokens?: number | null,
    truncation_strategy?: any,
    tool_choice?: string | any,
    parallel_tool_calls?: boolean,
    response_format?: string | any
}): Promise<ReadableStream | null> => {
    try {
        const response = await fetch('/api/openai/run-and-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                    reader?.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }
                        controller.enqueue(value);
                        push();
                    });
                }

                push();
            }
        });

        return stream;
    } catch (error) {
        console.error(`\n❌ Failed to run and stream: ${error}`);
        return null;
    }
};
