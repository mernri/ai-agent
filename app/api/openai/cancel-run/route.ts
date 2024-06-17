import { NextRequest, NextResponse } from 'next/server';
import { initOpenaiClient } from "@/app/utils/init";

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    const runId = searchParams.get('runId');

    console.log('\nℹ️ Canceling run:', { threadId, runId });

    if (!threadId || !runId) {
        return NextResponse.json({ error: 'Thread ID and Run ID are required' }, { status: 400 });
    }

    try {
        const client = initOpenaiClient();
        const run = await client.beta.threads.runs.cancel(threadId, runId);
        console.log('\n✅ Run canceled successfully:', run);
        return NextResponse.json(run, { status: 200 });
    } catch (error) {
        console.error(`\n❌ Failed to cancel the run: ${error}`);
        return NextResponse.json({ error: 'Failed to cancel the run' }, { status: 500 });
    }
}