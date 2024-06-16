import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";

async function fetchThreadHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId } = req.query;

    if (!threadId || typeof threadId !== 'string') {
        return res.status(400).json({ error: 'Thread ID is required and must be a string' });
    }

    try {
        const client = initOpenaiClient();
        const thread = await client.beta.threads.retrieve(threadId);
        res.status(200).json(thread);
    } catch (error) {
        console.error(`\n❌ Failed to retrieve the thread: ${error}`);
        res.status(500).json({ error: 'Failed to retrieve the thread' });
    }
}

export default fetchThreadHandler;
