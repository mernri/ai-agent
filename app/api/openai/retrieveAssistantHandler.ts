import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";

async function retrieveAssistantHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { assistant_id } = req.query;

    if (!assistant_id || typeof assistant_id !== 'string') {
        return res.status(400).json({ error: 'Assistant ID is required and must be a string' });
    }

    try {
        const client = initOpenaiClient();
        const assistant = await client.beta.assistants.retrieve(assistant_id);
        res.status(200).json(assistant);
    } catch (error) {
        console.error(`\n❌ Failed to retrieve the assistant: ${error}`);
        res.status(500).json({ error: 'Failed to retrieve the assistant' });
    }
}

export default retrieveAssistantHandler;