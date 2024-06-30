import { NextRequest, NextResponse } from 'next/server';
import { initOpenaiClient } from "@/app/utils/init";

// http://localhost:3000/api/openai/modify-thread
export async function POST(req: NextRequest) {
    try {
        const { threadId, tool_resources } = await req.json();
        const client = initOpenaiClient();
        const assistant = await client.beta.threads.update(threadId, { tool_resources });
        return NextResponse.json(assistant, { status: 200 });

    } catch (error) {
        console.error(`\n❌ Failed to modify the thread: ${error}`);
        return NextResponse.json({ error: 'Failed to modify the thread' }, { status: 500 });
    }
}
