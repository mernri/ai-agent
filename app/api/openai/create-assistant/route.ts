import { NextRequest, NextResponse } from 'next/server';
import { initOpenaiClient } from "@/app/utils/init";
import { OpenAI } from 'openai';

// http://localhost:3000/api/openai/create-assistant
export async function POST(req: NextRequest) {
    try {
        const { name, instructions, model, tools, description, tool_resources, metadata, temperature, top_p, response_format }: OpenAI.Beta.AssistantCreateParams = await req.json();

        const client = initOpenaiClient();
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

        return NextResponse.json(assistant, { status: 200 });
    } catch (error) {
        console.error(`\n❌ Failed to create an assistant: ${error}`);
        return NextResponse.json({ error: 'Failed to create an assistant' }, { status: 500 });
    }
}
