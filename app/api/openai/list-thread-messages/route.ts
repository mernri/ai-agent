import { NextRequest, NextResponse } from 'next/server';
import { initOpenaiClient } from "@/app/utils/init";

// http://localhost:3000/api/openai/list-thread-messages
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');

    if (!threadId || typeof threadId !== 'string') {
        return NextResponse.json({ error: 'Thread ID is required and must be a string' }, { status: 400 });
    }

    try {
        const client = initOpenaiClient();
        const thread_messages = await client.beta.threads.messages.list(threadId);
        return NextResponse.json(thread_messages.data, { status: 200 });
    } catch (error) {
        console.error(`\n❌ Failed to fetch the list of messages associated to the thread ${threadId}: ${error}`);
        return NextResponse.json({ error: 'Failed to fetch the list of messages associated to the thread' }, { status: 500 });
    }
}
