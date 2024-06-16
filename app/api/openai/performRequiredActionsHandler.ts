import type { NextApiRequest, NextApiResponse } from 'next';
import { initOpenaiClient } from "@/app/utils/init";
import { TOOLS_NAMES } from "@/lib/tools/tools_calls";

type ToolFunction = (...args: any[]) => any;

interface ToolsNames {
    [key: string]: ToolFunction;
}

async function performRequiredActionsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { run, toolsDict = TOOLS_NAMES } = req.body;

    if (!run) {
        return res.status(400).json({ error: 'Run data is required' });
    }

    const toolsOutputs: { tool_call_id: string; output: string }[] = [];
    const runToolsCalls = run.required_action ? run.required_action.submit_tool_outputs.tool_calls : [];

    try {
        const client = initOpenaiClient();

        for (const toolCall of runToolsCalls) {
            const functionName = toolCall.function.name;
            const functionToCall: ToolFunction = toolsDict[functionName];

            if (!functionToCall) {
                throw new Error(`No function found in TOOLS_NAMES with the name ${functionName}. Execution stopped.`);
            }

            console.log(`Calling ${functionName} with arguments: ${JSON.stringify(toolCall.function.arguments)}...`);

            const functionArguments = JSON.parse(toolCall.function.arguments);
            const functionOutput = await functionToCall(...Object.values(functionArguments));

            console.log(`${functionName} output: ${JSON.stringify(functionOutput).substring(0, 50)}...`);

            if (functionOutput) {
                toolsOutputs.push({
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(functionOutput)
                });
            } else {
                throw new Error(`No output returned by ${functionName}. Execution stopped.`);
            }
        }

        res.status(200).json({ success: true, toolsOutputs });
    } catch (error) {
        console.error(`Error processing function: ${error}`);
        res.status(500).json({ error: `Failed to perform required actions: ${error}` });
    }
}

export default performRequiredActionsHandler;
