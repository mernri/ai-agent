import OpenAI from "openai";
import { TOOLS_NAMES } from "../tools/tools_calls";
import { today } from "../utils";

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

export const updateAssistant = async ({ assistant_id, params }: { assistant_id: string, params: OpenAI.Beta.AssistantUpdateParams }) => {
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

export const createThread = async (params: OpenAI.Beta.ThreadCreateParams) => {
    const client = getOpenaiClient();

    try {
        const thread = await client.beta.threads.create(params);
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

export const addMessageToThread = async (threadId: string, message: OpenAI.Beta.Threads.MessageContent) => {
    const client = getOpenaiClient();

    try {
        const threadMessages = await client.beta.threads.messages.create(threadId, message);
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

export const fetchThreadRuns = async (threadId: string, params?: OpenAI.Beta.Threads.RunListParams) => {
    const client = getOpenaiClient();

    try {
        // Build query string from parameters object
        const queryParams = new URLSearchParams(params as any).toString();
        const runs = await client.beta.threads.runs.list(`${threadId}?${queryParams}`);
        return runs;

    } catch (error) {
        console.error(`\n❌ Failed to list thread runs: ${error}`);
        throw error;
    }
};

export const listRunSteps = async (threadId: string, runId: string, params?: OpenAI.Beta.Threads.Runs.Steps.StepListParams) => {
    const client = getOpenaiClient();

    try {
        const queryParams = new URLSearchParams(params as any).toString();
        const runSteps = await client.beta.threads.runs.steps.list(threadId, runId, queryParams);
        return runSteps;
    } catch (error) {
        console.error(`\n❌ Failed to list run steps: ${error}`);
        throw error;
    }
};


export const cancelRun = async (threadId: string, runId: string) => {
    const client = getOpenaiClient();
    try {
        const run = await client.beta.threads.runs.cancel(threadId, runId);
        return run;
    } catch (error) {
        console.error(`\n❌ Failed to cancel the run: ${error}`);
        throw error;
    }
};


// TODO : A UPDATER ? 

export const waitOnRun = async (run: any, thread: any) => {
    const client = getOpenaiClient();
    while (run.status === 'queued' || run.status === 'in_progress' || run.status === 'cancelling') {
        await listRunSteps(thread.id, run.id);
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
export const performRequiredActions = async (run: OpenAI.Beta.Threads.Run, toolsDict: ToolsNames = TOOLS_NAMES) => {
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


// TODO : A UPDATER ? 
export const handleRunWithRequiredActions = async (run: any, thread: any) => {
    const client = getOpenaiClient();
    const { success, toolsOutputs } = await performRequiredActions(run);
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
        run = await cancelRun(thread.id, run.id);
        console.error(`\n❌ Failed at performing required actions - RUN CANCELED`);
    }

    run = await waitOnRun(run, thread);

    return run;
};


export const runThread = async (threadId: string, params: any) => {
    const client = getOpenaiClient();

    try {
        const run = await client.beta.threads.runs.create(threadId, params);
        return run;
    } catch (error) {
        console.error(`\n❌ Failed to create run: ${error}`);
        throw error;
    }
};


// TODO : A UPDATER 
export const addUserMessageAndRun = async (thread: any, userMessage: OpenAI.Beta.Threads.MessageContent, assistantId: string, additionalInstructions: string | null = null) => {
    try {
        const threadId = thread.id;
        const runs = await fetchThreadRuns(threadId);
        if (runs && runs.length > 0) {
            console.log(`\n🚧 There are ${runs.length} runs in the thread ${threadId}.`);
            let lastRun = runs[0];

            if (lastRun) {
                if (lastRun.status === "requires_action") {
                    lastRun = await handleRunWithRequiredActions(lastRun, thread);
                }

                if (["queued", "in_progress", "cancelling"].includes(lastRun.status)) {
                    lastRun = await waitOnRun(lastRun, thread);
                }

                console.log(`\n🚧 The last run status is now : ${lastRun.status}`);
            }
        }

        console.log(`\n🚧 Adding the following user message to the thread: ${userMessage.substring(0, 30)}...`);
        await addMessageToThread(threadId, userMessage);

        const { run, assistantId: openaiAssistantId } = await runThread(threadId, assistantId, additionalInstructions);
        let finalRun = await waitOnRun(run, thread);

        await listRunSteps(threadId, finalRun.id);

        if (finalRun.status === "requires_action") {
            console.log(`\n🚧 Handling run ${finalRun.id} with required actions...\n`);
            finalRun = await handleRunWithRequiredActions(finalRun, thread);
        }
        const tokenUsage = finalRun.usage;

        return { thread, openaiAssistantId, tokenUsage };
    } catch (error) {
        console.error(`\n❌ Failed to add user message or run for thread ID ${thread.id}: ${error}\n`);
        throw error;
    }
}

// TODO : A UPDATER 
export const generateAssistantResponse = async (threadId: string, messageBody: OpenAI.Beta.Threads.MessageContent, messageId: string, assistantId: string) => {
    console.log(`\n🏁 Starting the process of generating an OpenAI response to the user...`);

    const currentDate = today();
    const additionalInstructions = `Today is ${currentDate}.`;

    try {
        const thread = await fetchThread(threadId);
        if (!thread) {
            throw new Error(`\n❌ No thread found with ID ${threadId}`);
        }

        console.log(`\n🧵 We are about to add the user message to the thread and run it...`);
        const { thread: updatedThread, openaiAssistantId, tokenUsage } = await addUserMessageAndRun(thread, messageBody, assistantId, additionalInstructions);

        if (!updatedThread) {
            throw new Error(`\n❌ Failed to add user message (${messageBody.substring(0, 20)}...) and run the thread ID ${threadId}`);
        }

        console.log(`\n👍 User message successfully added to the thread ${threadId}!`);

        const threadMessages = await listThreadMessages(threadId);
        const assistantMessages = threadMessages.filter((msg: any) => msg.role === 'assistant');

        if (assistantMessages.length > 0) {
            const assistantResponse = assistantMessages[0].content[0].type == "text" ? assistantMessages[0].content[0].text.value : ''
            console.log(`\n👍 Successfully generated the following assistant response: ${assistantResponse.substring(0, 40)}...`);

            const assistantCalled = await retrieveAssistant(openaiAssistantId);

            if (!assistantCalled) {
                throw new Error(`\n❌ No assistant found with ID ${openaiAssistantId}`)
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
