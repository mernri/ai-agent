import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";

async function addMessageToThreadHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId, content, role, attachment } = req.body;

    if (!threadId || !content || !role) {
        return res.status(400).json({ error: 'Thread ID, content, and role are required' });
    }

    try {
        const client = initOpenaiClient();
        const attachments = attachment ? [attachment] : null;
        const threadMessages = await client.beta.threads.messages.create(threadId, { content, role, attachments });
        res.status(200).json(threadMessages);
    } catch (error) {
        console.error(`\n❌ Failed to add message to thread: ${error}`);
        res.status(500).json({ error: 'Failed to add message to thread' });
    }
}


export default addMessageToThreadHandler;
