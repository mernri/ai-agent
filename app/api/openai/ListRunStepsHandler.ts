import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";

async function listRunStepsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId, runId } = req.query;
    const query = req.query.query ? JSON.parse(req.query.query as string) : undefined;
    const options = req.query.options ? JSON.parse(req.query.options as string) : undefined;

    if (!threadId || typeof threadId !== 'string' || !runId || typeof runId !== 'string') {
        return res.status(400).json({ error: 'Thread ID and Run ID are required and must be strings' });
    }

    try {
        const client = initOpenaiClient();
        const runSteps = await client.beta.threads.runs.steps.list(threadId, runId, query, options);
        res.status(200).json(runSteps);
    } catch (error) {
        console.error(`\n❌ Failed to list run steps: ${error}`);
        res.status(500).json({ error: 'Failed to list run steps' });
    }
}

export default listRunStepsHandler;
