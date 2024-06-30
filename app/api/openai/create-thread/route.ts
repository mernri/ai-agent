import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { initOpenaiClient } from "@/app/utils/init";

// http://localhost:3000/api/openai/create-thread
export async function POST(req: NextRequest) {
    try {
        const { messages, metadata, tool_resources }: Partial<OpenAI.Beta.Threads.ThreadCreateParams> = await req.json();

        const client = initOpenaiClient();

        const thread = await client.beta.threads.create({ messages, tool_resources, metadata });

        return NextResponse.json(thread, { status: 200 });
    } catch (error) {
        console.error(`\n❌ Failed to create a thread: ${error}`);
        return NextResponse.json({ error: 'Failed to create a thread' }, { status: 500 });
    }
}
