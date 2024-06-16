import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";

async function waitOnRunHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId, runId } = req.query;

    if (!threadId || typeof threadId !== 'string' || !runId || typeof runId !== 'string') {
        return res.status(400).json({ error: 'Thread ID and Run ID are required and must be strings' });
    }

    try {
        const client = initOpenaiClient();
        let run = await client.beta.threads.runs.retrieve(threadId, runId);

        while (run.status === 'queued' || run.status === 'in_progress' || run.status === 'cancelling') {
            console.log(`\n⏳ Waiting 0.8 seconds for the run ${run.id} to complete. Ongoing Run Status is : ${run.status}`);
            await new Promise(resolve => setTimeout(resolve, 800));  // Simulate wait
            run = await client.beta.threads.runs.retrieve(threadId, runId);
        }

        console.log(`\n💨 We exited the wait while loop! the run status is : ${run.status}`);
        res.status(200).json(run);
    } catch (error) {
        console.error(`\n❌ The run failed because of the following OpenAI error : ${error}`);
        res.status(500).json({ error: 'Failed to wait on the run' });
    }
}

export default waitOnRunHandler;
