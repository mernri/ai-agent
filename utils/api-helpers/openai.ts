import OpenAI from "openai";
import path from 'path';

async function createVectorStore(directoryPath: string) {
    try {
        const response = await fetch('/api/openai/create-vector-store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ directoryPath }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Vector store created:', result);
        return result.vectorStoreId;
    } catch (error) {
        console.error('Error calling createVectorStore API:', error);
        return null;
    }
}

export async function createVectorStoreForSymbol(symbol: string): Promise<string | null> {
    const projectRoot = process.cwd();
    console.log('\nProject root:', projectRoot)
    const symbolDir = path.resolve('.', 'outputs', symbol);
    console.log('\nSymbol directory:', symbolDir)

    return await createVectorStore(symbolDir);
}


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

export const modifyThread = async (threadId: string, tool_resources: {}) => {
    try {
        const response = await fetch('/api/openai/modify-thread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ threadId, tool_resources }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Thread modified successfully:', data);
        return data;
    } catch (error) {
        console.error(`\n❌ Failed to modify the thread: ${error}`);
    }
}


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


export async function fetchThreadRuns(threadId: string) {
    try {
        const response = await fetch(`/api/openai/fetch-thread-runs?threadId=${threadId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('\n❌ Failed to fetch thread runs:', error);
    }
}


export async function cancelRun(threadId: string, runId: string) {
    try {
        const response = await fetch(`/api/openai/cancel-run?threadId=${threadId}&runId=${runId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(' Run canceled successfully:', data);
        return data;
    } catch (error) {
        console.error('\n❌ Failed to cancel run:', error);
    }
}



export async function fetchRun(threadId: string, runId: string) {
    try {
        const response = await fetch(`/api/openai/fetch-run?threadId=${threadId}&runId=${runId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Run fetched successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to fetch run:', error);
    }
}

