import { OpenAI } from "openai";
import { TOOLS_NAMES } from "../../lib/tools/tools_calls";

export const getOpenaiClient = () => {
    const openai_api_key = process.env.OPENAI_API_KEY
    const client = new OpenAI({ apiKey: openai_api_key, timeout: 1000, maxRetries: 3 });
    return client
};

export const createAssistant = async ({
    name,
    instructions,
    model,
    tools = [],
    description = null,
    tool_resources = null,
    metadata = null,
    temperature = null,
    top_p = null,
    response_format = "auto"
}: OpenAI.Beta.AssistantCreateParams) => {
    const client = getOpenaiClient();

    try {
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
        return assistant;
    } catch (error) {
        console.error(`\n❌ Failed to create an assistant: ${error}`);
        throw error;
    }
};

export const updateAssistant = async ({ assistant_id, params }:
    { assistant_id: string, params: OpenAI.Beta.AssistantUpdateParams }) => {

    const client = getOpenaiClient();

    const payload = Object.entries(params).reduce((acc: Record<string, any>, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {} as OpenAI.Beta.AssistantUpdateParams);

    try {
        const updatedAssistant = await client.beta.assistants.update(assistant_id, payload);
        return updatedAssistant;
    } catch (error) {
        console.error(`\n❌ Failed to update the assistant: ${error}`);
        throw error;
    }
};

export const createThread = async ({
    messages,
    metadata,
    tool_resources,
}: Partial<OpenAI.Beta.Threads.ThreadCreateParams>) => {
    const client = getOpenaiClient();

    try {
        const thread = await client.beta.threads.create({ messages, metadata, tool_resources });
        return thread;
    } catch (error) {
        console.error(`\n❌ Failed to create a thread: ${error}`);
        throw error;
    }
};

export const retrieveAssistant = async (assistant_id: string) => {
    const client = getOpenaiClient();
    try {
        const assistant = await client.beta.assistants.retrieve(assistant_id);
        return assistant;
    } catch (error) {
        console.error(`\n❌ Failed to retrieve the assistant: ${error}`);
        throw error;
    }
};

export const addMessageToThread = async ({
    threadId,
    content,
    role,
    attachment
}: {
    threadId: string;
    content: string;
    role: 'assistant' | 'user';
    attachment?: OpenAI.Beta.Threads.MessageCreateParams.Attachment
}) => {
    const client = getOpenaiClient();
    const attachments = attachment ? [attachment] : null;

    try {
        const threadMessages = await client.beta.threads.messages.create(threadId, { content, role, attachments });
        return threadMessages;
    } catch (error) {
        console.error(`\n❌ Failed to add message to thread: ${error}`);
        throw error;
    }
};

export const fetchThread = async (threadId: string) => {
    const client = getOpenaiClient();
    try {
        const thread = await client.beta.threads.retrieve(threadId);
        return thread;
    } catch (error) {
        console.error(`\n❌ Failed to retrieve the thread: ${error}`);
        throw error;
    }
};

export const listThreadMessages = async (threadId: string) => {
    const client = getOpenaiClient();
    try {
        const thread_messages = await client.beta.threads.messages.list(threadId)
        return thread_messages.data;
    } catch (error) {
        console.error(`\n❌ Failed to fetch the list of messages associated to the thread ${threadId}: ${error}`);
        throw error;
    }
};

export const fetchThreadRuns = async ({
    threadId,
    before,
    order
}: {
    threadId: string;
    before?: string;
    order?: "asc" | "desc";
}) => {
    const client = getOpenaiClient();

    try {
        // Build query string 
        const queryParams = new URLSearchParams();
        if (before) queryParams.append('before', before);
        if (order) queryParams.append('order', order);
        const queryString = queryParams.toString();

        // Fetch thread runs
        const runs = await client.beta.threads.runs.list(`${threadId}?${queryString}`);
        return runs.data;

    } catch (error) {
        console.error(`\n❌ Failed to list thread runs: ${error}`);
        throw error;
    }
};

export const listRunSteps = async ({
    threadId,
    runId,
    query,
    options
}: {
    threadId: string;
    runId: string;
    query?: OpenAI.Beta.Threads.Runs.Steps.StepListParams;
    options?: any; // type RequestOptions (method, path, headers, maxRetries, etc..)
}) => {
    const client = getOpenaiClient();

    try {
        const queryParams = query ? new URLSearchParams(query as any).toString() : '';
        const runSteps = await client.beta.threads.runs.steps.list(threadId, runId, query, options);
        return runSteps;
    } catch (error) {
        console.error(`\n❌ Failed to list run steps: ${error}`);
        throw error;
    }
};

export const cancelRun = async ({ threadId, runId }: {
    threadId: string; runId: string
}) => {
    const client = getOpenaiClient();
    try {
        const run = await client.beta.threads.runs.cancel(threadId, runId);
        return run;
    } catch (error) {
        console.error(`\n❌ Failed to cancel the run: ${error}`);
        throw error;
    }
};


export const waitOnRun = async ({ run, thread }: { run: OpenAI.Beta.Threads.Runs.Run, thread: OpenAI.Beta.Threads.Thread }) => {
    const client = getOpenaiClient();
    while (run.status === 'queued' || run.status === 'in_progress' || run.status === 'cancelling') {
        await listRunSteps({ threadId: thread.id, runId: run.id });
        try {
            run = await client.beta.threads.runs.retrieve(thread.id, run.id);
            console.log(`\n⏳ Waiting 0.8 seconds for the run ${run.id} to complete. Ongoing Run Status is : ${run.status}`);
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
            console.error(`\n❌ The run failed because of the following OpenAI error : ${error}`);
        }
    }
    console.log(`\n💨 We exited the wait while loop! the run status is : ${run.status}`);
    return run;
};


type ToolFunction = (...args: any[]) => any;
interface ToolsNames {
    [key: string]: ToolFunction;
}

export const performRequiredActions = async ({ run, toolsDict = TOOLS_NAMES }: { run: OpenAI.Beta.Threads.Run, toolsDict?: ToolsNames }) => {
    const toolsOutputs: { tool_call_id: string; output: string }[] = [];
    const runToolsCalls = run.required_action ? run.required_action.submit_tool_outputs.tool_calls : [];

    for (const toolCall of runToolsCalls) {
        const functionName = toolCall.function.name;
        const functionToCall = toolsDict.get(functionName);

        if (!functionToCall) {
            throw new Error(`❌ No function found in TOOLS_NAMES with the name ${functionName}. Execution stopped.`);
        }

        console.log(`🚧 Calling ${functionName} with arguments: ${toolCall.function.arguments}...`);

        try {
            const functionArguments = JSON.parse(toolCall.function.arguments);
            const functionOutput = await functionToCall(...Object.values(functionArguments));

            console.log(`🚧 ${functionName} output: ${JSON.stringify(functionOutput).substring(0, 50)}...`);

            if (functionOutput) {
                toolsOutputs.push({
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(functionOutput)
                });
            } else {
                throw new Error(`❌ No output returned by ${functionName}. Execution stopped.`);
            }
        } catch (error) {
            console.error(`Error processing function ${functionName}: ${error}`);
            throw error;
        }
    }

    return { success: true, toolsOutputs };
};


export const handleRunWithRequiredActions = async ({ run, thread }: { run: OpenAI.Beta.Threads.Runs.Run, thread: OpenAI.Beta.Threads.Thread }) => {
    const client = getOpenaiClient();
    const { success, toolsOutputs } = await performRequiredActions({ run });
    if (success) {
        try {
            console.log(`\n🚧 Submitting tool outputs for run ${run.id} and thread ${thread.id}`);
            const run_with_required_actions = await client.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
                tool_outputs: toolsOutputs
            });
            return run_with_required_actions
        } catch (error) {
            console.error(`\n❌ Failed to submit tool outputs to run ${run.id} associated to the thread ${thread.id}: ${error}`);
            throw error;
        }
    } else {
        run = await cancelRun({ threadId: thread.id, runId: run.id });
        console.error(`\n❌ Failed at performing required actions - RUN CANCELED`);
    }

    run = await waitOnRun({ run: run, thread: thread });

    return run;
};


export const runThread = async ({ threadId, body, options }: {
    threadId: string,
    body: OpenAI.Beta.Threads.Runs.RunCreateParams,
    options?: any // type RequestOptions (method, path, headers, maxRetries, etc..)
}): Promise<any> => { // Can return a Run or a StreamEvent
    const client = getOpenaiClient();

    try {
        const run = await client.beta.threads.runs.create(threadId, body, options);
        return run;
    } catch (error) {
        console.error(`\n❌ Failed to create run: ${error}`);
        throw error;
    }
};


export const addUserMessageAndRun = async ({ thread, userMessage, body, withStreaming = false }
    : {
        thread: OpenAI.Beta.Threads.Thread,
        userMessage: string,
        body: OpenAI.Beta.Threads.Runs.RunCreateParams, // additional_instructions, assistant_id, additional_messages, instructions, max_completion_tokens, max_prompt_tokens, model, parallel_tool_calls
        withStreaming?: boolean
    }) => {
    try {
        const threadId = thread.id;
        const runs = await fetchThreadRuns({ threadId });

        if (runs && runs.length > 0) {
            console.log(`\n🚧 There are ${runs.length} runs in the thread ${threadId}.`);
            let lastRun = runs[0];

            if (lastRun) {
                if (lastRun.status === "requires_action") {
                    lastRun = await handleRunWithRequiredActions({ run: lastRun, thread: thread });
                }

                if (["queued", "in_progress", "cancelling"].includes(lastRun.status)) {
                    lastRun = await waitOnRun({ run: lastRun, thread: thread });
                }

                console.log(`\n🚧 The last run status is now : ${lastRun.status}`);
            }
        }

        console.log(`\n🚧 Adding the following user message to the thread: ${userMessage.substring(0, 30)}...`);
        await addMessageToThread({ threadId, content: userMessage, role: "user" });

        body.stream = withStreaming ? true : false;
        const run = await runThread({ threadId: threadId, body: body });
        let finalRun = await waitOnRun({ run: run, thread: thread });

        await listRunSteps({ threadId: threadId, runId: finalRun.id });

        if (finalRun.status === "requires_action") {
            console.log(`\n🚧 Handling run ${finalRun.id} with required actions...\n`);
            finalRun = await handleRunWithRequiredActions({ run: finalRun, thread: thread });
        }
        const tokenUsage = finalRun.usage;

        return { thread, tokenUsage };
    } catch (error) {
        console.error(`\n❌ Failed to add user message or run for thread ID ${thread.id}: ${error}\n`);
        throw error;
    }
}


export const generateAssistantResponse = async ({ threadId, messageBody, body, withStreaming = false }:
    {
        threadId: string,
        messageBody: string,
        body: OpenAI.Beta.Threads.Runs.RunCreateParams,
        withStreaming?: boolean
    }) => {
    console.log(`\n🏁 Starting the process of generating an OpenAI response to the user...`);

    try {
        const thread = await fetchThread(threadId);
        if (!thread) {
            throw new Error(`\n❌ No thread found with ID ${threadId}`);
        }

        console.log(`\n🧵 We are about to add the user message to the thread and run it...`);
        const { thread: updatedThread, tokenUsage } = await addUserMessageAndRun({ thread: thread, userMessage: messageBody, body: body, withStreaming: withStreaming });

        if (!updatedThread) {
            throw new Error(`\n❌ Failed to add user message (${messageBody.substring(0, 20)}...) and run the thread ID ${threadId}`);
        }

        console.log(`\n👍 User message successfully added to the thread ${threadId}!`);

        const threadMessages = await listThreadMessages(threadId);
        const assistantMessages = threadMessages.filter((msg: any) => msg.role === 'assistant');

        if (assistantMessages.length > 0) {
            const assistantResponse = assistantMessages[0].content[0].type == "text" ? assistantMessages[0].content[0].text.value : ''
            console.log(`\n👍 Successfully generated the following assistant response: ${assistantResponse.substring(0, 40)}...`);

            const assistantCalled = await retrieveAssistant(body?.assistant_id);

            if (!assistantCalled) {
                throw new Error(`\n❌ No assistant found with ID ${body?.assistant_id}`)
            }

            return assistantResponse.substring(0, 4095);
        } else {
            console.error(`\n❌ Error generating the assistant response!`);
            return null;
        }
    } catch (error) {
        console.error(`\n❌ An unexpected error occurred: ${error}`);
        throw error;
    }
};
