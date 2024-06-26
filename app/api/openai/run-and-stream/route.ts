import { NextRequest, NextResponse } from 'next/server';
import { initOpenaiClient } from "@/app/utils/init";
import { OpenAI } from 'openai';
import { TOOLS_NAMES } from '@/lib/tools/tools_calls';

const handleToolCallCreated = (toolCall: OpenAI.Beta.Threads.Runs.FunctionToolCall) => {
    console.log(`\n🛠 Tool call created - tool call id: ${toolCall.id}`);
}

const handleToolCallDelta = (toolCallDelta: OpenAI.Beta.Threads.Runs.FunctionToolCallDelta, snapshot: any) => {
    if (toolCallDelta.function) {
        const { name: functionName, arguments: argumentsStr, output: functionOutput } = toolCallDelta.function;

        // Convert arguments string to array
        let functionArguments: any[] = [];
        if (argumentsStr) {
            try {
                functionArguments = JSON.parse(argumentsStr);
            } catch (error) {
                console.error("Error parsing arguments: ", error);
            }
        }

        // Vérifiez que functionName est défini et que c'est une clé dans TOOLS_NAMES
        if (functionName && functionName in TOOLS_NAMES) {
            const toolFunction = TOOLS_NAMES[functionName];
            const output = toolFunction(...functionArguments);
            console.log(`\n🛠 Tool call delta - function output: ${output}`);


        }

    }
}


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
                    const runStream = client.beta.threads.runs.stream(threadId, {
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
                        })
                        .on("toolCallCreated", (toolCall) => {
                            toolCall.type === "function" && handleToolCallCreated(toolCall)
                        })
                        .on("toolCallDelta", (toolCallDelta, snapshot) => {
                            toolCallDelta.type === "function" && handleToolCallDelta(toolCallDelta, snapshot)
                        })
                },
            })
        );

        return response;
    } catch (error) {
        console.error(`\n❌ Failed to create a run with streaming: ${error}`);
        return NextResponse.json({ error: 'Failed to create a run with streaming' }, { status: 500 });
    }
}


