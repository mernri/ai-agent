import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";

async function handleRunWithRequiredActionsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { run, thread } = req.body;

    if (!run || !thread) {
        return res.status(400).json({ error: 'Run and thread data are required' });
    }

    try {
        // Appeler le endpoint performRequiredActions
        const performRequiredActionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/performRequiredActionsHandler`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ run })
        });

        const { success, toolsOutputs } = await performRequiredActionsResponse.json();

        if (success) {
            try {
                const client = initOpenaiClient();
                const run_with_required_actions = await client.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
                    tool_outputs: toolsOutputs
                });
                res.status(200).json(run_with_required_actions);
            } catch (error) {
                console.error(`\n❌ Failed to submit tool outputs to run ${run.id} associated to the thread ${thread.id}: ${error}`);
                throw error;
            }
        } else {
            // Appeler le endpoint cancelRun
            const cancelRunResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cancelRunHandler`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ threadId: thread.id, runId: run.id })
            });

            const cancelRunResult = await cancelRunResponse.json();

            if (cancelRunResponse.ok) {
                console.error(`\n❌ Failed at performing required actions - RUN CANCELED`);
            } else {
                console.error(`\n❌ Failed to cancel the run: ${cancelRunResult.error}`);
                return res.status(500).json({ error: `Failed to cancel the run: ${cancelRunResult.error}` });
            }
        }

        // Appeler le endpoint waitOnRun
        const waitOnRunResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/waitOnRunHandler`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ run, thread })
        });

        const updatedRun = await waitOnRunResponse.json();

        res.status(200).json(updatedRun);
    } catch (error) {
        console.error(`\n❌ Failed to handle run with required actions: ${error}`);
        res.status(500).json({ error: 'Failed to handle run with required actions' });
    }
}

export default handleRunWithRequiredActionsHandler;
