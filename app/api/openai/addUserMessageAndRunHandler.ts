// /app/api/addUserMessageAndRunHandler.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

async function addUserMessageAndRunHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { thread, userMessage, body, withStreaming = false }:
        {
            thread: OpenAI.Beta.Threads.Thread,
            userMessage: string,
            body: OpenAI.Beta.Threads.Runs.RunCreateParams, // additional_instructions, assistant_id, additional_messages, instructions, max_completion_tokens, max_prompt_tokens, model, parallel_tool_calls
            withStreaming?: boolean
        } = req.body;

    if (!thread || !userMessage || !body) {
        return res.status(400).json({ error: 'Thread, userMessage, and body are required' });
    }

    try {
        const threadId = thread.id;

        // Fetch thread runs
        const fetchThreadRunsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetchThreadRunsHandler`, {
            method: 'POST',  // Assuming POST is used for fetching runs
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ threadId })
        });

        const runs = await fetchThreadRunsResponse.json();

        if (runs && runs.length > 0) {
            console.log(`\n🚧 There are ${runs.length} runs in the thread ${threadId}.`);
            let lastRun = runs[0];

            if (lastRun) {
                if (lastRun.status === "requires_action") {
                    const handleRunWithRequiredActionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/handleRunWithRequiredActionsHandler`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ run: lastRun, thread })
                    });

                    lastRun = await handleRunWithRequiredActionsResponse.json();
                }

                if (["queued", "in_progress", "cancelling"].includes(lastRun.status)) {
                    const waitOnRunResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/waitOnRunHandler?threadId=${threadId}&runId=${lastRun.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    lastRun = await waitOnRunResponse.json();
                }

                console.log(`\n🚧 The last run status is now : ${lastRun.status}`);
            }
        }

        console.log(`\n🚧 Adding the following user message to the thread: ${userMessage.substring(0, 30)}...`);
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addMessageToThreadHandler`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ threadId, content: userMessage, role: "user" })
        });

        body.stream = withStreaming ? true : false;
        const runThreadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/runThreadHandler`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ threadId: threadId, body: body })
        });

        let run = await runThreadResponse.json();
        let finalRunResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/waitOnRunHandler?threadId=${threadId}&runId=${run.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let finalRun = await finalRunResponse.json();

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listRunStepsHandler?threadId=${threadId}&runId=${finalRun.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (finalRun.status === "requires_action") {
            console.log(`\n🚧 Handling run ${finalRun.id} with required actions...\n`);
            const handleRunWithRequiredActionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/handleRunWithRequiredActionsHandler`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ run: finalRun, thread })
            });

            finalRun = await handleRunWithRequiredActionsResponse.json();
        }

        const tokenUsage = finalRun.usage;

        res.status(200).json({ thread, tokenUsage });
    } catch (error) {
        console.error(`\n❌ Failed to add user message or run for thread ID ${thread.id}: ${error}\n`);
        res.status(500).json({ error: 'Failed to add user message or run' });
    }
}

export default addUserMessageAndRunHandler;
