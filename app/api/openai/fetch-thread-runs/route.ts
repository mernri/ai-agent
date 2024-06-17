import { NextRequest, NextResponse } from 'next/server';
import { initOpenaiClient } from "@/app/utils/init";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');

    if (!threadId || typeof threadId !== 'string') {
        return NextResponse.json({ error: 'Thread ID is required and must be a string' }, { status: 400 });
    }

    try {
        const client = initOpenaiClient();
        const runs = await client.beta.threads.runs.list(threadId);
        return NextResponse.json(runs, { status: 200 });
    } catch (error) {
        console.error(`\n❌ Failed to list thread runs: ${error}`);
        return NextResponse.json({ error: 'Failed to list thread runs' }, { status: 500 });
    }
}

