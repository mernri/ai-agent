import { NextRequest, NextResponse } from 'next/server';
import { initOpenaiClient } from "@/app/utils/init";
import { OpenAI } from 'openai';

// POST /api/openai/run-and-stream
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
            max_prompt_tokens,
            max_completion_tokens,
            truncation_strategy,
            tool_choice,
            parallel_tool_calls,
            response_format
        }: Partial<OpenAI.Beta.Threads.Runs.RunCreateParams> & { threadId: string, assistant_id: string } = await req.json();

        const client = initOpenaiClient();

        // Start streaming response
        const response = new NextResponse(
            new ReadableStream({
                async start(controller) {
                    const runStream = await client.beta.threads.runs.stream(threadId, {
                        assistant_id,
                        model,
                        instructions,
                        additional_instructions,
                        additional_messages,
                        tools,
                        metadata,
                        temperature,
                        top_p,
                        max_prompt_tokens,
                        max_completion_tokens,
                        truncation_strategy,
                        tool_choice,
                        parallel_tool_calls,
                        response_format,
                    });

                    runStream
                        .on('textDelta', (textDelta) => {
                            controller.enqueue(textDelta.value);
                        })
                        .on('end', () => {
                            controller.close();
                        })
                        .on('error', (error) => {
                            console.error(`\n❌ Streaming error: ${error}`);
                            controller.error(error);
                        });
                },
            }),
            {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );

        return response;
    } catch (error) {
        console.error(`\n❌ Failed to create a run with streaming: ${error}`);
        return NextResponse.json({ error: 'Failed to create a run with streaming' }, { status: 500 });
    }
}


