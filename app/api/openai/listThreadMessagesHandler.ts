import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";

async function listThreadMessagesHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId } = req.query;

    if (!threadId || typeof threadId !== 'string') {
        return res.status(400).json({ error: 'Thread ID is required and must be a string' });
    }

    try {
        const client = initOpenaiClient();
        const thread_messages = await client.beta.threads.messages.list(threadId);
        res.status(200).json(thread_messages.data);
    } catch (error) {
        console.error(`\n❌ Failed to fetch the list of messages associated to the thread ${threadId}: ${error}`);
        res.status(500).json({ error: 'Failed to fetch the list of messages associated to the thread' });
    }
}

export default listThreadMessagesHandler;
