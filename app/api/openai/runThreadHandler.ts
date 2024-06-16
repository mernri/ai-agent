import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";
import OpenAI from 'openai';

async function runThreadHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId, body, options }: {
        threadId: string,
        body: OpenAI.Beta.Threads.Runs.RunCreateParams,
        options?: any // type RequestOptions (method, path, headers, maxRetries, etc..)
    } = req.body;

    if (!threadId || !body) {
        return res.status(400).json({ error: 'Thread ID and body are required' });
    }

    try {
        const client = initOpenaiClient();
        const run = await client.beta.threads.runs.create(threadId, body, options);
        res.status(200).json(run);
    } catch (error) {
        console.error(`\n❌ Failed to create run: ${error}`);
        res.status(500).json({ error: 'Failed to create run' });
    }
}

export default runThreadHandler;
