import type { NextApiRequest, NextApiResponse } from 'next';

async function generateAssistantResponseHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { threadId, messageBody, body, withStreaming = false } = req.body;

    if (!threadId || !messageBody || !body) {
        return res.status(400).json({ error: 'Thread ID, messageBody, and body are required' });
    }

    console.log(`\n🏁 Starting the process of generating an OpenAI response to the user...`);

    try {
        // Fetch thread
        const fetchThreadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetchThreadHandler?threadId=${threadId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const thread = await fetchThreadResponse.json();
        if (!thread) {
            throw new Error(`\n❌ No thread found with ID ${threadId}`);
        }

        console.log(`\n🧵 We are about to add the user message to the thread and run it...`);
        const addUserMessageAndRunResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addUserMessageAndRunHandler`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ thread, userMessage: messageBody, body, withStreaming })
        });

        const { thread: updatedThread, tokenUsage } = await addUserMessageAndRunResponse.json();

        if (!updatedThread) {
            throw new Error(`\n❌ Failed to add user message (${messageBody.substring(0, 20)}...) and run the thread ID ${threadId}`);
        }

        console.log(`\n👍 User message successfully added to the thread ${threadId}!`);

        // List thread messages
        const listThreadMessagesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listThreadMessagesHandler?threadId=${threadId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const threadMessages = await listThreadMessagesResponse.json();
        const assistantMessages = threadMessages.filter((msg: any) => msg.role === 'assistant');

        if (assistantMessages.length > 0) {
            const assistantResponse = assistantMessages[0].content[0].type === "text" ? assistantMessages[0].content[0].text.value : '';
            console.log(`\n👍 Successfully generated the following assistant response: ${assistantResponse.substring(0, 40)}...`);

            // Retrieve assistant to confirm existence
            const retrieveAssistantResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/retrieveAssistantHandler?assistant_id=${body?.assistant_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const assistantCalled = await retrieveAssistantResponse.json();

            if (!assistantCalled) {
                throw new Error(`\n❌ No assistant found with ID ${body?.assistant_id}`);
            }

            res.status(200).json({ assistantResponse, tokenUsage });
        } else {
            console.error(`\n❌ Error generating the assistant response!`);
            res.status(500).json({ error: 'Error generating the assistant response' });
        }
    } catch (error) {
        console.error(`\n❌ An unexpected error occurred: ${error}`);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
}

export default generateAssistantResponseHandler;
