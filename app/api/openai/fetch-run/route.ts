import { NextRequest, NextResponse } from 'next/server';
import { initOpenaiClient } from "@/app/utils/init";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    const runId = searchParams.get('runId');

    if (!threadId || !runId) {
        return NextResponse.json({ error: 'Thread ID and Run ID are required' }, { status: 400 });
    }

    try {
        const client = initOpenaiClient();
        const runs = await client.beta.threads.runs.retrieve(threadId, runId);
        return NextResponse.json(runs, { status: 200 });
    } catch (error) {
        console.error(`\n❌ Failed to fetch thread run: ${error}`);
        return NextResponse.json({ error: 'Failed to fetch thread run' }, { status: 500 });
    }
}
