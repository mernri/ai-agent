import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from "openai";
import { initOpenaiClient } from "@/app/utils/init";

async function updateAssistantHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { assistant_id, params }: { assistant_id: string; params: OpenAI.Beta.AssistantUpdateParams } = req.body;

    if (!assistant_id) {
        return res.status(400).json({ error: 'Assistant ID is required' });
    }

    try {
        const client = initOpenaiClient();
        const payload = Object.entries(params).reduce((acc: Record<string, any>, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as OpenAI.Beta.AssistantUpdateParams);

        const updatedAssistant = await client.beta.assistants.update(assistant_id, payload);
        res.status(200).json(updatedAssistant);
    } catch (error) {
        console.error(`\n❌ Failed to update the assistant: ${error}`);
        res.status(500).json({ error: 'Failed to update the assistant' });
    }
}

export default updateAssistantHandler;