import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";

async function fetchThreadRunsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const threadId = req.query.threadId as string;
    const query = req.query.query ? JSON.parse(req.query.query as string) : undefined;

    if (!threadId) {
        return res.status(400).json({ error: 'Thread ID is required' });
    }

    try {
        const client = initOpenaiClient();
        const runs = await client.beta.threads.runs.list(threadId, query);
        res.status(200).json(runs.data);
    } catch (error) {
        console.error(`\n❌ Failed to list thread runs: ${error}`);
        res.status(500).json({ error: 'Failed to list thread runs' });
    }
}

export default fetchThreadRunsHandler;
