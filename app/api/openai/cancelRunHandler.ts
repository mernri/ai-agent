import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";

async function cancelRunHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId, runId } = req.body;

    if (!threadId || typeof threadId !== 'string' || !runId || typeof runId !== 'string') {
        return res.status(400).json({ error: 'Thread ID and Run ID are required and must be strings' });
    }

    try {
        const client = initOpenaiClient();
        const run = await client.beta.threads.runs.cancel(threadId, runId);
        res.status(200).json(run);
    } catch (error) {
        console.error(`\n❌ Failed to cancel the run: ${error}`);
        res.status(500).json({ error: 'Failed to cancel the run' });
    }
}

export default cancelRunHandler;
