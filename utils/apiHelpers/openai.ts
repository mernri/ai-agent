import OpenAI from "openai";

export const createThread = async (params: Partial<OpenAI.Beta.Threads.ThreadCreateParams>): Promise<OpenAI.Beta.Threads.Thread | null> => {
    try {
        const response = await fetch('/api/openai/createThreadHandler', {
            method: 'POST',
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
        console.error(`\n❌ Failed to create a thread: ${error}`);
        return null;
    }
};