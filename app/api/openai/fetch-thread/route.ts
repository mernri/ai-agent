import { NextRequest, NextResponse } from 'next/server';
import { initOpenaiClient } from "@/app/utils/init";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
        return NextResponse.json({ error: 'Thread ID is required and must be a string' }, { status: 400 });
    }

    try {
        const client = initOpenaiClient();
        const thread = await client.beta.threads.retrieve(threadId);
        return NextResponse.json(thread, { status: 200 });
    } catch (error) {
        console.error(`\n❌ Failed to retrieve the thread: ${error}`);
        return NextResponse.json({ error: 'Failed to retrieve the thread' }, { status: 500 });
    }
}
