import { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init"
import OpenAI from 'openai';

async function CreateAssistantHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = initOpenaiClient();
        const { name,
            instructions,
            model,
            tools,
            description,
            tool_resources,
            metadata,
            temperature,
            top_p,
            response_format
        }: OpenAI.Beta.AssistantCreateParams = req.body;
        const assistant = await client.beta.assistants.create({
            name,
            instructions,
            description,
            tools,
            tool_resources,
            metadata,
            temperature,
            top_p,
            response_format,
            model,
        });
        res.status(200).json(assistant);
    } catch (error) {
        console.error(`\n❌ Failed to create an assistant: ${error}`);
        res.status(500).json({ error: 'Failed to create an assistant' });
    }
}

export default CreateAssistantHandler;