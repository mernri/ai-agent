import { NextRequest, NextResponse } from 'next/server';
import { initOpenaiClient } from "@/app/utils/init";
import { OpenAI } from 'openai';

export async function POST(req: NextRequest) {
    try {
        const {
            threadId,
            assistant_id,
            model,
            instructions,
            additional_instructions,
            additional_messages,
            tools,
            metadata,
            temperature,
            top_p,
            stream,
            max_prompt_tokens,
            max_completion_tokens,
            truncation_strategy,
            tool_choice,
            parallel_tool_calls,
            response_format
        }: Partial<OpenAI.Beta.Threads.Runs.RunCreateParams> & { threadId: string } = await req.json();

        const client = initOpenaiClient();

        let run;
        if (stream) {
            run = await client.beta.threads.runs.create(threadId, {
                assistant_id,
                model,
                instructions,
                additional_instructions,
                additional_messages,
                tools,
                metadata,
                temperature,
                top_p,
                stream,
                max_prompt_tokens,
                max_completion_tokens,
                truncation_strategy,
                tool_choice,
                parallel_tool_calls,
                response_format
            } as OpenAI.Beta.Threads.Runs.RunCreateParamsStreaming);

            const events = [];
            for await (const event of run) {
                events.push(event);
            }

            return NextResponse.json(events, { status: 200 });
        } else {
            run = await client.beta.threads.runs.create(threadId, {
                assistant_id,
                model,
                instructions,
                additional_instructions,
                additional_messages,
                tools,
                metadata,
                temperature,
                top_p,
                stream,
                max_prompt_tokens,
                max_completion_tokens,
                truncation_strategy,
                tool_choice,
                parallel_tool_calls,
                response_format
            } as OpenAI.Beta.Threads.Runs.RunCreateParamsNonStreaming);

            return NextResponse.json(run, { status: 200 });
        }
    } catch (error) {
        console.error(`\n❌ Failed to create a run: ${error}`);
        return NextResponse.json({ error: 'Failed to create a run' }, { status: 500 });
    }
}
